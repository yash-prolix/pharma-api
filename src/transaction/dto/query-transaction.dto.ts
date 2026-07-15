import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryTransactionDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  medicalRepresentativeId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  medicalStoreId?: string;
}
