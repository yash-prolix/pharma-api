import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationDto } from './dto/query-location.dto';
import { BadRequestException } from '@nestjs/common';
import { ValidationService } from 'src/shared/validation/validation.service';

describe('LocationService', () => {
  let service: LocationService;
  let prismaService: PrismaService;
  let validationService: ValidationService;

  const mockPrismaService = {
    location: {
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
        LocationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    prismaService = module.get<PrismaService>(PrismaService);
    validationService = module.get<ValidationService>(ValidationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new location after validating city and state', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Downtown Hospital Area',
        cityId: 1,
        stateId: 1,
      };
      const mockLocation = {
        id: 'location-123',
        ...createLocationDto,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.location.create.mockResolvedValue(mockLocation);

      const result = await service.create(createLocationDto);

      expect(result).toEqual(mockLocation);
      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        cityId: createLocationDto.cityId,
        stateId: createLocationDto.stateId,
      });
      expect(mockPrismaService.location.create).toHaveBeenCalledWith({
        data: createLocationDto,
      });
    });

    it('should throw error when city validation fails', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Downtown Area',
        cityId: 999,
        stateId: 1,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('City Not Found'),
      );

      await expect(service.create(createLocationDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createLocationDto)).rejects.toThrow(
        'City Not Found',
      );
      expect(mockPrismaService.location.create).not.toHaveBeenCalled();
    });

    it('should throw error when state validation fails', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Downtown Area',
        cityId: 1,
        stateId: 999,
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('State Not Found'),
      );

      await expect(service.create(createLocationDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.location.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating location', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Downtown Area',
        cityId: 1,
        stateId: 1,
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.location.create.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.create(createLocationDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all locations with pagination and relations included', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
      };
      const mockLocations = [
        {
          id: 'location-1',
          name: 'Downtown Area',
          cityId: 1,
          stateId: 1,
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
          city: {
            id: 1,
            name: 'New York',
          },
          state: {
            id: 1,
            name: 'New York',
          },
        },
      ];

      mockPrismaService.location.findMany.mockResolvedValue(mockLocations);
      mockPrismaService.location.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        locations: mockLocations,
        total: 1,
      });
      expect(mockPrismaService.location.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          city: true,
          state: true,
        },
      });
    });

    it('should filter locations by cityId', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
        cityId: 1,
      };
      const mockLocations = [
        {
          id: 'location-1',
          name: 'Downtown Area',
          cityId: 1,
          stateId: 1,
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
          city: {
            id: 1,
            name: 'New York',
          },
          state: {
            id: 1,
            name: 'New York',
          },
        },
      ];

      mockPrismaService.location.findMany.mockResolvedValue(mockLocations);
      mockPrismaService.location.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.locations).toEqual(mockLocations);
      expect(mockPrismaService.location.findMany).toHaveBeenCalledWith({
        where: {
          cityId: 1,
        },
        skip: 0,
        take: 10,
        include: {
          city: true,
          state: true,
        },
      });
    });

    it('should filter locations by stateId', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
        stateId: 1,
      };
      const mockLocations = [
        {
          id: 'location-1',
          name: 'Downtown Area',
          cityId: 1,
          stateId: 1,
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
          city: {
            id: 1,
            name: 'New York',
          },
          state: {
            id: 1,
            name: 'New York',
          },
        },
      ];

      mockPrismaService.location.findMany.mockResolvedValue(mockLocations);
      mockPrismaService.location.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.locations).toEqual(mockLocations);
      expect(mockPrismaService.location.findMany).toHaveBeenCalledWith({
        where: {
          stateId: 1,
        },
        skip: 0,
        take: 10,
        include: {
          city: true,
          state: true,
        },
      });
    });

    it('should filter by both cityId and stateId', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
        cityId: 1,
        stateId: 1,
      };

      mockPrismaService.location.findMany.mockResolvedValue([]);
      mockPrismaService.location.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.location.findMany).toHaveBeenCalledWith({
        where: {
          cityId: 1,
          stateId: 1,
        },
        skip: 0,
        take: 10,
        include: {
          city: true,
          state: true,
        },
      });
    });

    it('should return empty array when no locations found', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
      };

      mockPrismaService.location.findMany.mockResolvedValue([]);
      mockPrismaService.location.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result).toEqual({
        locations: [],
        total: 0,
      });
    });
  });

  describe('findOne', () => {
    it('should return a location by id with relations included', async () => {
      const locationId = 'location-123';
      const mockLocation = {
        id: locationId,
        name: 'Downtown Area',
        cityId: 1,
        stateId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        city: {
          id: 1,
          name: 'New York',
        },
        state: {
          id: 1,
          name: 'New York',
        },
      };

      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);

      const result = await service.findOne(locationId);

      expect(result).toEqual(mockLocation);
      expect(mockPrismaService.location.findUnique).toHaveBeenCalledWith({
        where: { id: locationId },
        include: {
          city: true,
          state: true,
        },
      });
    });

    it('should throw BadRequestException when location not found', async () => {
      const locationId = 'nonexistent-id';

      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(service.findOne(locationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(locationId)).rejects.toThrow(
        'Location Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a location successfully without validation', async () => {
      const locationId = 'location-123';
      const updateLocationDto: UpdateLocationDto = {
        name: 'Updated Downtown Area',
      };
      const existingLocation = {
        id: locationId,
        name: 'Downtown Area',
        cityId: 1,
        stateId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        city: {
          id: 1,
          name: 'New York',
        },
        state: {
          id: 1,
          name: 'New York',
        },
      };
      const updatedLocation = {
        ...existingLocation,
        name: 'Updated Downtown Area',
        updatedAt: new Date(),
      };

      mockPrismaService.location.findUnique.mockResolvedValue(existingLocation);
      mockPrismaService.location.update.mockResolvedValue(updatedLocation);

      const result = await service.update(locationId, updateLocationDto);

      expect(result).toEqual(updatedLocation);
      expect(mockValidationService.validateReferences).not.toHaveBeenCalled();
      expect(mockPrismaService.location.update).toHaveBeenCalledWith({
        where: { id: locationId },
        data: updateLocationDto,
      });
    });

    it('should validate city when updating cityId', async () => {
      const locationId = 'location-123';
      const updateLocationDto: UpdateLocationDto = {
        cityId: 2,
      };
      const existingLocation = {
        id: locationId,
        name: 'Downtown Area',
        cityId: 1,
        stateId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        city: {
          id: 1,
          name: 'New York',
        },
        state: {
          id: 1,
          name: 'New York',
        },
      };

      mockPrismaService.location.findUnique.mockResolvedValue(existingLocation);
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.location.update.mockResolvedValue({
        ...existingLocation,
        cityId: 2,
      });

      await service.update(locationId, updateLocationDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        cityId: 2,
      });
    });

    it('should validate state when updating stateId', async () => {
      const locationId = 'location-123';
      const updateLocationDto: UpdateLocationDto = {
        stateId: 2,
      };
      const existingLocation = {
        id: locationId,
        name: 'Downtown Area',
        cityId: 1,
        stateId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        city: {
          id: 1,
          name: 'New York',
        },
        state: {
          id: 1,
          name: 'New York',
        },
      };

      mockPrismaService.location.findUnique.mockResolvedValue(existingLocation);
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.location.update.mockResolvedValue({
        ...existingLocation,
        stateId: 2,
      });

      await service.update(locationId, updateLocationDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        stateId: 2,
      });
    });

    it('should validate both city and state when updating both', async () => {
      const locationId = 'location-123';
      const updateLocationDto: UpdateLocationDto = {
        cityId: 2,
        stateId: 2,
      };
      const existingLocation = {
        id: locationId,
        name: 'Downtown Area',
        cityId: 1,
        stateId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        city: {
          id: 1,
          name: 'New York',
        },
        state: {
          id: 1,
          name: 'New York',
        },
      };

      mockPrismaService.location.findUnique.mockResolvedValue(existingLocation);
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.location.update.mockResolvedValue({
        ...existingLocation,
        cityId: 2,
        stateId: 2,
      });

      await service.update(locationId, updateLocationDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        cityId: 2,
        stateId: 2,
      });
    });

    it('should throw BadRequestException when updating non-existent location', async () => {
      const locationId = 'nonexistent-id';
      const updateLocationDto: UpdateLocationDto = {
        name: 'Updated Name',
      };

      mockPrismaService.location.findUnique.mockResolvedValue(null);

      await expect(
        service.update(locationId, updateLocationDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(locationId, updateLocationDto),
      ).rejects.toThrow('Location Not Found');

      expect(mockPrismaService.location.update).not.toHaveBeenCalled();
    });

    it('should throw error when city validation fails during update', async () => {
      const locationId = 'location-123';
      const updateLocationDto: UpdateLocationDto = {
        cityId: 999,
      };
      const existingLocation = {
        id: locationId,
        name: 'Downtown Area',
        cityId: 1,
        stateId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        city: {
          id: 1,
          name: 'New York',
        },
        state: {
          id: 1,
          name: 'New York',
        },
      };

      mockPrismaService.location.findUnique.mockResolvedValue(existingLocation);
      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('City Not Found'),
      );

      await expect(
        service.update(locationId, updateLocationDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(locationId, updateLocationDto),
      ).rejects.toThrow('City Not Found');

      expect(mockPrismaService.location.update).not.toHaveBeenCalled();
    });
  });
});
