import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '@database/database.module'
import { CrmService } from './crm.service'

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
