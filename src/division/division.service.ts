import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { QueryDivisionDto } from './dto/query-division.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DivisionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDivisionDto: CreateDivisionDto) {
    const division = await this.prisma.division.create({
      data: createDivisionDto,
    });
    return division;
  }

  async findAll(query: QueryDivisionDto) {
    const { offset, limit, name } = query;

    const whereClause: Record<string, any> = {};

    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const [divisions, total] = await Promise.all([
      this.prisma.division.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
      }),
      this.prisma.division.count({
        where: whereClause,
      }),
    ]);

    return { divisions, total };
  }

  async findOne(id: string) {
    const division = await this.prisma.division.findUnique({
      where: { id },
    });

    if (!division) throw new BadRequestException('Division Not Found');
    return division;
  }

  async update(id: string, updateDivisionDto: UpdateDivisionDto) {
    await this.findOne(id);

    const division = await this.prisma.division.update({
      where: { id },
      data: updateDivisionDto,
    });
    return division;
  }
}
