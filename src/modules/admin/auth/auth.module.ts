import { AUTH_SECRET, AUTH_TOKEN_EXPIRED_TIME } from '@common/constants/auth'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { HttpModule } from '@nestjs/axios'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UsersService } from '@modules/admin/users/users.service'

@Module({
  imports: [
    PassportModule,
    HttpModule,
    JwtModule.register({
      secret: AUTH_SECRET,
      // 30 天过期
      signOptions: { expiresIn: `${AUTH_TOKEN_EXPIRED_TIME}s` },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
