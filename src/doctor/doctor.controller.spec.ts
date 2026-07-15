import { Test, TestingModule } from '@nestjs/testing';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { QueryDoctorDto } from './dto/query-doctor.dto';
import { BadRequestException } from '@nestjs/common';

describe('DoctorController', () => {
  let controller: DoctorController;
  let service: DoctorService;

  const mockDoctorService = {
    create: jest.fn() as any,
    findAll: jest.fn() as any,
    findOne: jest.fn() as any,
    update: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorController],
      providers: [
        {
          provide: DoctorService,
          useValue: mockDoctorService,
        },
      ],
    }).compile();

    controller = module.get<DoctorController>(DoctorController);
    service = module.get<DoctorService>(DoctorService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new doctor', async () => {
      const createDoctorDto: CreateDoctorDto = {
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD',
        experience: 10,
        address: '123 Medical St',
        locationId: 'location-123',
        isActive: true,
      };
      const expectedResult = {
        id: 'doctor-123',
        ...createDoctorDto,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockDoctorService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDoctorDto);

      expect(result).toEqual(expectedResult);
      expect(mockDoctorService.create).toHaveBeenCalledWith(createDoctorDto);
      expect(mockDoctorService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors when creating doctor', async () => {
      const createDoctorDto: CreateDoctorDto = {
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Cardiology',
        qualification: 'MBBS',
        experience: 5,
        address: '123 Medical St',
        locationId: 'invalid-location-id',
      };

      mockDoctorService.create.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(controller.create(createDoctorDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all doctors with pagination', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        doctors: [
          {
            id: 'doctor-1',
            firstName: 'John',
            lastName: 'Doe',
            specialization: 'Cardiology',
            qualification: 'MBBS, MD',
            experience: 10,
            address: '123 Medical St',
            locationId: 'location-1',
            isActive: true,
            createdBy: null,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: new Date(),
            location: {
              id: 'location-1',
              name: 'City Hospital',
            },
          },
        ],
        total: 1,
      };

      mockDoctorService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockDoctorService.findAll).toHaveBeenCalledWith(query);
      expect(mockDoctorService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter doctors by locationId', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
        locationId: 'location-123',
      };
      const expectedResult = {
        doctors: [
          {
            id: 'doctor-1',
            firstName: 'John',
            lastName: 'Doe',
            specialization: 'Cardiology',
            qualification: 'MBBS',
            experience: 10,
            address: '123 Medical St',
            locationId: 'location-123',
            isActive: true,
            createdBy: null,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: new Date(),
            location: {
              id: 'location-123',
              name: 'City Hospital',
            },
          },
        ],
        total: 1,
      };

      mockDoctorService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockDoctorService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter doctors by specialization', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
        specialization: 'Cardio',
      };
      const expectedResult = {
        doctors: [
          {
            id: 'doctor-1',
            firstName: 'John',
            lastName: 'Doe',
            specialization: 'Cardiology',
            qualification: 'MBBS',
            experience: 10,
            address: '123 Medical St',
            locationId: 'location-1',
            isActive: true,
            createdBy: null,
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: new Date(),
            location: {
              id: 'location-1',
              name: 'City Hospital',
            },
          },
        ],
        total: 1,
      };

      mockDoctorService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockDoctorService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty array when no doctors found', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
      };
      const expectedResult = {
        doctors: [],
        total: 0,
      };

      mockDoctorService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(result.doctors).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a single doctor by id', async () => {
      const doctorId = 'doctor-123';
      const expectedResult = {
        id: doctorId,
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD',
        experience: 10,
        address: '123 Medical St',
        locationId: 'location-1',
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
        location: {
          id: 'location-1',
          name: 'City Hospital',
        },
      };

      mockDoctorService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(doctorId);

      expect(result).toEqual(expectedResult);
      expect(mockDoctorService.findOne).toHaveBeenCalledWith(doctorId);
      expect(mockDoctorService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when doctor not found', async () => {
      const doctorId = 'nonexistent-id';

      mockDoctorService.findOne.mockRejectedValue(
        new BadRequestException('Doctor Not Found'),
      );

      await expect(controller.findOne(doctorId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findOne(doctorId)).rejects.toThrow(
        'Doctor Not Found',
      );
    });
  });

  describe('update', () => {
    it('should update a doctor successfully', async () => {
      const doctorId = 'doctor-123';
      const updateDoctorDto: UpdateDoctorDto = {
        specialization: 'Neurology',
        experience: 15,
      };
      const expectedResult = {
        id: doctorId,
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Neurology',
        qualification: 'MBBS, MD',
        experience: 15,
        address: '123 Medical St',
        locationId: 'location-1',
        isActive: true,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockDoctorService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(doctorId, updateDoctorDto);

      expect(result).toEqual(expectedResult);
      expect(mockDoctorService.update).toHaveBeenCalledWith(
        doctorId,
        updateDoctorDto,
      );
      expect(mockDoctorService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when updating non-existent doctor', async () => {
      const doctorId = 'nonexistent-id';
      const updateDoctorDto: UpdateDoctorDto = {
        specialization: 'Neurology',
      };

      mockDoctorService.update.mockRejectedValue(
        new BadRequestException('Doctor Not Found'),
      );

      await expect(
        controller.update(doctorId, updateDoctorDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate location when updating locationId', async () => {
      const doctorId = 'doctor-123';
      const updateDoctorDto: UpdateDoctorDto = {
        locationId: 'invalid-location',
      };

      mockDoctorService.update.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(
        controller.update(doctorId, updateDoctorDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
