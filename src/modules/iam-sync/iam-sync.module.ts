import { Module } from '@nestjs/common'
import { IamSyncController } from './iam-sync.controller'
import { IamSyncService } from './iam-sync.service'
import { DatabaseModule } from '@database/database.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [IamSyncController],
  providers: [IamSyncService],
})
export class IamSyncModule {}
