import { Module } from '@nestjs/common'
import { AdminMenusController } from './admin-menus.controller'
import { AdminMenusService } from './admin-menus.service'
import { DatabaseModule } from '@database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [AdminMenusController],
  providers: [AdminMenusService],
  exports: [AdminMenusService],
})
export class MenusModule {}
