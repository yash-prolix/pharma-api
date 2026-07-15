import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryUserDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  statusId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  roleId?: number;
}
