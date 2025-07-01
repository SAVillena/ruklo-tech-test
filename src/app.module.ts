import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { BenefitsModule } from './benefits/benefits.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppService } from './app.service';

@Module({
  imports: [EventsModule, BenefitsModule, AnalyticsModule],
  providers: [AppService],
})
export class AppModule {}
