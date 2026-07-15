import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryMedicalStoreDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  locationId?: string;
}
