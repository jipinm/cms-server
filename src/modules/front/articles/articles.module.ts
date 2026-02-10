import { Module } from '@nestjs/common'
import { ArticlesController } from './articles.controller'
import { ArticlesService } from './articles.service'
import { RateLimitModule } from '@core/services/rate-limit.module'

@Module({
  imports: [RateLimitModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
