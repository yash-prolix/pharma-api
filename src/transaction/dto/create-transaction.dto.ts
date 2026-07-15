import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  medicalRepresentativeId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  medicalStoreId: string;

  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  freeQuantity?: number;

  @ApiProperty()
  @IsInt()
  totalAmount: number;
}
