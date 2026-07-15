import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { HelperServices } from 'src/shared/helper/helper.services';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Mock bcrypt and jwt
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let helperServices: HelperServices;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn() as any,
      update: jest.fn() as any,
    },
    passwordReset: {
      findFirst: jest.fn() as any,
      create: jest.fn() as any,
      update: jest.fn() as any,
      delete: jest.fn() as any,
    },
  } as any;

  const mockHelperServices = {
    generateOTP: jest.fn() as any,
  } as any;

  const mockTransporter = {
    sendMail: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HelperServices, useValue: mockHelperServices },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    helperServices = module.get<HelperServices>(HelperServices);

    // Mock the transporter
    (service as any).transporter = mockTransporter;

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword',
        phone: '1234567890',
        phoneCode: '+1',
        roleId: 1,
        statusId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com');

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      phone: '1234567890',
      phoneCode: '+1',
      roleId: 1,
      statusId: 1,
      createdBy: null,
      createdAt: new Date(),
      updatedBy: null,
      updatedAt: new Date(),
    };

    it('should return a token when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const token = 'jwt-token-123';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = await service.login(email, password);

      expect(result).toEqual({ token });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login('nonexistent@example.com', 'password123'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should exclude password from token payload', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const token = 'jwt-token-123';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      await service.login(email, password);

      const signCall = (jwt.sign as jest.Mock).mock.calls[0];
      const payload = signCall[0];

      expect(payload).not.toHaveProperty('password');
      expect(payload).toHaveProperty('id');
      expect(payload).toHaveProperty('email');
    });
  });

  describe('forgotPassword', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      phone: '1234567890',
      phoneCode: '+1',
      roleId: 1,
      statusId: 1,
      createdBy: null,
      createdAt: new Date(),
      updatedBy: null,
      updatedAt: new Date(),
    };

    it('should send OTP email and create password reset record for new user', async () => {
      const email = 'test@example.com';
      const otp = '123456';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockHelperServices.generateOTP.mockReturnValue(otp);
      mockPrismaService.passwordReset.findFirst.mockResolvedValue(null);
      mockPrismaService.passwordReset.create.mockResolvedValue({
        id: 'reset-123',
        email,
        otp,
        isVerified: false,
        expiresAt: new Date(),
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      });
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg-123' });

      const result = await service.forgotPassword(email);

      expect(result).toEqual({ message: 'OTP sent to your email' });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockHelperServices.generateOTP).toHaveBeenCalled();
      expect(mockPrismaService.passwordReset.create).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: 'Password Reset OTP',
          text: expect.stringContaining(otp),
        }),
      );
    });

    it('should update existing password reset record', async () => {
      const email = 'test@example.com';
      const otp = '654321';
      const existingRecord = {
        id: 'reset-123',
        email,
        otp: '111111',
        isVerified: false,
        expiresAt: new Date(),
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockHelperServices.generateOTP.mockReturnValue(otp);
      mockPrismaService.passwordReset.findFirst.mockResolvedValue(
        existingRecord,
      );
      mockPrismaService.passwordReset.update.mockResolvedValue({
        ...existingRecord,
        otp,
      });
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg-123' });

      const result = await service.forgotPassword(email);

      expect(result).toEqual({ message: 'OTP sent to your email' });
      expect(mockPrismaService.passwordReset.update).toHaveBeenCalledWith({
        where: { id: existingRecord.id },
        data: expect.objectContaining({ otp }),
      });
    });

    it('should throw BadRequestException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.forgotPassword('nonexistent@example.com'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.forgotPassword('nonexistent@example.com'),
      ).rejects.toThrow('User Not Found');
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully when valid', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const mockRecord = {
        id: 'reset-123',
        email,
        otp,
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.passwordReset.findFirst.mockResolvedValue(mockRecord);
      mockPrismaService.passwordReset.update.mockResolvedValue({
        ...mockRecord,
        isVerified: true,
      });

      const result = await service.verifyOtp(email, otp);

      expect(result).toEqual({ message: 'OTP verified successfully' });
      expect(mockPrismaService.passwordReset.findFirst).toHaveBeenCalledWith({
        where: { email },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrismaService.passwordReset.update).toHaveBeenCalledWith({
        where: { id: mockRecord.id },
        data: { isVerified: true },
      });
    });

    it('should throw BadRequestException when OTP record not found', async () => {
      mockPrismaService.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        service.verifyOtp('test@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.verifyOtp('test@example.com', '123456'),
      ).rejects.toThrow('OTP not found');
    });

    it('should throw BadRequestException when OTP is expired', async () => {
      const mockRecord = {
        id: 'reset-123',
        email: 'test@example.com',
        otp: '123456',
        isVerified: false,
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.passwordReset.findFirst.mockResolvedValue(mockRecord);

      await expect(
        service.verifyOtp('test@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.verifyOtp('test@example.com', '123456'),
      ).rejects.toThrow('OTP is invalid or expired');
    });

    it('should throw UnauthorizedException when OTP does not match', async () => {
      const mockRecord = {
        id: 'reset-123',
        email: 'test@example.com',
        otp: '123456',
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.passwordReset.findFirst.mockResolvedValue(mockRecord);

      await expect(
        service.verifyOtp('test@example.com', 'wrong-otp'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.verifyOtp('test@example.com', 'wrong-otp'),
      ).rejects.toThrow('OTP is invalid or expired');
    });
  });

  describe('resetPassword', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'oldHashedPassword',
      phone: '1234567890',
      phoneCode: '+1',
      roleId: 1,
      statusId: 1,
      createdBy: null,
      createdAt: new Date(),
      updatedBy: null,
      updatedAt: new Date(),
    };

    it('should reset password successfully when OTP is verified', async () => {
      const email = 'test@example.com';
      const newPassword = 'newPassword123';
      const hashedPassword = 'newHashedPassword';
      const mockRecord = {
        id: 'reset-123',
        email,
        otp: '123456',
        isVerified: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.passwordReset.findFirst.mockResolvedValue(mockRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockPrismaService.passwordReset.delete.mockResolvedValue(mockRecord);

      const result = await service.resetPassword(email, newPassword);

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockPrismaService.passwordReset.findFirst).toHaveBeenCalledWith({
        where: { email, isVerified: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, expect.any(Number));
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { email },
        data: { password: hashedPassword },
      });
      expect(mockPrismaService.passwordReset.delete).toHaveBeenCalledWith({
        where: { id: mockRecord.id },
      });
    });

    it('should throw BadRequestException when OTP verification is required', async () => {
      mockPrismaService.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword('test@example.com', 'newPassword123'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.resetPassword('test@example.com', 'newPassword123'),
      ).rejects.toThrow('OTP verification required');
    });

    it('should hash the new password before saving', async () => {
      const email = 'test@example.com';
      const newPassword = 'newPassword123';
      const hashedPassword = 'newHashedPassword';
      const mockRecord = {
        id: 'reset-123',
        email,
        otp: '123456',
        isVerified: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.passwordReset.findFirst.mockResolvedValue(mockRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockPrismaService.passwordReset.delete.mockResolvedValue(mockRecord);

      await service.resetPassword(email, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, expect.any(Number));
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { email },
        data: { password: hashedPassword },
      });
    });

    it('should delete password reset record after successful reset', async () => {
      const email = 'test@example.com';
      const newPassword = 'newPassword123';
      const hashedPassword = 'newHashedPassword';
      const mockRecord = {
        id: 'reset-123',
        email,
        otp: '123456',
        isVerified: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.passwordReset.findFirst.mockResolvedValue(mockRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      mockPrismaService.passwordReset.delete.mockResolvedValue(mockRecord);

      await service.resetPassword(email, newPassword);

      expect(mockPrismaService.passwordReset.delete).toHaveBeenCalledWith({
        where: { id: mockRecord.id },
      });
    });
  });
});
