import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    update: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
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
      const expectedResult = {
        id: 'user-123',
        ...createUserDto,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserService.create).toHaveBeenCalledTimes(1);
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
      const expectedResult = {
        id: 'user-123',
        ...createUserDto,
        phoneCode: null,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle validation errors when creating user', async () => {
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

      mockUserService.create.mockRejectedValue(
        new BadRequestException('User Status Not Found'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle role validation errors', async () => {
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

      mockUserService.create.mockRejectedValue(
        new BadRequestException('User Role Not Found'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        users: [
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
        ],
        total: 1,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.findAll).toHaveBeenCalledWith(query);
      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter users by statusId', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
        statusId: 1,
      };
      const expectedResult = {
        users: [],
        total: 0,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter users by roleId', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
        roleId: 2,
      };
      const expectedResult = {
        users: [],
        total: 0,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter by both statusId and roleId', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
        statusId: 1,
        roleId: 2,
      };
      const expectedResult = {
        users: [],
        total: 0,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no users found', async () => {
      const query: QueryUserDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        users: [],
        total: 0,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(result.users).toHaveLength(0);
    });

    it('should handle custom pagination parameters', async () => {
      const query: QueryUserDto = {
        offset: 20,
        limit: 5,
      };
      const expectedResult = {
        users: [],
        total: 0,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const userId = 'user-123';
      const expectedResult = {
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

      mockUserService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(userId);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(mockUserService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when user not found', async () => {
      const userId = 'nonexistent-id';

      mockUserService.findOne.mockRejectedValue(
        new BadRequestException('User Not Found'),
      );

      await expect(controller.findOne(userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOne(userId)).rejects.toThrow(
        'User Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const expectedResult = {
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

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual(expectedResult);
      expect(mockUserService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(mockUserService.update).toHaveBeenCalledTimes(1);
    });

    it('should update user email', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };
      const expectedResult = {
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

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      expect(result.email).toBe('newemail@example.com');
      expect(mockUserService.update).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });

    it('should update user phone information', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        phoneCode: '+44',
        phone: '9876543210',
      };
      const expectedResult = {
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

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      expect(result.phoneCode).toBe('+44');
      expect(result.phone).toBe('9876543210');
    });

    it('should update user status and role', async () => {
      const userId = 'user-123';
      const updateUserDto: UpdateUserDto = {
        statusId: 2,
        roleId: 3,
      };
      const expectedResult = {
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

      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      expect(result.statusId).toBe(2);
      expect(result.roleId).toBe(3);
    });

    it('should throw BadRequestException when updating non-existent user', async () => {
      const userId = 'nonexistent-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      mockUserService.update.mockRejectedValue(
        new BadRequestException('User Not Found'),
      );

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
