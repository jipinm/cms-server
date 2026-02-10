import { Module } from '@nestjs/common'
import { SitesController } from './sites.controller'
import { SitesService } from './sites.service'
import { DatabaseModule } from '@database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
