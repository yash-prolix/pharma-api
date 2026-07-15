import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationDto } from './dto/query-location.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/validation/validation.service';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createLocationDto: CreateLocationDto) {
    await this.validationService.validateReferences({
      cityId: createLocationDto.cityId,
      stateId: createLocationDto.stateId,
    });

    const location = await this.prisma.location.create({
      data: createLocationDto,
    });
    return location;
  }

  async findAll(query: QueryLocationDto) {
    const { offset, limit, cityId, stateId } = query;

    const whereClause: Record<string, any> = {};

    if (cityId) {
      whereClause.cityId = cityId;
    }

    if (stateId) {
      whereClause.stateId = stateId;
    }

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        include: {
          city: true,
          state: true,
        },
      }),
      this.prisma.location.count({
        where: whereClause,
      }),
    ]);

    return { locations, total };
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        city: true,
        state: true,
      },
    });

    if (!location) throw new BadRequestException('Location Not Found');
    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    await this.findOne(id);

    const validation: Record<string, number> = {};
    if (updateLocationDto.cityId) validation.cityId = updateLocationDto.cityId;
    if (updateLocationDto.stateId)
      validation.stateId = updateLocationDto.stateId;

    if (Object.keys(validation).length > 0) {
      await this.validationService.validateReferences(validation);
    }

    const location = await this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
    return location;
  }
}
