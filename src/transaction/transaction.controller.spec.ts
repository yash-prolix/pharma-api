import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { BadRequestException } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  const mockTransactionService = {
    create: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    update: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'product-123',
        medicalStoreId: 'store-123',
        quantity: 10,
        freeQuantity: 2,
        totalAmount: 100000,
      };
      const expectedResult = {
        id: 'transaction-123',
        ...createTransactionDto,
        mrp: 10000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockTransactionService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTransactionDto);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.create).toHaveBeenCalledWith(
        createTransactionDto,
      );
      expect(mockTransactionService.create).toHaveBeenCalledTimes(1);
    });

    it('should create a transaction with optional doctorId', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'product-123',
        medicalStoreId: 'store-123',
        doctorId: 'doctor-123',
        quantity: 5,
        totalAmount: 50000,
      };
      const expectedResult = {
        id: 'transaction-123',
        ...createTransactionDto,
        mrp: 10000,
        freeQuantity: 0,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockTransactionService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createTransactionDto);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.create).toHaveBeenCalledWith(
        createTransactionDto,
      );
    });

    it('should handle validation errors when creating transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'invalid-user',
        productId: 'product-123',
        medicalStoreId: 'store-123',
        quantity: 10,
        totalAmount: 100000,
      };

      mockTransactionService.create.mockRejectedValue(
        new BadRequestException('User Not Found'),
      );

      await expect(controller.create(createTransactionDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle product validation errors', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'invalid-product',
        medicalStoreId: 'store-123',
        quantity: 10,
        totalAmount: 100000,
      };

      mockTransactionService.create.mockRejectedValue(
        new BadRequestException('Product Not Found'),
      );

      await expect(controller.create(createTransactionDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle medical store validation errors', async () => {
      const createTransactionDto: CreateTransactionDto = {
        medicalRepresentativeId: 'user-123',
        productId: 'product-123',
        medicalStoreId: 'invalid-store',
        quantity: 10,
        totalAmount: 100000,
      };

      mockTransactionService.create.mockRejectedValue(
        new BadRequestException('Medical Store Not Found'),
      );

      await expect(controller.create(createTransactionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions with pagination', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        transactions: [
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
        ],
        total: 1,
      };

      mockTransactionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.findAll).toHaveBeenCalledWith(query);
      expect(mockTransactionService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter transactions by medicalRepresentativeId', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        medicalRepresentativeId: 'user-1',
      };
      const expectedResult = {
        transactions: [],
        total: 0,
      };

      mockTransactionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter transactions by productId', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        productId: 'product-1',
      };
      const expectedResult = {
        transactions: [],
        total: 0,
      };

      mockTransactionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter transactions by doctorId', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        doctorId: 'doctor-1',
      };
      const expectedResult = {
        transactions: [],
        total: 0,
      };

      mockTransactionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter transactions by medicalStoreId', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        medicalStoreId: 'store-1',
      };
      const expectedResult = {
        transactions: [],
        total: 0,
      };

      mockTransactionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter by multiple query parameters', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
      };
      const expectedResult = {
        transactions: [],
        total: 0,
      };

      mockTransactionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no transactions found', async () => {
      const query: QueryTransactionDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        transactions: [],
        total: 0,
      };

      mockTransactionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(result.transactions).toHaveLength(0);
    });

    it('should handle custom pagination parameters', async () => {
      const query: QueryTransactionDto = {
        offset: 20,
        limit: 5,
      };
      const expectedResult = {
        transactions: [],
        total: 0,
      };

      mockTransactionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single transaction by id', async () => {
      const transactionId = 'transaction-123';
      const expectedResult = {
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

      mockTransactionService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(transactionId);

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.findOne).toHaveBeenCalledWith(
        transactionId,
      );
      expect(mockTransactionService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when transaction not found', async () => {
      const transactionId = 'nonexistent-id';

      mockTransactionService.findOne.mockRejectedValue(
        new BadRequestException('Transaction Not Found'),
      );

      await expect(controller.findOne(transactionId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOne(transactionId)).rejects.toThrow(
        'Transaction Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a transaction successfully', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        quantity: 15,
        freeQuantity: 3,
      };
      const expectedResult = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: null,
        quantity: 15,
        freeQuantity: 3,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockTransactionService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        transactionId,
        updateTransactionDto,
      );

      expect(result).toEqual(expectedResult);
      expect(mockTransactionService.update).toHaveBeenCalledWith(
        transactionId,
        updateTransactionDto,
      );
      expect(mockTransactionService.update).toHaveBeenCalledTimes(1);
    });

    it('should update medicalRepresentativeId', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        medicalRepresentativeId: 'user-2',
      };
      const expectedResult = {
        id: transactionId,
        medicalRepresentativeId: 'user-2',
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
      };

      mockTransactionService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        transactionId,
        updateTransactionDto,
      );

      expect(result.medicalRepresentativeId).toBe('user-2');
      expect(mockTransactionService.update).toHaveBeenCalledWith(
        transactionId,
        updateTransactionDto,
      );
    });

    it('should update productId', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        productId: 'product-2',
      };
      const expectedResult = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-2',
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
      };

      mockTransactionService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        transactionId,
        updateTransactionDto,
      );

      expect(result.productId).toBe('product-2');
    });

    it('should update doctorId', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        doctorId: 'doctor-2',
      };
      const expectedResult = {
        id: transactionId,
        medicalRepresentativeId: 'user-1',
        productId: 'product-1',
        medicalStoreId: 'store-1',
        doctorId: 'doctor-2',
        quantity: 10,
        freeQuantity: 2,
        mrp: 10000,
        totalAmount: 100000,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockTransactionService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        transactionId,
        updateTransactionDto,
      );

      expect(result.doctorId).toBe('doctor-2');
    });

    it('should throw BadRequestException when updating non-existent transaction', async () => {
      const transactionId = 'nonexistent-id';
      const updateTransactionDto: UpdateTransactionDto = {
        quantity: 15,
      };

      mockTransactionService.update.mockRejectedValue(
        new BadRequestException('Transaction Not Found'),
      );

      await expect(
        controller.update(transactionId, updateTransactionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate user when updating medicalRepresentativeId', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        medicalRepresentativeId: 'invalid-user',
      };

      mockTransactionService.update.mockRejectedValue(
        new BadRequestException('User Not Found'),
      );

      await expect(
        controller.update(transactionId, updateTransactionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate product when updating productId', async () => {
      const transactionId = 'transaction-123';
      const updateTransactionDto: UpdateTransactionDto = {
        productId: 'invalid-product',
      };

      mockTransactionService.update.mockRejectedValue(
        new BadRequestException('Product Not Found'),
      );

      await expect(
        controller.update(transactionId, updateTransactionDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
