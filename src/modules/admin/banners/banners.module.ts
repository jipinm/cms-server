import { Module } from '@nestjs/common'
import { BannersController } from './banners.controller'
import { BannersService } from './banners.service'
import { BannerPositionsController } from './banner-positions.controller'
import { BannerPositionsService } from './banner-positions.service'
import { DatabaseModule } from '@database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [BannersController, BannerPositionsController],
  providers: [BannersService, BannerPositionsService],
  exports: [BannersService, BannerPositionsService],
})
export class BannersModule {}
