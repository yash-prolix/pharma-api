import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MedicalStoreService } from './medical-store.service';
import { CreateMedicalStoreDto } from './dto/create-medical-store.dto';
import { UpdateMedicalStoreDto } from './dto/update-medical-store.dto';
import { QueryMedicalStoreDto } from './dto/query-medical-store.dto';
import { BadRequestException } from '@nestjs/common';
import { ValidationService } from 'src/shared/validation/validation.service';

describe('MedicalStoreService', () => {
  let service: MedicalStoreService;
  let prismaService: PrismaService;
  let validationService: ValidationService;

  const mockPrismaService = {
    medicalStore: {
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
        MedicalStoreService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<MedicalStoreService>(MedicalStoreService);
    prismaService = module.get<PrismaService>(PrismaService);
    validationService = module.get<ValidationService>(ValidationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new medical store after validating location', async () => {
      const createMedicalStoreDto: CreateMedicalStoreDto = {
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        phoneCode: '+1',
        address: '123 Main St',
        locationId: 'location-123',
        isActive: true,
      };
      const mockMedicalStore = {
        id: 'medicalstore-123',
        ...createMedicalStoreDto,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.medicalStore.create.mockResolvedValue(mockMedicalStore);

      const result = await service.create(createMedicalStoreDto);

      expect(result).toEqual(mockMedicalStore);
      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        locationId: createMedicalStoreDto.locationId,
      });
      expect(mockPrismaService.medicalStore.create).toHaveBeenCalledWith({
        data: createMedicalStoreDto,
      });
    });

    it('should create a medical store without optional fields', async () => {
      const createMedicalStoreDto: CreateMedicalStoreDto = {
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        locationId: 'location-123',
      };
      const mockMedicalStore = {
        id: 'medicalstore-123',
        ...createMedicalStoreDto,
        phoneCode: null,
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.medicalStore.create.mockResolvedValue(mockMedicalStore);

      const result = await service.create(createMedicalStoreDto);

      expect(result).toEqual(mockMedicalStore);
      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        locationId: createMedicalStoreDto.locationId,
      });
    });

    it('should throw error when location validation fails', async () => {
      const createMedicalStoreDto: CreateMedicalStoreDto = {
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        locationId: 'invalid-location',
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(service.create(createMedicalStoreDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createMedicalStoreDto)).rejects.toThrow(
        'Location Not Found',
      );
      expect(mockPrismaService.medicalStore.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating medical store', async () => {
      const createMedicalStoreDto: CreateMedicalStoreDto = {
        name: 'City Medical Store',
        contactPerson: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        locationId: 'location-123',
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.medicalStore.create.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.create(createMedicalStoreDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all medical stores with pagination and relations included', async () => {
      const query: QueryMedicalStoreDto = {
        offset: 0,
        limit: 10,
      };
      const mockMedicalStores = [
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
      ];

      mockPrismaService.medicalStore.findMany.mockResolvedValue(
        mockMedicalStores,
      );
      mockPrismaService.medicalStore.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        medicalStores: mockMedicalStores,
        total: 1,
      });
      expect(mockPrismaService.medicalStore.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          location: true,
        },
      });
    });

    it('should filter medical stores by locationId', async () => {
      const query: QueryMedicalStoreDto = {
        offset: 0,
        limit: 10,
        locationId: 'location-1',
      };
      const mockMedicalStores = [
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
      ];

      mockPrismaService.medicalStore.findMany.mockResolvedValue(
        mockMedicalStores,
      );
      mockPrismaService.medicalStore.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.medicalStores).toEqual(mockMedicalStores);
      expect(mockPrismaService.medicalStore.findMany).toHaveBeenCalledWith({
        where: {
          locationId: 'location-1',
        },
        skip: 0,
        take: 10,
        include: {
          location: true,
        },
      });
    });

    it('should return empty array when no medical stores found', async () => {
      const query: QueryMedicalStoreDto = {
        offset: 0,
        limit: 10,
      };

      mockPrismaService.medicalStore.findMany.mockResolvedValue([]);
      mockPrismaService.medicalStore.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result).toEqual({
        medicalStores: [],
        total: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const query: QueryMedicalStoreDto = {
        offset: 10,
        limit: 5,
      };

      mockPrismaService.medicalStore.findMany.mockResolvedValue([]);
      mockPrismaService.medicalStore.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.medicalStore.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 5,
        include: {
          location: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a medical store by id with relations included', async () => {
      const medicalStoreId = 'medicalstore-123';
      const mockMedicalStore = {
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

      mockPrismaService.medicalStore.findUnique.mockResolvedValue(
        mockMedicalStore,
      );

      const result = await service.findOne(medicalStoreId);

      expect(result).toEqual(mockMedicalStore);
      expect(mockPrismaService.medicalStore.findUnique).toHaveBeenCalledWith({
        where: { id: medicalStoreId },
        include: {
          location: true,
        },
      });
    });

    it('should throw BadRequestException when medical store not found', async () => {
      const medicalStoreId = 'nonexistent-id';

      mockPrismaService.medicalStore.findUnique.mockResolvedValue(null);

      await expect(service.findOne(medicalStoreId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(medicalStoreId)).rejects.toThrow(
        'Medical Store Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a medical store successfully without validation', async () => {
      const medicalStoreId = 'medicalstore-123';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        name: 'Updated Medical Store',
        contactPerson: 'Jane Doe',
      };
      const existingMedicalStore = {
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
      const updatedMedicalStore = {
        ...existingMedicalStore,
        name: 'Updated Medical Store',
        contactPerson: 'Jane Doe',
        updatedAt: new Date(),
      };

      mockPrismaService.medicalStore.findUnique.mockResolvedValue(
        existingMedicalStore,
      );
      mockPrismaService.medicalStore.update.mockResolvedValue(
        updatedMedicalStore,
      );

      const result = await service.update(
        medicalStoreId,
        updateMedicalStoreDto,
      );

      expect(result).toEqual(updatedMedicalStore);
      expect(mockValidationService.validateReferences).not.toHaveBeenCalled();
      expect(mockPrismaService.medicalStore.update).toHaveBeenCalledWith({
        where: { id: medicalStoreId },
        data: updateMedicalStoreDto,
      });
    });

    it('should validate location when updating locationId', async () => {
      const medicalStoreId = 'medicalstore-123';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        locationId: 'location-2',
      };
      const existingMedicalStore = {
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

      mockPrismaService.medicalStore.findUnique.mockResolvedValue(
        existingMedicalStore,
      );
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.medicalStore.update.mockResolvedValue({
        ...existingMedicalStore,
        locationId: 'location-2',
      });

      await service.update(medicalStoreId, updateMedicalStoreDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        locationId: 'location-2',
      });
    });

    it('should throw BadRequestException when updating non-existent medical store', async () => {
      const medicalStoreId = 'nonexistent-id';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        name: 'Updated Name',
      };

      mockPrismaService.medicalStore.findUnique.mockResolvedValue(null);

      await expect(
        service.update(medicalStoreId, updateMedicalStoreDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(medicalStoreId, updateMedicalStoreDto),
      ).rejects.toThrow('Medical Store Not Found');

      expect(mockPrismaService.medicalStore.update).not.toHaveBeenCalled();
    });

    it('should throw error when location validation fails during update', async () => {
      const medicalStoreId = 'medicalstore-123';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        locationId: 'invalid-location',
      };
      const existingMedicalStore = {
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

      mockPrismaService.medicalStore.findUnique.mockResolvedValue(
        existingMedicalStore,
      );
      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(
        service.update(medicalStoreId, updateMedicalStoreDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(medicalStoreId, updateMedicalStoreDto),
      ).rejects.toThrow('Location Not Found');

      expect(mockPrismaService.medicalStore.update).not.toHaveBeenCalled();
    });

    it('should update isActive status', async () => {
      const medicalStoreId = 'medicalstore-123';
      const updateMedicalStoreDto: UpdateMedicalStoreDto = {
        isActive: false,
      };
      const existingMedicalStore = {
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

      mockPrismaService.medicalStore.findUnique.mockResolvedValue(
        existingMedicalStore,
      );
      mockPrismaService.medicalStore.update.mockResolvedValue({
        ...existingMedicalStore,
        isActive: false,
      });

      const result = await service.update(
        medicalStoreId,
        updateMedicalStoreDto,
      );

      expect(result.isActive).toBe(false);
      expect(mockPrismaService.medicalStore.update).toHaveBeenCalledWith({
        where: { id: medicalStoreId },
        data: updateMedicalStoreDto,
      });
    });
  });
});
