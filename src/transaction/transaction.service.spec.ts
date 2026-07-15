import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { BadRequestException } from '@nestjs/common';
import { ValidationService } from 'src/shared/validation/validation.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let prismaService: PrismaService;
  let validationService: ValidationService;

  const mockPrismaService = {
    transaction: {
      create: jest.fn() as any,
      findMany: jest.fn() as any,
      findUnique: jest.fn() as any,
      update: jest.fn() as any,
      count: jest.fn() as any,
    },
  } as any;

  const mockValidationService = {
    validateReferences: jest.fn() as any,
    validateReference: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
    validationService = module.get<ValidationService>(ValidationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new transaction with all required validations', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'product-123',
        medicalStoreId: 'store-123',
        quantity: 10,
        freeQuantity: 2,
        totalAmount: 0, // Will be calculated
      };
      const mockProduct = {
        id: 'product-123',
        mrp: 10000, // 100.00 in cents
      };
      const mockTransaction = {
        id: 'transaction-123',
        ...createTransactionDto,
        mrp: 10000,
        totalAmount: 100000, // 10 * 10000
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue({
        product: mockProduct,
      });
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create(createTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        userId: createTransactionDto.medicalRepresentativeId,
        productId: createTransactionDto.productId,
        medicalStoreId: createTransactionDto.medicalStoreId,
      });
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          ...createTransactionDto,
          mrp: 10000,
          totalAmount: 100000,
        },
      });
    });

    it('should create transaction with optional doctorId', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'product-123',
        medicalStoreId: 'store-123',
        doctorId: 'doctor-123',
        quantity: 5,
        totalAmount: 0,
      };
      const mockProduct = {
        id: 'product-123',
        mrp: 5000,
      };
      const mockTransaction = {
        id: 'transaction-123',
        ...createTransactionDto,
        mrp: 5000,
        totalAmount: 25000,
        freeQuantity: 0,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue({
        product: mockProduct,
      });
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create(createTransactionDto);

      expect(result).toEqual(mockTransaction);
      expect(mockValidationService.validateReferences).toHaveBeenCalledTimes(2);
      expect(mockValidationService.validateReferences).toHaveBeenNthCalledWith(
        1,
        {
          userId: createTransactionDto.medicalRepresentativeId,
          productId: createTransactionDto.productId,
          medicalStoreId: createTransactionDto.medicalStoreId,
        },
      );
      expect(mockValidationService.validateReferences).toHaveBeenNthCalledWith(
        2,
        {
          doctorId: createTransactionDto.doctorId,
        },
      );
    });

    it('should throw error when user validation fails', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'invalid-user',
        productId: 'product-123',
        medicalStoreId: 'store-123',
        quantity: 10,
        totalAmount: 0,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('User Not Found'),
      );

      await expect(service.create(createTransactionDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createTransactionDto)).rejects.toThrow(
        'User Not Found',
      );
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });

    it('should throw error when product validation fails', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'invalid-product',
        medicalStoreId: 'store-123',
        quantity: 10,
        totalAmount: 0,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Product Not Found'),
      );

      await expect(service.create(createTransactionDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });

    it('should throw error when medical store validation fails', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'product-123',
        medicalStoreId: 'invalid-store',
        quantity: 10,
        totalAmount: 0,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Medical Store Not Found'),
      );

      await expect(service.create(createTransactionDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });

    it('should throw error when doctor validation fails', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'product-123',
        medicalStoreId: 'store-123',
        doctorId: 'invalid-doctor',
        quantity: 10,
        totalAmount: 0,
      };
      const mockProduct = {
        id: 'product-123',
        mrp: 10000,
      };

      mockValidationService.validateReferences
        .mockResolvedValueOnce({ product: mockProduct })
        .mockRejectedValueOnce(new BadRequestException('Doctor Not Found'));

      await expect(service.create(createTransactionDto)).rejects.toThrow(
        'Doctor Not Found',
      );
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'product-123',
        medicalStoreId: 'store-123',
        quantity: 10,
        totalAmount: 0,
      };
      const mockProduct = {
        id: 'product-123',
        mrp: 10000,
      };

      mockValidationService.validateReferences.mockResolvedValue({
        product: mockProduct,
      });
      mockPrismaService.transaction.create.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.create(createTransactionDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions with pagination and relations included', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
      };
      const mockTransactions = [
        {
          id: 'transaction-1',
          medicalRepresentativeId: 'user-1',
          productId: 'product-1',
          medicalStoreId: 'store-1',
          doctorId: null,
          quantity: 10,
          freeQuantity: 2,
          mrp: 10000,
          totalAmount: 100000,
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
          medicalRepresentative: {
            id: 'user-1',
            name: 'John Doe',
          },
          product: {
            id: 'product-1',
            name: 'Product A',
          },
          doctor: null,
          medicalStore: {
            id: 'store-1',
            name: 'Store A',
          },
        },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(
        mockTransactions,
      );
      mockPrismaService.transaction.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        transactions: mockTransactions,
        total: 1,
      });
      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      });
    });

    it('should filter transactions by medicalRepresentativeId', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        medicalRepresentativeId: 'user-1',
      };

      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          medicalRepresentativeId: 'user-1',
        },
        skip: 0,
        take: 10,
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      });
    });

    it('should filter transactions by productId', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        productId: 'product-1',
      };

      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          productId: 'product-1',
        },
        skip: 0,
        take: 10,
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      });
    });

    it('should filter transactions by doctorId', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        doctorId: 'doctor-1',
      };

      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          doctorId: 'doctor-1',
        },
        skip: 0,
        take: 10,
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      });
    });

    it('should filter transactions by medicalStoreId', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        medicalStoreId: 'store-1',
      };

      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          medicalStoreId: 'store-1',
        },
        skip: 0,
        take: 10,
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      });
    });

    it('should filter by multiple query parameters', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
      };

      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          medicalRepresentativeId: 'user-1',
          productId: 'product-1',
          medicalStoreId: 'store-1',
        },
        skip: 0,
        take: 10,
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      });
    });

    it('should return empty array when no transactions found', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
      };

      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result).toEqual({
        transactions: [],
        total: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const query: QueryTransactionDto = {
        offset: 20,
        limit: 5,
      };

      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 20,
        take: 5,
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id with relations included', async () => {
      const transactionId = 'transaction-123';
      const mockTransaction = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: 'doctor-1',
        quantity: 10,
        freeQuantity: 2,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        medicalRepresentative: {
          id: 'user-1',
          name: 'John Doe',
        },
        product: {
          id: 'product-1',
          name: 'Product A',
        },
        doctor: {
          id: 'doctor-1',
          name: 'Dr. Smith',
        },
        medicalStore: {
          id: 'store-1',
          name: 'Store A',
        },
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      const result = await service.findOne(transactionId);

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: transactionId },
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      });
    });

    it('should throw BadRequestException when transaction not found', async () => {
      const transactionId = 'nonexistent-id';

      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne(transactionId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(transactionId)).rejects.toThrow(
        'Transaction Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a transaction successfully without validation', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        quantity: 15,
        freeQuantity: 3,
      };
      const existingTransaction = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: null,
        quantity: 10,
        freeQuantity: 2,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        medicalRepresentative: {
          id: 'user-1',
          name: 'John Doe',
        },
        product: {
          id: 'product-1',
          name: 'Product A',
        },
        doctor: null,
        medicalStore: {
          id: 'store-1',
          name: 'Store A',
        },
      };
      const updatedTransaction = {
        ...existingTransaction,
        quantity: 15,
        freeQuantity: 3,
        updatedAt: new Date(),
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        existingTransaction,
      );
      mockPrismaService.transaction.update.mockResolvedValue(
        updatedTransaction,
      );

      const result = await service.update(transactionId, updateTransactionDto);

      expect(result).toEqual(updatedTransaction);
      expect(mockValidationService.validateReference).not.toHaveBeenCalled();
      expect(mockValidationService.validateReferences).not.toHaveBeenCalled();
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: updateTransactionDto,
      });
    });

    it('should validate user when updating medicalRepresentativeId', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        medicalRepresentativeId: 'user-2',
      };
      const existingTransaction = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: null,
        quantity: 10,
        freeQuantity: 2,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        medicalRepresentative: {
          id: 'user-1',
          name: 'John Doe',
        },
        product: {
          id: 'product-1',
          name: 'Product A',
        },
        doctor: null,
        medicalStore: {
          id: 'store-1',
          name: 'Store A',
        },
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        existingTransaction,
      );
      mockValidationService.validateReference.mockResolvedValue(undefined);
      mockPrismaService.transaction.update.mockResolvedValue({
        ...existingTransaction,
        medicalRepresentativeId: 'user-2',
      });

      await service.update(transactionId, updateTransactionDto);

      expect(mockValidationService.validateReference).toHaveBeenCalledWith(
        'user',
        'user-2',
      );
    });

    it('should validate product when updating productId', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        productId: 'product-2',
      };
      const existingTransaction = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: null,
        quantity: 10,
        freeQuantity: 2,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        medicalRepresentative: {
          id: 'user-1',
          name: 'John Doe',
        },
        product: {
          id: 'product-1',
          name: 'Product A',
        },
        doctor: null,
        medicalStore: {
          id: 'store-1',
          name: 'Store A',
        },
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        existingTransaction,
      );
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.transaction.update.mockResolvedValue({
        ...existingTransaction,
        productId: 'product-2',
      });

      await service.update(transactionId, updateTransactionDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        productId: 'product-2',
      });
    });

    it('should validate multiple references when updating', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        productId: 'product-2',
        medicalStoreId: 'store-2',
        doctorId: 'doctor-2',
      };
      const existingTransaction = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: null,
        quantity: 10,
        freeQuantity: 2,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        medicalRepresentative: {
          id: 'user-1',
          name: 'John Doe',
        },
        product: {
          id: 'product-1',
          name: 'Product A',
        },
        doctor: null,
        medicalStore: {
          id: 'store-1',
          name: 'Store A',
        },
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        existingTransaction,
      );
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.transaction.update.mockResolvedValue({
        ...existingTransaction,
        ...updateTransactionDto,
      });

      await service.update(transactionId, updateTransactionDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        productId: 'product-2',
        medicalStoreId: 'store-2',
        doctorId: 'doctor-2',
      });
    });

    it('should throw BadRequestException when updating non-existent transaction', async () => {
      const transactionId = 'nonexistent-id';
      const updateTransactionDto: UpdateTransactionDto = {
        quantity: 15,
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.update(transactionId, updateTransactionDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(transactionId, updateTransactionDto),
      ).rejects.toThrow('Transaction Not Found');

      expect(mockPrismaService.transaction.update).not.toHaveBeenCalled();
    });

    it('should throw error when user validation fails during update', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        medicalRepresentativeId: 'invalid-user',
      };
      const existingTransaction = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: null,
        quantity: 10,
        freeQuantity: 2,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        medicalRepresentative: {
          id: 'user-1',
          name: 'John Doe',
        },
        product: {
          id: 'product-1',
          name: 'Product A',
        },
        doctor: null,
        medicalStore: {
          id: 'store-1',
          name: 'Store A',
        },
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        existingTransaction,
      );
      mockValidationService.validateReference.mockRejectedValue(
        new BadRequestException('User Not Found'),
      );

      await expect(
        service.update(transactionId, updateTransactionDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(transactionId, updateTransactionDto),
      ).rejects.toThrow('User Not Found');

      expect(mockPrismaService.transaction.update).not.toHaveBeenCalled();
    });

    it('should throw error when product validation fails during update', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        productId: 'invalid-product',
      };
      const existingTransaction = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: null,
        quantity: 10,
        freeQuantity: 2,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        medicalRepresentative: {
          id: 'user-1',
          name: 'John Doe',
        },
        product: {
          id: 'product-1',
          name: 'Product A',
        },
        doctor: null,
        medicalStore: {
          id: 'store-1',
          name: 'Store A',
        },
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(
        existingTransaction,
      );
      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Product Not Found'),
      );

      await expect(
        service.update(transactionId, updateTransactionDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(transactionId, updateTransactionDto),
      ).rejects.toThrow('Product Not Found');

      expect(mockPrismaService.transaction.update).not.toHaveBeenCalled();
    });
  });
});
