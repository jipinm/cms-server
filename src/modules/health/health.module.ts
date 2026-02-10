import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './health.controller'
import { ApiHealthIndicator, DatabaseHealthIndicator, RedisHealthIndicator } from './health.indicator'
import { RateLimitModule } from '@core/services/rate-limit.module'

@Module({
  imports: [HttpModule, TerminusModule, RateLimitModule],
  controllers: [HealthController],
  providers: [ApiHealthIndicator, DatabaseHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
