import { Module } from '@nestjs/common';
import { HelperServices } from './helper.services';

@Module({
  providers: [HelperServices],
  exports: [HelperServices],
})
export class HelperModule {}
