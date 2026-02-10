import { Module } from '@nestjs/common'
import { PolicyController } from './policy.controller'
import { PolicyService } from './policy.service'
import { RateLimitModule } from '@core/services/rate-limit.module'

@Module({
  imports: [RateLimitModule],
  controllers: [PolicyController],
  providers: [PolicyService],
})
export class PolicyModule {}
