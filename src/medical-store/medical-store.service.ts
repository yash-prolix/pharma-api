import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMedicalStoreDto } from './dto/create-medical-store.dto';
import { UpdateMedicalStoreDto } from './dto/update-medical-store.dto';
import { QueryMedicalStoreDto } from './dto/query-medical-store.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/validation/validation.service';

@Injectable()
export class MedicalStoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createMedicalStoreDto: CreateMedicalStoreDto) {
    await this.validationService.validateReferences({
      locationId: createMedicalStoreDto.locationId,
    });

    const medicalStore = await this.prisma.medicalStore.create({
      data: createMedicalStoreDto,
    });
    return medicalStore;
  }

  async findAll(query: QueryMedicalStoreDto) {
    const { offset, limit, locationId } = query;

    const whereClause: Record<string, any> = {};

    if (locationId) {
      whereClause.locationId = locationId;
    }

    const [medicalStores, total] = await Promise.all([
      this.prisma.medicalStore.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        include: {
          location: true,
        },
      }),
      this.prisma.medicalStore.count({
        where: whereClause,
      }),
    ]);

    return { medicalStores, total };
  }

  async findOne(id: string) {
    const medicalStore = await this.prisma.medicalStore.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });

    if (!medicalStore) throw new BadRequestException('Medical Store Not Found');
    return medicalStore;
  }

  async update(id: string, updateMedicalStoreDto: UpdateMedicalStoreDto) {
    await this.findOne(id);

    if (updateMedicalStoreDto.locationId) {
      await this.validationService.validateReferences({
        locationId: updateMedicalStoreDto.locationId,
      });
    }

    const medicalStore = await this.prisma.medicalStore.update({
      where: { id },
      data: updateMedicalStoreDto,
    });
    return medicalStore;
  }
}
