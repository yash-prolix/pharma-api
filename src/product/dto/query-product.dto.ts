import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryProductDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  divisionId?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  statusId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
