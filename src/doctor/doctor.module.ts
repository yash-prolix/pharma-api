import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ValidationService } from 'src/shared/validation/validation.service';

@Module({
  imports: [PrismaModule],
  controllers: [DoctorController],
  providers: [DoctorService, ValidationService],
})
export class DoctorModule {}
