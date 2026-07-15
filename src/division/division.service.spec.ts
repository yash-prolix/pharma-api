import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { DivisionService } from './division.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { QueryDivisionDto } from './dto/query-division.dto';
import { BadRequestException } from '@nestjs/common';

describe('DivisionService', () => {
  let service: DivisionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    division: {
      create: jest.fn() as any,
      findMany: jest.fn() as any,
      findUnique: jest.fn() as any,
      update: jest.fn() as any,
      count: jest.fn() as any,
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DivisionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DivisionService>(DivisionService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new division', async () => {
      const createDivisionDto: CreateDivisionDto = {
        name: 'Cardiology',
      };
      const mockDivision = {
        id: 'division-123',
        name: 'Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.division.create.mockResolvedValue(mockDivision);

      const result = await service.create(createDivisionDto);

      expect(result).toEqual(mockDivision);
      expect(mockPrismaService.division.create).toHaveBeenCalledWith({
        data: createDivisionDto,
      });
      expect(mockPrismaService.division.create).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors when creating division', async () => {
      const createDivisionDto: CreateDivisionDto = {
        name: 'Cardiology',
      };

      mockPrismaService.division.create.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.create(createDivisionDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all divisions with pagination', async () => {
      const query: QueryDivisionDto = {
        offset: 0,
        limit: 10,
      };
      const mockDivisions = [
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
      ];

      mockPrismaService.division.findMany.mockResolvedValue(mockDivisions);
      mockPrismaService.division.count.mockResolvedValue(2);

      const result = await service.findAll(query);

      expect(result).toEqual({
        divisions: mockDivisions,
        total: 2,
      });
      expect(mockPrismaService.division.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
      });
      expect(mockPrismaService.division.count).toHaveBeenCalledWith({
        where: {},
      });
    });

    it('should filter divisions by name (case insensitive)', async () => {
      const query: QueryDivisionDto = {
        offset: 0,
        limit: 10,
        name: 'cardio',
      };
      const mockDivisions = [
        {
          id: 'division-1',
          name: 'Cardiology',
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.division.findMany.mockResolvedValue(mockDivisions);
      mockPrismaService.division.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        divisions: mockDivisions,
        total: 1,
      });
      expect(mockPrismaService.division.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'cardio',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
      });
    });

    it('should return empty array when no divisions found', async () => {
      const query: QueryDivisionDto = {
        offset: 0,
        limit: 10,
      };

      mockPrismaService.division.findMany.mockResolvedValue([]);
      mockPrismaService.division.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result).toEqual({
        divisions: [],
        total: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const query: QueryDivisionDto = {
        offset: 10,
        limit: 5,
      };
      const mockDivisions = [
        {
          id: 'division-11',
          name: 'Division 11',
          createdBy: null,
          createdAt: new Date(),
          updatedBy: null,
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.division.findMany.mockResolvedValue(mockDivisions);
      mockPrismaService.division.count.mockResolvedValue(15);

      const result = await service.findAll(query);

      expect(result.total).toBe(15);
      expect(mockPrismaService.division.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 5,
      });
    });
  });

  describe('findOne', () => {
    it('should return a division by id', async () => {
      const divisionId = 'division-123';
      const mockDivision = {
        id: divisionId,
        name: 'Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.division.findUnique.mockResolvedValue(mockDivision);

      const result = await service.findOne(divisionId);

      expect(result).toEqual(mockDivision);
      expect(mockPrismaService.division.findUnique).toHaveBeenCalledWith({
        where: { id: divisionId },
      });
    });

    it('should throw BadRequestException when division not found', async () => {
      const divisionId = 'nonexistent-id';

      mockPrismaService.division.findUnique.mockResolvedValue(null);

      await expect(service.findOne(divisionId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(divisionId)).rejects.toThrow(
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
      const existingDivision = {
        id: divisionId,
        name: 'Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };
      const updatedDivision = {
        ...existingDivision,
        name: 'Updated Cardiology',
        updatedAt: new Date(),
      };

      mockPrismaService.division.findUnique.mockResolvedValue(existingDivision);
      mockPrismaService.division.update.mockResolvedValue(updatedDivision);

      const result = await service.update(divisionId, updateDivisionDto);

      expect(result).toEqual(updatedDivision);
      expect(mockPrismaService.division.findUnique).toHaveBeenCalledWith({
        where: { id: divisionId },
      });
      expect(mockPrismaService.division.update).toHaveBeenCalledWith({
        where: { id: divisionId },
        data: updateDivisionDto,
      });
    });

    it('should throw BadRequestException when updating non-existent division', async () => {
      const divisionId = 'nonexistent-id';
      const updateDivisionDto: UpdateDivisionDto = {
        name: 'Updated Name',
      };

      mockPrismaService.division.findUnique.mockResolvedValue(null);

      await expect(
        service.update(divisionId, updateDivisionDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(divisionId, updateDivisionDto),
      ).rejects.toThrow('Division Not Found');

      // Verify update was not called
      expect(mockPrismaService.division.update).not.toHaveBeenCalled();
    });

    it('should call findOne before updating', async () => {
      const divisionId = 'division-123';
      const updateDivisionDto: UpdateDivisionDto = {
        name: 'Updated Name',
      };
      const mockDivision = {
        id: divisionId,
        name: 'Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.division.findUnique.mockResolvedValue(mockDivision);
      mockPrismaService.division.update.mockResolvedValue({
        ...mockDivision,
        name: 'Updated Name',
      });

      await service.update(divisionId, updateDivisionDto);

      // Verify both methods were called
      expect(mockPrismaService.division.findUnique).toHaveBeenCalledWith({
        where: { id: divisionId },
      });
      expect(mockPrismaService.division.update).toHaveBeenCalledWith({
        where: { id: divisionId },
        data: updateDivisionDto,
      });
    });

    it('should update with empty DTO (no changes)', async () => {
      const divisionId = 'division-123';
      const updateDivisionDto: UpdateDivisionDto = {};
      const mockDivision = {
        id: divisionId,
        name: 'Cardiology',
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockPrismaService.division.findUnique.mockResolvedValue(mockDivision);
      mockPrismaService.division.update.mockResolvedValue(mockDivision);

      const result = await service.update(divisionId, updateDivisionDto);

      expect(result).toEqual(mockDivision);
      expect(mockPrismaService.division.update).toHaveBeenCalledWith({
        where: { id: divisionId },
        data: updateDivisionDto,
      });
    });
  });
});
