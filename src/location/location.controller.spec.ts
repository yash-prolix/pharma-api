import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationDto } from './dto/query-location.dto';
import { BadRequestException } from '@nestjs/common';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  const mockLocationService = {
    create: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    update: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new location', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Downtown Hospital Area',
        cityId: 1,
        stateId: 1,
      };
      const expectedResult = {
        id: 'location-123',
        ...createLocationDto,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockLocationService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createLocationDto);

      expect(result).toEqual(expectedResult);
      expect(mockLocationService.create).toHaveBeenCalledWith(
        createLocationDto,
      );
      expect(mockLocationService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors when creating location', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'Downtown Area',
        cityId: 999,
        stateId: 999,
      };

      mockLocationService.create.mockRejectedValue(
        new BadRequestException('City Not Found'),
      );

      await expect(controller.create(createLocationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all locations with pagination', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        locations: [
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
        ],
        total: 1,
      };

      mockLocationService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockLocationService.findAll).toHaveBeenCalledWith(query);
      expect(mockLocationService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter locations by cityId', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
        cityId: 1,
      };
      const expectedResult = {
        locations: [
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
        ],
        total: 1,
      };

      mockLocationService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockLocationService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter locations by stateId', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
        stateId: 1,
      };
      const expectedResult = {
        locations: [
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
        ],
        total: 1,
      };

      mockLocationService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockLocationService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter by both cityId and stateId', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
        cityId: 1,
        stateId: 1,
      };
      const expectedResult = {
        locations: [],
        total: 0,
      };

      mockLocationService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockLocationService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no locations found', async () => {
      const query: QueryLocationDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        locations: [],
        total: 0,
      };

      mockLocationService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(result.locations).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a single location by id', async () => {
      const locationId = 'location-123';
      const expectedResult = {
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

      mockLocationService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(locationId);

      expect(result).toEqual(expectedResult);
      expect(mockLocationService.findOne).toHaveBeenCalledWith(locationId);
      expect(mockLocationService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when location not found', async () => {
      const locationId = 'nonexistent-id';

      mockLocationService.findOne.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(controller.findOne(locationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOne(locationId)).rejects.toThrow(
        'Location Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a location successfully', async () => {
      const locationId = 'location-123';
      const updateLocationDto: UpdateLocationDto = {
        name: 'Updated Downtown Area',
      };
      const expectedResult = {
        id: locationId,
        name: 'Updated Downtown Area',
        cityId: 1,
        stateId: 1,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockLocationService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(locationId, updateLocationDto);

      expect(result).toEqual(expectedResult);
      expect(mockLocationService.update).toHaveBeenCalledWith(
        locationId,
        updateLocationDto,
      );
      expect(mockLocationService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when updating non-existent location', async () => {
      const locationId = 'nonexistent-id';
      const updateLocationDto: UpdateLocationDto = {
        name: 'Updated Name',
      };

      mockLocationService.update.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(
        controller.update(locationId, updateLocationDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate city and state when updating', async () => {
      const locationId = 'location-123';
      const updateLocationDto: UpdateLocationDto = {
        cityId: 999,
        stateId: 999,
      };

      mockLocationService.update.mockRejectedValue(
        new BadRequestException('City Not Found'),
      );

      await expect(
        controller.update(locationId, updateLocationDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
