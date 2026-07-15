import { Module } from '@nestjs/common';
import { MedicalStoreService } from './medical-store.service';
import { MedicalStoreController } from './medical-store.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ValidationService } from 'src/shared/validation/validation.service';

@Module({
  imports: [PrismaModule],
  controllers: [MedicalStoreController],
  providers: [MedicalStoreService, ValidationService],
})
export class MedicalStoreModule {}
