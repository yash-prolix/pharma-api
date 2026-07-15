import { Test, TestingModule } from '@nestjs/testing';
import { DivisionController } from './division.controller';
import { DivisionService } from './division.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { QueryDivisionDto } from './dto/query-division.dto';
import { BadRequestException } from '@nestjs/common';

describe('DivisionController', () => {
  let controller: DivisionController;
  let service: DivisionService;

  const mockDivisionService = {
    create: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    update: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DivisionController],
      providers: [
        {
          provide: DivisionService,
          useValue: mockDivisionService,
        },
      ],
    }).compile();

    controller = module.get<DivisionController>(DivisionController);
    service = module.get<DivisionService>(DivisionService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new division', async () => {
      const createDivisionDto: CreateDivisionDto = {
        name: 'Cardiology',
      };
      const expectedResult = {
        id: 'division-123',
        name: 'Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockDivisionService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDivisionDto);

      expect(result).toEqual(expectedResult);
      expect(mockDivisionService.create).toHaveBeenCalledWith(
        createDivisionDto,
      );
      expect(mockDivisionService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors when creating division', async () => {
      const createDivisionDto: CreateDivisionDto = {
        name: 'Cardiology',
      };

      mockDivisionService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createDivisionDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all divisions with pagination', async () => {
      const query: QueryDivisionDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        divisions: [
          {
            id: 'division-1',
            name: 'Cardiology',
            createdBy: null,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: new Date(),
          },
          {
            id: 'division-2',
            name: 'Neurology',
            createdBy: null,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: new Date(),
          },
        ],
        total: 2,
      };

      mockDivisionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockDivisionService.findAll).toHaveBeenCalledWith(query);
      expect(mockDivisionService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return filtered divisions by name', async () => {
      const query: QueryDivisionDto = {
        offset: 0,
        limit: 10,
        name: 'Cardio',
      };
      const expectedResult = {
        divisions: [
          {
            id: 'division-1',
            name: 'Cardiology',
            createdBy: null,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: new Date(),
          },
        ],
        total: 1,
      };

      mockDivisionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockDivisionService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no divisions found', async () => {
      const query: QueryDivisionDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        divisions: [],
        total: 0,
      };

      mockDivisionService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(result.divisions).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a single division by id', async () => {
      const divisionId = 'division-123';
      const expectedResult = {
        id: divisionId,
        name: 'Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockDivisionService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(divisionId);

      expect(result).toEqual(expectedResult);
      expect(mockDivisionService.findOne).toHaveBeenCalledWith(divisionId);
      expect(mockDivisionService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when division not found', async () => {
      const divisionId = 'nonexistent-id';

      mockDivisionService.findOne.mockRejectedValue(
        new BadRequestException('Division Not Found'),
      );

      await expect(controller.findOne(divisionId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOne(divisionId)).rejects.toThrow(
        'Division Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a division successfully', async () => {
      const divisionId = 'division-123';
      const updateDivisionDto: UpdateDivisionDto = {
        name: 'Updated Cardiology',
      };
      const expectedResult = {
        id: divisionId,
        name: 'Updated Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockDivisionService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(divisionId, updateDivisionDto);

      expect(result).toEqual(expectedResult);
      expect(mockDivisionService.update).toHaveBeenCalledWith(
        divisionId,
        updateDivisionDto,
      );
      expect(mockDivisionService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when updating non-existent division', async () => {
      const divisionId = 'nonexistent-id';
      const updateDivisionDto: UpdateDivisionDto = {
        name: 'Updated Name',
      };

      mockDivisionService.update.mockRejectedValue(
        new BadRequestException('Division Not Found'),
      );

      await expect(
        controller.update(divisionId, updateDivisionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update division with partial data', async () => {
      const divisionId = 'division-123';
      const updateDivisionDto: UpdateDivisionDto = {};
      const expectedResult = {
        id: divisionId,
        name: 'Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockDivisionService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(divisionId, updateDivisionDto);

      expect(result).toEqual(expectedResult);
      expect(mockDivisionService.update).toHaveBeenCalledWith(
        divisionId,
        updateDivisionDto,
      );
    });
  });
});
