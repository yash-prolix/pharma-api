import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ValidationService } from 'src/shared/validation/validation.service';

@Module({
  imports: [PrismaModule],
  controllers: [LocationController],
  providers: [LocationService, ValidationService],
})
export class LocationModule {}
