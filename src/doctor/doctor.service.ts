import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/validation/validation.service';
import { QueryDoctorDto } from './dto/query-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    await this.validationService.validateReferences({
      locationId: createDoctorDto.locationId,
    });

    const doctor = await this.prisma.doctor.create({
      data: createDoctorDto,
    });
    return doctor;
  }

  async findAll(query: QueryDoctorDto) {
    const { offset, limit, locationId, specialization } = query;

    const whereClause: Record<string, any> = {};

    if (locationId) {
      whereClause.locationId = locationId;
    }

    if (specialization) {
      whereClause.specialization = {
        contains: specialization,
        mode: 'insensitive',
      };
    }

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        include: {
          location: true,
        },
      }),
      this.prisma.doctor.count({
        where: whereClause,
      }),
    ]);

    return { doctors, total };
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });

    if (!doctor) throw new BadRequestException('Doctor Not Found');
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    await this.findOne(id);

    if (updateDoctorDto.locationId) {
      await this.validationService.validateReferences({
        locationId: updateDoctorDto.locationId,
      });
    }

    const doctor = await this.prisma.doctor.update({
      where: { id },
      data: updateDoctorDto,
    });
    return doctor;
  }
}
