import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ApiLogService } from './api-log.service'
import { ApiLogController } from './api-log.controller'
import { AUTH_SECRET } from '@common/constants/auth'

@Module({
  imports: [
    JwtModule.register({
      secret: AUTH_SECRET,
    }),
  ],
  controllers: [ApiLogController],
  providers: [ApiLogService],
  exports: [ApiLogService],
})
export class ApiLogModule {}
