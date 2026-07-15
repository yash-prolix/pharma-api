import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { MedicalStoreService } from './medical-store.service';
import { CreateMedicalStoreDto } from './dto/create-medical-store.dto';
import { UpdateMedicalStoreDto } from './dto/update-medical-store.dto';
import { QueryMedicalStoreDto } from './dto/query-medical-store.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Medical Store')
@Controller('medical-store')
export class MedicalStoreController {
  constructor(private readonly medicalStoreService: MedicalStoreService) {}

  @Post()
  create(@Body() createMedicalStoreDto: CreateMedicalStoreDto) {
    return this.medicalStoreService.create(createMedicalStoreDto);
  }

  @Get()
  findAll(@Query() query: QueryMedicalStoreDto) {
    return this.medicalStoreService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalStoreService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalStoreDto: UpdateMedicalStoreDto,
  ) {
    return this.medicalStoreService.update(id, updateMedicalStoreDto);
  }
}
