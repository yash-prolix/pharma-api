import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/validation/validation.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const references = await this.validationService.validateReferences({
      userId: createTransactionDto.medicalRepresentativeId,
      productId: createTransactionDto.productId,
      medicalStoreId: createTransactionDto.medicalStoreId,
    });

    if (createTransactionDto.doctorId) {
      await this.validationService.validateReferences({
        doctorId: createTransactionDto.doctorId,
      });
    }

    let mrp = references.product.mrp;

    createTransactionDto.totalAmount = mrp * createTransactionDto.quantity;

    const transaction = await this.prisma.transaction.create({
      data: { ...createTransactionDto, mrp },
    });
    return transaction;
  }

  async findAll(query: QueryTransactionDto) {
    const {
      offset,
      limit,
      medicalRepresentativeId,
      productId,
      doctorId,
      medicalStoreId,
    } = query;

    const whereClause: Record<string, any> = {};

    if (medicalRepresentativeId)
      whereClause.medicalRepresentativeId = medicalRepresentativeId;
    if (productId) whereClause.productId = productId;
    if (doctorId) whereClause.doctorId = doctorId;
    if (medicalStoreId) whereClause.medicalStoreId = medicalStoreId;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        include: {
          medicalRepresentative: true,
          product: true,
          doctor: true,
          medicalStore: true,
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);

    return { transactions, total };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        medicalRepresentative: true,
        product: true,
        doctor: true,
        medicalStore: true,
      },
    });

    if (!transaction) throw new BadRequestException('Transaction Not Found');
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id);

    if (updateTransactionDto.medicalRepresentativeId) {
      await this.validationService.validateReference(
        'user',
        updateTransactionDto.medicalRepresentativeId,
      );
    }

    const validation: Record<string, any> = {};
    if (updateTransactionDto.productId)
      validation.productId = updateTransactionDto.productId;
    if (updateTransactionDto.medicalStoreId)
      validation.medicalStoreId = updateTransactionDto.medicalStoreId;
    if (updateTransactionDto.doctorId)
      validation.doctorId = updateTransactionDto.doctorId;

    if (Object.keys(validation).length > 0) {
      await this.validationService.validateReferences(validation);
    }

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
    return transaction;
  }
}
