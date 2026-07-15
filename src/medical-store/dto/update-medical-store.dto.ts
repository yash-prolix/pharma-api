import { PartialType } from '@nestjs/swagger';
import { CreateMedicalStoreDto } from './create-medical-store.dto';

export class UpdateMedicalStoreDto extends PartialType(CreateMedicalStoreDto) {}
