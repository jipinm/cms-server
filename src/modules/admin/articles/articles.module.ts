import { Module } from '@nestjs/common'
import { ArticlesController } from './articles.controller'
import { ArticlesService } from './articles.service'
import { DatabaseModule } from '@database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
