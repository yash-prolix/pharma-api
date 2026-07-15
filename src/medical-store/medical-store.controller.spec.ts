import { Test, TestingModule } from '@nestjs/testing';
import { MedicalStoreController } from './medical-store.controller';
import { MedicalStoreService } from './medical-store.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateMedicalStoreDto } from './dto/create-medical-store.dto';
import { UpdateMedicalStoreDto } from './dto/update-medical-store.dto';
import { QueryMedicalStoreDto } from './dto/query-medical-store.dto';
import { BadRequestException } from '@nestjs/common';

describe('MedicalStoreController', () => {
  let controller: MedicalStoreController;
  let service: MedicalStoreService;

  const mockMedicalStoreService = {
    create: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    update: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalStoreController],
      providers: [
        {
          provide: MedicalStoreService,
          useValue: mockMedicalStoreService,
        },
      ],
    }).compile();

    controller = module.get<MedicalStoreController>(MedicalStoreController);
    service = module.get<MedicalStoreService>(MedicalStoreService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new medical store', async () => {
      const createMedicalStoreDto: CreateMedicalStoreDto = {
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        phoneCode: '+1',
        address: '123 Main St',
        locationId: 'location-123',
        isActive: true,
      };
      const expectedResult = {
        id: 'medicalstore-123',
        ...createMedicalStoreDto,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockMedicalStoreService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createMedicalStoreDto);

      expect(result).toEqual(expectedResult);
      expect(mockMedicalStoreService.create).toHaveBeenCalledWith(
        createMedicalStoreDto,
      );
      expect(mockMedicalStoreService.create).toHaveBeenCalledTimes(1);
    });

    it('should create a medical store without optional fields', async () => {
      const createMedicalStoreDto: CreateMedicalStoreDto = {
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        locationId: 'location-123',
      };
      const expectedResult = {
        id: 'medicalstore-123',
        ...createMedicalStoreDto,
        phoneCode: null,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockMedicalStoreService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createMedicalStoreDto);

      expect(result).toEqual(expectedResult);
      expect(mockMedicalStoreService.create).toHaveBeenCalledWith(
        createMedicalStoreDto,
      );
    });

    it('should handle validation errors when creating medical store', async () => {
      const createMedicalStoreDto: CreateMedicalStoreDto = {
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        locationId: 'invalid-location',
      };

      mockMedicalStoreService.create.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(controller.create(createMedicalStoreDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all medical stores with pagination', async () => {
      const query: QueryMedicalStoreDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        medicalStores: [
          {
            id: 'medicalstore-1',
            name: 'City Medical Store',
            contactPerson: 'John Doe',
            phone: '1234567890',
            phoneCode: '+1',
            address: '123 Main St',
            locationId: 'location-1',
            isActive: true,
            createdBy: null,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: new Date(),
            location: {
              id: 'location-1',
              name: 'Downtown Area',
            },
          },
        ],
        total: 1,
      };

      mockMedicalStoreService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockMedicalStoreService.findAll).toHaveBeenCalledWith(query);
      expect(mockMedicalStoreService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter medical stores by locationId', async () => {
      const query: QueryMedicalStoreDto = {
        offset: 0,
        limit: 10,
        locationId: 'location-1',
      };
      const expectedResult = {
        medicalStores: [
          {
            id: 'medicalstore-1',
            name: 'City Medical Store',
            contactPerson: 'John Doe',
            phone: '1234567890',
            phoneCode: '+1',
            address: '123 Main St',
            locationId: 'location-1',
            isActive: true,
            createdBy: null,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: new Date(),
            location: {
              id: 'location-1',
              name: 'Downtown Area',
            },
          },
        ],
        total: 1,
      };

      mockMedicalStoreService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockMedicalStoreService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no medical stores found', async () => {
      const query: QueryMedicalStoreDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        medicalStores: [],
        total: 0,
      };

      mockMedicalStoreService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(result.medicalStores).toHaveLength(0);
    });

    it('should handle custom pagination parameters', async () => {
      const query: QueryMedicalStoreDto = {
        offset: 20,
        limit: 5,
      };
      const expectedResult = {
        medicalStores: [],
        total: 0,
      };

      mockMedicalStoreService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockMedicalStoreService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single medical store by id', async () => {
      const medicalStoreId = 'medicalstore-123';
      const expectedResult = {
        id: medicalStoreId,
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        phoneCode: '+1',
        address: '123 Main St',
        locationId: 'location-1',
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        location: {
          id: 'location-1',
          name: 'Downtown Area',
        },
      };

      mockMedicalStoreService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(medicalStoreId);

      expect(result).toEqual(expectedResult);
      expect(mockMedicalStoreService.findOne).toHaveBeenCalledWith(
        medicalStoreId,
      );
      expect(mockMedicalStoreService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when medical store not found', async () => {
      const medicalStoreId = 'nonexistent-id';

      mockMedicalStoreService.findOne.mockRejectedValue(
        new BadRequestException('Medical Store Not Found'),
      );

      await expect(controller.findOne(medicalStoreId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOne(medicalStoreId)).rejects.toThrow(
        'Medical Store Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a medical store successfully', async () => {
      const medicalStoreId = 'medicalstore-123';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        name: 'Updated Medical Store',
        contactPerson: 'Jane Doe',
      };
      const expectedResult = {
        id: medicalStoreId,
        name: 'Updated Medical Store',
        contactPerson: 'Jane Doe',
        phone: '1234567890',
        phoneCode: '+1',
        address: '123 Main St',
        locationId: 'location-1',
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockMedicalStoreService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        medicalStoreId,
        updateMedicalStoreDto,
      );

      expect(result).toEqual(expectedResult);
      expect(mockMedicalStoreService.update).toHaveBeenCalledWith(
        medicalStoreId,
        updateMedicalStoreDto,
      );
      expect(mockMedicalStoreService.update).toHaveBeenCalledTimes(1);
    });

    it('should update location of a medical store', async () => {
      const medicalStoreId = 'medicalstore-123';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        locationId: 'location-2',
      };
      const expectedResult = {
        id: medicalStoreId,
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        phoneCode: '+1',
        address: '123 Main St',
        locationId: 'location-2',
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockMedicalStoreService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        medicalStoreId,
        updateMedicalStoreDto,
      );

      expect(result.locationId).toBe('location-2');
      expect(mockMedicalStoreService.update).toHaveBeenCalledWith(
        medicalStoreId,
        updateMedicalStoreDto,
      );
    });

    it('should update isActive status', async () => {
      const medicalStoreId = 'medicalstore-123';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        isActive: false,
      };
      const expectedResult = {
        id: medicalStoreId,
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        phoneCode: '+1',
        address: '123 Main St',
        locationId: 'location-1',
        isActive: false,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockMedicalStoreService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        medicalStoreId,
        updateMedicalStoreDto,
      );

      expect(result.isActive).toBe(false);
    });

    it('should throw BadRequestException when updating non-existent medical store', async () => {
      const medicalStoreId = 'nonexistent-id';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        name: 'Updated Name',
      };

      mockMedicalStoreService.update.mockRejectedValue(
        new BadRequestException('Medical Store Not Found'),
      );

      await expect(
        controller.update(medicalStoreId, updateMedicalStoreDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate location when updating locationId', async () => {
      const medicalStoreId = 'medicalstore-123';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        locationId: 'invalid-location',
      };

      mockMedicalStoreService.update.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(
        controller.update(medicalStoreId, updateMedicalStoreDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
