import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ContactUsController } from './contact-us.controller'
import { ContactUsService } from './contact-us.service'
import { AlqCrmService } from './alq_crm.service'
import { RateLimitModule } from '@core/services/rate-limit.module'
import { CrmModule } from '@modules/crm/crm.module'

@Module({
  imports: [RateLimitModule, CrmModule, HttpModule],
  controllers: [ContactUsController],
  providers: [ContactUsService, AlqCrmService],
})
export class ContactUsModule {}
