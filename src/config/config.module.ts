import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { loadNacosConfig } from './configurations/nacos.configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: false,
      // 异步加载 nacos 配置
      load: [async () => loadNacosConfig()],
    }),
  ],
})
export class AppConfigModule {}
