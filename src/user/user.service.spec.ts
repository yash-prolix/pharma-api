import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { BadRequestException } from '@nestjs/common';
import { ValidationService } from 'src/shared/validation/validation.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let validationService: ValidationService;

  const mockPrismaService = {
    user: {
      create: jest.fn() as any,
      findMany: jest.fn() as any,
      findUnique: jest.fn() as any,
      update: jest.fn() as any,
    },
  } as any;

  const mockValidationService = {
    validateReferences: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    validationService = module.get<ValidationService>(ValidationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user after validating status and role', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneCode: '+1',
        phone: '1234567890',
        statusId: 1,
        roleId: 1,
      };
      const mockUser = {
        id: 'user-123',
        ...createUserDto,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        userStatusId: createUserDto.statusId,
        userRoleId: createUserDto.roleId,
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });

    it('should create a user without optional phoneCode', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        statusId: 1,
        roleId: 1,
      };
      const mockUser = {
        id: 'user-123',
        ...createUserDto,
        phoneCode: null,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        userStatusId: createUserDto.statusId,
        userRoleId: createUserDto.roleId,
      });
    });

    it('should throw error when status validation fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneCode: '+1',
        phone: '1234567890',
        statusId: 999,
        roleId: 1,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('User Status Not Found'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User Status Not Found',
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw error when role validation fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneCode: '+1',
        phone: '1234567890',
        statusId: 1,
        roleId: 999,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('User Role Not Found'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneCode: '+1',
        phone: '1234567890',
        statusId: 1,
        roleId: 1,
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
      };
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          password: 'hashedPassword',
          firstName: 'John',
          lastName: 'Doe',
          phoneCode: '+1',
          phone: '1234567890',
          statusId: 1,
          roleId: 1,
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll(query);

      expect(result).toEqual({
        users: mockUsers,
        total: 1,
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
      });
    });

    it('should filter users by statusId', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
        statusId: 1,
      };
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          password: 'hashedPassword',
          firstName: 'John',
          lastName: 'Doe',
          phoneCode: '+1',
          phone: '1234567890',
          statusId: 1,
          roleId: 1,
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll(query);

      expect(result.users).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          statusId: 1,
        },
        skip: 0,
        take: 10,
      });
    });

    it('should filter users by roleId', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
        roleId: 2,
      };
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          password: 'hashedPassword',
          firstName: 'John',
          lastName: 'Doe',
          phoneCode: '+1',
          phone: '1234567890',
          statusId: 1,
          roleId: 2,
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll(query);

      expect(result.users).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          roleId: 2,
        },
        skip: 0,
        take: 10,
      });
    });

    it('should filter by both statusId and roleId', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
        statusId: 1,
        roleId: 2,
      };

      mockPrismaService.user.findMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          statusId: 1,
          roleId: 2,
        },
        skip: 0,
        take: 10,
      });
    });

    it('should return empty array when no users found', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
      };

      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll(query);

      expect(result).toEqual({
        users: [],
        total: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const query: QueryUserDto = {
        offset: 20,
        limit: 5,
      };

      mockPrismaService.user.findMany.mockResolvedValue([]);

      await service.findAll(query);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 20,
        take: 5,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'user1@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        phoneCode: '+1',
        phone: '1234567890',
        statusId: 1,
        roleId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      const userId = 'nonexistent-id';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(userId)).rejects.toThrow('User Not Found');
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const updatedUser = {
        id: userId,
        email: 'user1@example.com',
        password: 'hashedPassword',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneCode: '+1',
        phone: '1234567890',
        statusId: 1,
        roleId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });

    it('should update user email', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };
      const updatedUser = {
        id: userId,
        email: 'newemail@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        phoneCode: '+1',
        phone: '1234567890',
        statusId: 1,
        roleId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result.email).toBe('newemail@example.com');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });

    it('should update user phone information', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        phoneCode: '+44',
        phone: '9876543210',
      };
      const updatedUser = {
        id: userId,
        email: 'user1@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        phoneCode: '+44',
        phone: '9876543210',
        statusId: 1,
        roleId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result.phoneCode).toBe('+44');
      expect(result.phone).toBe('9876543210');
    });

    it('should update user status and role', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        statusId: 2,
        roleId: 3,
      };
      const updatedUser = {
        id: userId,
        email: 'user1@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        phoneCode: '+1',
        phone: '1234567890',
        statusId: 2,
        roleId: 3,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result.statusId).toBe(2);
      expect(result.roleId).toBe(3);
    });

    it('should handle database errors when updating user', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      mockPrismaService.user.update.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });
});
