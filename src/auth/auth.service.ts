import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { EXPIRY_TIME_IN_MINS, JWT_SECRET } from 'src/shared/constants/jwt';
import { HelperServices } from 'src/shared/helper/helper.services';
import {
  BCRYPT_SALT_ROUNDS,
  EMAIL_PASS,
  EMAIL_USER,
  OTP_EXPIRY_TIME_IN_MINS,
} from 'src/shared/constants/constant';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private helperServices: HelperServices,
  ) {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  private jwtSecret = JWT_SECRET;

  async validateUser(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      return user;
    }

    return null;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: pwd, ...safeUser } = user;

    const payload = {
      ...safeUser,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: `${EXPIRY_TIME_IN_MINS.USER_TOKEN as number}m`,
    });

    return { token };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User Not Found');

    const otp = this.helperServices.generateOTP();
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_TIME_IN_MINS * 60 * 1000,
    );

    const existing = await this.prisma.passwordReset.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      await this.prisma.passwordReset.update({
        where: { id: existing.id },
        data: { otp, expiresAt },
      });
    } else {
      await this.prisma.passwordReset.create({
        data: { email, otp, expiresAt },
      });
    }

    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(email: string, otp: string) {
    const record = await this.prisma.passwordReset.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new BadRequestException('OTP not found');
    if (record.expiresAt < new Date())
      throw new BadRequestException('OTP is invalid or expired');
    if (record.otp !== otp) {
      throw new UnauthorizedException('OTP is invalid or expired');
    } else {
      await this.prisma.passwordReset.update({
        where: { id: record.id },
        data: { isVerified: true },
      });
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, newPassword: string) {
    const record = await this.prisma.passwordReset.findFirst({
      where: { email, isVerified: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new BadRequestException('OTP verification required');

    const hashed = await bcrypt.hash(
      newPassword,
      Number(BCRYPT_SALT_ROUNDS) || 10,
    );

    await this.prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    await this.prisma.passwordReset.delete({
      where: { id: record.id },
    });

    return { message: 'Password reset successfully' };
  }
}
