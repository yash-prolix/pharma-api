import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn() as any,
    forgotPassword: jest.fn() as any,
    verifyOtp: jest.fn() as any,
    resetPassword: jest.fn() as any,
    validateUser: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { token: 'jwt-token-123' };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP successfully when email exists', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };
      const expectedResult = { message: 'OTP sent to your email' };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
      expect(mockAuthService.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when user does not exist', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'nonexistent@example.com',
      };

      mockAuthService.forgotPassword.mockRejectedValue(
        new BadRequestException('User Not Found'),
      );

      await expect(
        controller.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
    });

    it('should handle email sending failures gracefully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      mockAuthService.forgotPassword.mockRejectedValue(
        new Error('Email service unavailable'),
      );

      await expect(
        controller.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow();
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully when OTP is valid', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };
      const expectedResult = { message: 'OTP verified successfully' };

      mockAuthService.verifyOtp.mockResolvedValue(expectedResult);

      const result = await controller.verifyOtp(verifyOtpDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(
        verifyOtpDto.email,
        verifyOtpDto.otp,
      );
      expect(mockAuthService.verifyOtp).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when OTP is invalid', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: 'wrong-otp',
      };

      mockAuthService.verifyOtp.mockRejectedValue(
        new UnauthorizedException('OTP is invalid or expired'),
      );

      await expect(controller.verifyOtp(verifyOtpDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(
        verifyOtpDto.email,
        verifyOtpDto.otp,
      );
    });

    it('should throw BadRequestException when OTP is expired', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      mockAuthService.verifyOtp.mockRejectedValue(
        new BadRequestException('OTP is invalid or expired'),
      );

      await expect(controller.verifyOtp(verifyOtpDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when OTP record not found', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      mockAuthService.verifyOtp.mockRejectedValue(
        new BadRequestException('OTP not found'),
      );

      await expect(controller.verifyOtp(verifyOtpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully when OTP is verified', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
        password: 'newPassword123',
      };
      const expectedResult = { message: 'Password reset successfully' };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.email,
        resetPasswordDto.password,
      );
      expect(mockAuthService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when OTP verification is required', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'test@example.com',
        password: 'newPassword123',
      };

      mockAuthService.resetPassword.mockRejectedValue(
        new BadRequestException('OTP verification required'),
      );

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.email,
        resetPasswordDto.password,
      );
    });

    it('should throw BadRequestException when user does not exist', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        email: 'nonexistent@example.com',
        password: 'newPassword123',
      };

      mockAuthService.resetPassword.mockRejectedValue(
        new BadRequestException('User Not Found'),
      );

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
