import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsUUID()
  divisionId: string;

  @ApiProperty()
  @IsObject()
  ingredients: object;

  @ApiProperty()
  @IsNumber()
  strength: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  packedSize: string;

  @ApiProperty()
  @IsNumber()
  mrp: number;

  @ApiProperty()
  @IsNumber()
  ptr: number;

  @ApiProperty()
  @IsNumber()
  pts: number;

  @ApiProperty()
  @IsInt()
  statusId: number;
}
