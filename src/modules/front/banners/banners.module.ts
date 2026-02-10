import { Module } from '@nestjs/common'
import { BannersController } from './banners.controller'
import { BannersService } from './banners.service'
import { RateLimitModule } from '@core/services/rate-limit.module'

@Module({
  imports: [RateLimitModule],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
