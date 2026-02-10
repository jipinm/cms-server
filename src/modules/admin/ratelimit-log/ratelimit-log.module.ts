import { Module } from '@nestjs/common';
import { RatelimitLogService } from './ratelimit-log.service';
import { RatelimitLogController } from './ratelimit-log.controller';

@Module({
  controllers: [RatelimitLogController],
  providers: [RatelimitLogService],
})
export class RatelimitLogModule {}
