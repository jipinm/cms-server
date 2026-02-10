import { Global, Module } from '@nestjs/common'
import { DatabaseService } from './database.service'
import { ObsService } from '@database/obs.service'
import { RedisService } from '@database/redis.service'

@Global()
@Module({
  providers: [DatabaseService, ObsService, RedisService],
  exports: [DatabaseService, ObsService, RedisService],
})
export class DatabaseModule {}
