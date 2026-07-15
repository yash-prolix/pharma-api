import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { QueryDoctorDto } from './dto/query-doctor.dto';
import { BadRequestException } from '@nestjs/common';
import { ValidationService } from 'src/shared/validation/validation.service';

describe('DoctorService', () => {
  let service: DoctorService;
  let prismaService: PrismaService;
  let validationService: ValidationService;

  const mockPrismaService = {
    doctor: {
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
        DoctorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    prismaService = module.get<PrismaService>(PrismaService);
    validationService = module.get<ValidationService>(ValidationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new doctor after validating location', async () => {
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
      const mockDoctor = {
        id: 'doctor-123',
        ...createDoctorDto,
        createdBy: null,
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: new Date(),
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.doctor.create.mockResolvedValue(mockDoctor);

      const result = await service.create(createDoctorDto);

      expect(result).toEqual(mockDoctor);
      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        locationId: createDoctorDto.locationId,
      });
      expect(mockPrismaService.doctor.create).toHaveBeenCalledWith({
        data: createDoctorDto,
      });
    });

    it('should throw error when location validation fails', async () => {
      const createDoctorDto: CreateDoctorDto = {
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Cardiology',
        qualification: 'MBBS',
        experience: 5,
        address: '123 Medical St',
        locationId: 'invalid-location',
      };

      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(service.create(createDoctorDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDoctorDto)).rejects.toThrow(
        'Location Not Found',
      );
      expect(mockPrismaService.doctor.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating doctor', async () => {
      const createDoctorDto: CreateDoctorDto = {
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Cardiology',
        qualification: 'MBBS',
        experience: 5,
        address: '123 Medical St',
        locationId: 'location-123',
      };

      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.doctor.create.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.create(createDoctorDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all doctors with pagination and location included', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
      };
      const mockDoctors = [
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
      ];

      mockPrismaService.doctor.findMany.mockResolvedValue(mockDoctors);
      mockPrismaService.doctor.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toEqual({
        doctors: mockDoctors,
        total: 1,
      });
      expect(mockPrismaService.doctor.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          location: true,
        },
      });
    });

    it('should filter doctors by locationId', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
        locationId: 'location-123',
      };
      const mockDoctors = [
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
      ];

      mockPrismaService.doctor.findMany.mockResolvedValue(mockDoctors);
      mockPrismaService.doctor.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.doctors).toEqual(mockDoctors);
      expect(mockPrismaService.doctor.findMany).toHaveBeenCalledWith({
        where: {
          locationId: 'location-123',
        },
        skip: 0,
        take: 10,
        include: {
          location: true,
        },
      });
    });

    it('should filter doctors by specialization (case insensitive)', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
        specialization: 'cardio',
      };
      const mockDoctors = [
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
      ];

      mockPrismaService.doctor.findMany.mockResolvedValue(mockDoctors);
      mockPrismaService.doctor.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result.doctors).toEqual(mockDoctors);
      expect(mockPrismaService.doctor.findMany).toHaveBeenCalledWith({
        where: {
          specialization: {
            contains: 'cardio',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        include: {
          location: true,
        },
      });
    });

    it('should filter by both locationId and specialization', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
        locationId: 'location-123',
        specialization: 'Cardiology',
      };

      mockPrismaService.doctor.findMany.mockResolvedValue([]);
      mockPrismaService.doctor.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(mockPrismaService.doctor.findMany).toHaveBeenCalledWith({
        where: {
          locationId: 'location-123',
          specialization: {
            contains: 'Cardiology',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        include: {
          location: true,
        },
      });
    });

    it('should return empty array when no doctors found', async () => {
      const query: QueryDoctorDto = {
        offset: 0,
        limit: 10,
      };

      mockPrismaService.doctor.findMany.mockResolvedValue([]);
      mockPrismaService.doctor.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result).toEqual({
        doctors: [],
        total: 0,
      });
    });
  });

  describe('findOne', () => {
    it('should return a doctor by id with location included', async () => {
      const doctorId = 'doctor-123';
      const mockDoctor = {
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

      mockPrismaService.doctor.findUnique.mockResolvedValue(mockDoctor);

      const result = await service.findOne(doctorId);

      expect(result).toEqual(mockDoctor);
      expect(mockPrismaService.doctor.findUnique).toHaveBeenCalledWith({
        where: { id: doctorId },
        include: {
          location: true,
        },
      });
    });

    it('should throw BadRequestException when doctor not found', async () => {
      const doctorId = 'nonexistent-id';

      mockPrismaService.doctor.findUnique.mockResolvedValue(null);

      await expect(service.findOne(doctorId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne(doctorId)).rejects.toThrow(
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
      const existingDoctor = {
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
      const updatedDoctor = {
        ...existingDoctor,
        specialization: 'Neurology',
        experience: 15,
        updatedAt: new Date(),
      };

      mockPrismaService.doctor.findUnique.mockResolvedValue(existingDoctor);
      mockPrismaService.doctor.update.mockResolvedValue(updatedDoctor);

      const result = await service.update(doctorId, updateDoctorDto);

      expect(result).toEqual(updatedDoctor);
      expect(mockPrismaService.doctor.update).toHaveBeenCalledWith({
        where: { id: doctorId },
        data: updateDoctorDto,
      });
    });

    it('should validate location when updating locationId', async () => {
      const doctorId = 'doctor-123';
      const updateDoctorDto: UpdateDoctorDto = {
        locationId: 'new-location-123',
      };
      const existingDoctor = {
        id: doctorId,
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
      };

      mockPrismaService.doctor.findUnique.mockResolvedValue(existingDoctor);
      mockValidationService.validateReferences.mockResolvedValue(undefined);
      mockPrismaService.doctor.update.mockResolvedValue({
        ...existingDoctor,
        locationId: 'new-location-123',
      });

      await service.update(doctorId, updateDoctorDto);

      expect(mockValidationService.validateReferences).toHaveBeenCalledWith({
        locationId: 'new-location-123',
      });
    });

    it('should not validate location when locationId is not being updated', async () => {
      const doctorId = 'doctor-123';
      const updateDoctorDto: UpdateDoctorDto = {
        specialization: 'Neurology',
      };
      const existingDoctor = {
        id: doctorId,
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
      };

      mockPrismaService.doctor.findUnique.mockResolvedValue(existingDoctor);
      mockPrismaService.doctor.update.mockResolvedValue({
        ...existingDoctor,
        specialization: 'Neurology',
      });

      await service.update(doctorId, updateDoctorDto);

      expect(mockValidationService.validateReferences).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when updating non-existent doctor', async () => {
      const doctorId = 'nonexistent-id';
      const updateDoctorDto: UpdateDoctorDto = {
        specialization: 'Neurology',
      };

      mockPrismaService.doctor.findUnique.mockResolvedValue(null);

      await expect(service.update(doctorId, updateDoctorDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(doctorId, updateDoctorDto)).rejects.toThrow(
        'Doctor Not Found',
      );

      expect(mockPrismaService.doctor.update).not.toHaveBeenCalled();
    });

    it('should throw error when location validation fails during update', async () => {
      const doctorId = 'doctor-123';
      const updateDoctorDto: UpdateDoctorDto = {
        locationId: 'invalid-location',
      };
      const existingDoctor = {
        id: doctorId,
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
      };

      mockPrismaService.doctor.findUnique.mockResolvedValue(existingDoctor);
      mockValidationService.validateReferences.mockRejectedValue(
        new BadRequestException('Location Not Found'),
      );

      await expect(service.update(doctorId, updateDoctorDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(doctorId, updateDoctorDto)).rejects.toThrow(
        'Location Not Found',
      );

      expect(mockPrismaService.doctor.update).not.toHaveBeenCalled();
    });
  });
});
