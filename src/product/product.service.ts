import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/validation/validation.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    await this.validationService.validateReferences({
      divisionId: createProductDto.divisionId,
      productStatusId: createProductDto.statusId,
    });

    const productCode = await this.generateProductCode();

    createProductDto.mrp = createProductDto.mrp * 100;
    createProductDto.pts = createProductDto.mrp * 100;
    createProductDto.ptr = createProductDto.mrp * 100;

    const product = await this.prisma.product.create({
      data: { ...createProductDto, productCode },
    });
    return product;
  }

  async findAll(query: QueryProductDto) {
    const { offset, limit, divisionId, statusId, name } = query;

    const whereClause: Record<string, any> = {};

    if (divisionId) whereClause.divisionId = divisionId;
    if (statusId) whereClause.statusId = statusId;
    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        include: {
          division: true,
          status: true,
        },
      }),
      this.prisma.product.count({
        where: whereClause,
      }),
    ]);

    return { products, total };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        division: true,
        status: true,
      },
    });

    if (!product) throw new BadRequestException('Product Not Found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const validation: Record<string, number | string> = {};
    if (updateProductDto.divisionId)
      validation.divisionId = updateProductDto.divisionId;
    if (updateProductDto.statusId)
      validation.productStatusId = updateProductDto.statusId;

    if (Object.keys(validation).length > 0) {
      await this.validationService.validateReferences(validation);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
    return product;
  }

  private async generateProductCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = 'PRD-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await this.prisma.product.findUnique({
        where: { productCode: code },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return code;
  }
}
