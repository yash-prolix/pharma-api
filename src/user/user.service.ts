import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/validation/validation.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.validationService.validateReferences({
      userStatusId: createUserDto.statusId,
      userRoleId: createUserDto.roleId,
    });

    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return user;
  }

  async findAll(query: QueryUserDto) {
    const { offset, limit, statusId, roleId } = query;

    const whereClause: Record<string, any> = {};

    if (statusId) {
      whereClause.statusId = statusId;
    }

    if (roleId) {
      whereClause.roleId = roleId;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
    });

    return { users, total: users.length };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new BadRequestException('User Not Found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return user;
  }
}
