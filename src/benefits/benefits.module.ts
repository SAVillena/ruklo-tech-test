import { Module } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [BenefitsService],
  exports: [BenefitsService],
})
export class BenefitsModule {}
