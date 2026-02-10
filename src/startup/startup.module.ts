import { Module } from '@nestjs/common'
import { StartupService } from './startup.service'
import { DatabaseModule } from '@database/database.module'

@Module({
  imports: [DatabaseModule],
  providers: [StartupService],
})
export class StartupModule {}