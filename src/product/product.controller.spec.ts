import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { BadRequestException } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    create: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    update: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
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
      const expectedResult = {
        id: 'product-123',
        ...createProductDto,
        mrp: 10000,
        ptr: 10000,
        pts: 10000,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockProductService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
      expect(mockProductService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors when creating product', async () => {
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

      mockProductService.create.mockRejectedValue(
        new BadRequestException('Division Not Found'),
      );

      await expect(controller.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle status validation errors', async () => {
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

      mockProductService.create.mockRejectedValue(
        new BadRequestException('Product Status Not Found'),
      );

      await expect(controller.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all products with pagination', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        products: [
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
        ],
        total: 1,
      };

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findAll).toHaveBeenCalledWith(query);
      expect(mockProductService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter products by divisionId', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
        divisionId: 'division-1',
      };
      const expectedResult = {
        products: [],
        total: 0,
      };

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter products by statusId', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
        statusId: 1,
      };
      const expectedResult = {
        products: [],
        total: 0,
      };

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter products by name', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
        name: 'aspirin',
      };
      const expectedResult = {
        products: [],
        total: 0,
      };

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter by multiple query parameters', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
        divisionId: 'division-1',
        statusId: 1,
        name: 'aspirin',
      };
      const expectedResult = {
        products: [],
        total: 0,
      };

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no products found', async () => {
      const query: QueryProductDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        products: [],
        total: 0,
      };

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(result.products).toHaveLength(0);
    });

    it('should handle custom pagination parameters', async () => {
      const query: QueryProductDto = {
        offset: 20,
        limit: 5,
      };
      const expectedResult = {
        products: [],
        total: 0,
      };

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single product by id', async () => {
      const productId = 'product-123';
      const expectedResult = {
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

      mockProductService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(productId);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findOne).toHaveBeenCalledWith(productId);
      expect(mockProductService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when product not found', async () => {
      const productId = 'nonexistent-id';

      mockProductService.findOne.mockRejectedValue(
        new BadRequestException('Product Not Found'),
      );

      await expect(controller.findOne(productId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOne(productId)).rejects.toThrow(
        'Product Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Aspirin 500mg',
        packedSize: '20 tablets',
      };
      const expectedResult = {
        id: productId,
        name: 'Updated Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '20 tablets',
        mrp: 10000,
        ptr: 8000,
        pts: 7500,
        statusId: 1,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockProductService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(productId, updateProductDto);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
      expect(mockProductService.update).toHaveBeenCalledTimes(1);
    });

    it('should update product divisionId', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        divisionId: 'division-2',
      };
      const expectedResult = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-2',
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
      };

      mockProductService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(productId, updateProductDto);

      expect(result.divisionId).toBe('division-2');
      expect(mockProductService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
    });

    it('should update product statusId', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        statusId: 2,
      };
      const expectedResult = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 10000,
        ptr: 8000,
        pts: 7500,
        statusId: 2,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockProductService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(productId, updateProductDto);

      expect(result.statusId).toBe(2);
    });

    it('should update product pricing', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        mrp: 120,
        ptr: 95,
        pts: 90,
      };
      const expectedResult = {
        id: productId,
        name: 'Aspirin 500mg',
        divisionId: 'division-1',
        ingredients: { aspirin: '500mg' },
        strength: 500,
        packedSize: '10 tablets',
        mrp: 120,
        ptr: 95,
        pts: 90,
        statusId: 1,
        productCode: 'PRD-ABC123',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockProductService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(productId, updateProductDto);

      expect(result.mrp).toBe(120);
      expect(result.ptr).toBe(95);
      expect(result.pts).toBe(90);
    });

    it('should throw BadRequestException when updating non-existent product', async () => {
      const productId = 'nonexistent-id';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Name',
      };

      mockProductService.update.mockRejectedValue(
        new BadRequestException('Product Not Found'),
      );

      await expect(
        controller.update(productId, updateProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate division when updating divisionId', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        divisionId: 'invalid-division',
      };

      mockProductService.update.mockRejectedValue(
        new BadRequestException('Division Not Found'),
      );

      await expect(
        controller.update(productId, updateProductDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate status when updating statusId', async () => {
      const productId = 'product-123';
      const updateProductDto: UpdateProductDto = {
        statusId: 999,
      };

      mockProductService.update.mockRejectedValue(
        new BadRequestException('Product Status Not Found'),
      );

      await expect(
        controller.update(productId, updateProductDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
