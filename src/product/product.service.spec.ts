import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { BadRequestException } from '@nestjs/common';
import { ValidationService } from 'src/shared/validation/validation.service';

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;
  let validationService: ValidationService;

  const mockPrismaService = {
    product: {
      create: jest.fn() as any,
      findMany: jest.fn() as any,
      findUnique: jest.fn() as any,
      update: jest.fn() as any,
      count: jest.fn() as any,
    },
  } as any;

  const mockValidationService = {
    validateReferences: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
    validationService = module.get<ValidationService>(ValidationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product with generated product code and price conversion', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Aspirin 500mg',
        divisionId: 'division-123',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 100,
        ptr: 80,
        pts: 75,
        statusId: 1,
      };
      const mockProduct = {
        id: 'product-123',
        name: createProductDto.name,
        divisionId: createProductDto.divisionId,
        ingredients: createProductDto.ingredients,
        strength: createProductDto.strength,
        packedSize: createProductDto.packedSize,
        mrp: 10000, // 100 * 100
        ptr: 10000, // Will be set to mrp * 100
        pts: 10000, // Will be set to mrp * 100
        statusId: createProductDto.statusId,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.product.findUnique.mockResolvedValue(null); // For unique code check
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        divisionId: createProductDto.divisionId,
        productStatusId: createProductDto.statusId,
      });
      expect(mockPrismaService.product.create).toHaveBeenCalled();
      // Verify the product code was generated
      const createCall = mockPrismaService.product.create.mock.calls[0][0];
      expect(createCall.data.productCode).toMatch(/^PRD-[A-Z0-9]{6}$/);
    });

    it('should throw error when division validation fails', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Aspirin 500mg',
        divisionId: 'invalid-division',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 100,
        ptr: 80,
        pts: 75,
        statusId: 1,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Division Not Found'),
      );

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createProductDto)).rejects.toThrow(
        'Division Not Found',
      );
      expect(mockPrismaService.product.create).not.toHaveBeenCalled();
    });

    it('should throw error when status validation fails', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Aspirin 500mg',
        divisionId: 'division-123',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 100,
        ptr: 80,
        pts: 75,
        statusId: 999,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Product Status Not Found'),
      );

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.product.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Aspirin 500mg',
        divisionId: 'division-123',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 100,
        ptr: 80,
        pts: 75,
        statusId: 1,
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.create(createProductDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all products with pagination and relations included', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
      };
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Aspirin 500mg',
          divisionId: 'division-1',
          ingredients: { aspirin: '500mg' },
          strength: 500,
          packedSize: '10 tablets',
          mrp: 10000,
          ptr: 8000,
          pts: 7500,
          statusId: 1,
          productCode: 'PRD-ABC123',
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
          division: {
            id: 'division-1',
            name: 'Cardiology',
          },
          status: {
            id: 1,
            name: 'Active',
          },
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        products: mockProducts,
        total: 1,
      });
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          division: true,
          status: true,
        },
      });
    });

    it('should filter products by divisionId', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
        divisionId: 'division-1',
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          divisionId: 'division-1',
        },
        skip: 0,
        take: 10,
        include: {
          division: true,
          status: true,
        },
      });
    });

    it('should filter products by statusId', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
        statusId: 1,
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          statusId: 1,
        },
        skip: 0,
        take: 10,
        include: {
          division: true,
          status: true,
        },
      });
    });

    it('should filter products by name with case-insensitive search', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
        name: 'aspirin',
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'aspirin',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        include: {
          division: true,
          status: true,
        },
      });
    });

    it('should filter by multiple query parameters', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
        divisionId: 'division-1',
        statusId: 1,
        name: 'aspirin',
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          divisionId: 'division-1',
          statusId: 1,
          name: {
            contains: 'aspirin',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        include: {
          division: true,
          status: true,
        },
      });
    });

    it('should return empty array when no products found', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result).toEqual({
        products: [],
        total: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const query: QueryProductDto = {
        offset: 20,
        limit: 5,
      };

      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 20,
        take: 5,
        include: {
          division: true,
          status: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id with relations included', async () => {
      const productId = 'product-123';
      const mockProduct = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 10000,
        ptr: 8000,
        pts: 7500,
        statusId: 1,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        division: {
          id: 'division-1',
          name: 'Cardiology',
        },
        status: {
          id: 1,
          name: 'Active',
        },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          division: true,
          status: true,
        },
      });
    });

    it('should throw BadRequestException when product not found', async () => {
      const productId = 'nonexistent-id';

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(productId)).rejects.toThrow(
        'Product Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a product successfully without validation', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Aspirin 500mg',
        packedSize: '20 tablets',
      };
      const existingProduct = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 10000,
        ptr: 8000,
        pts: 7500,
        statusId: 1,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        division: {
          id: 'division-1',
          name: 'Cardiology',
        },
        status: {
          id: 1,
          name: 'Active',
        },
      };
      const updatedProduct = {
        ...existingProduct,
        name: 'Updated Aspirin 500mg',
        packedSize: '20 tablets',
        updatedAt: new Date(),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateProductDto);

      expect(result).toEqual(updatedProduct);
      expect(mockValidationService.validateReferences).not.toHaveBeenCalled();
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateProductDto,
      });
    });

    it('should validate division when updating divisionId', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        divisionId: 'division-2',
      };
      const existingProduct = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 10000,
        ptr: 8000,
        pts: 7500,
        statusId: 1,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        division: {
          id: 'division-1',
          name: 'Cardiology',
        },
        status: {
          id: 1,
          name: 'Active',
        },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.product.update.mockResolvedValue({
        ...existingProduct,
        divisionId: 'division-2',
      });

      await service.update(productId, updateProductDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        divisionId: 'division-2',
      });
    });

    it('should validate status when updating statusId', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        statusId: 2,
      };
      const existingProduct = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 10000,
        ptr: 8000,
        pts: 7500,
        statusId: 1,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        division: {
          id: 'division-1',
          name: 'Cardiology',
        },
        status: {
          id: 1,
          name: 'Active',
        },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.product.update.mockResolvedValue({
        ...existingProduct,
        statusId: 2,
      });

      await service.update(productId, updateProductDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        productStatusId: 2,
      });
    });

    it('should validate both division and status when updating both', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        divisionId: 'division-2',
        statusId: 2,
      };
      const existingProduct = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 10000,
        ptr: 8000,
        pts: 7500,
        statusId: 1,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        division: {
          id: 'division-1',
          name: 'Cardiology',
        },
        status: {
          id: 1,
          name: 'Active',
        },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.product.update.mockResolvedValue({
        ...existingProduct,
        divisionId: 'division-2',
        statusId: 2,
      });

      await service.update(productId, updateProductDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        divisionId: 'division-2',
        productStatusId: 2,
      });
    });

    it('should throw BadRequestException when updating non-existent product', async () => {
      const productId = 'nonexistent-id';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Name',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        'Product Not Found',
      );

      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
    });

    it('should throw error when division validation fails during update', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        divisionId: 'invalid-division',
      };
      const existingProduct = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 10000,
        ptr: 8000,
        pts: 7500,
        statusId: 1,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        division: {
          id: 'division-1',
          name: 'Cardiology',
        },
        status: {
          id: 1,
          name: 'Active',
        },
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Division Not Found'),
      );

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        'Division Not Found',
      );

      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
    });
  });
});
