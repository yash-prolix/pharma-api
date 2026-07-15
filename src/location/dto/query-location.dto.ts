import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryLocationDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  stateId?: number;
}
