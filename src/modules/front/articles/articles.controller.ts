import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ArticlesService } from './articles.service'
import {
  QueryArticleDto,
  QueryArticleDetailByIdDto,
  QueryArticleBySlugDto,
  ReplaceUrlPrefixDto,
} from './dto/query-article.dto'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { Public } from '@core/guards/jwt-auth.guard'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { ArticleVo } from './vo/article.vo'
import { CategoryVo } from '@modules/admin/categories/vo'
import { TagVo } from '../../admin/tags/vo/tag.vo'
import { RateLimit } from '@core/decorators/rate-limit.decorator'

@ApiTags('前台文章')
@Controller('front/articles')
@Public()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('detailById')
  @RateLimit({ ttl: 60, limit: 60 }) // 每分钟最多60次请求
  @ApiOperation({ summary: '根据文章ID获取文章详情' })
  @ApiResult(ArticleVo)
  async findOne(@Query(ValidationPipe) query: QueryArticleDetailByIdDto) {
    return await this.articlesService.findOne(query.id)
  }

  @Get('detailBySlug')
  @RateLimit({ ttl: 60, limit: 60 }) // 每分钟最多60次请求
  @ApiOperation({ summary: '根据文章别名获取文章详情' })
  @ApiResult(ArticleVo)
  async findBySlug(@Query(ValidationPipe) query: QueryArticleBySlugDto) {
    return await this.articlesService.findBySlug(query.siteCode, query.slug)
  }

  @Get()
  @RateLimit({ ttl: 60, limit: 60 }) // 每分钟最多60次请求
  @ApiOperation({ summary: '分页查询文章列表' })
  @ApiResult(ArticleVo, { isArray: true, isPager: true })
  async findAll(@Query(ValidationPipe) query: QueryArticleDto) {
    return this.articlesService.findAll(query)
  }

  @Get('/test-rate-limit')
  @RateLimit({ ttl: 60, limit: 2 }) // 每分钟最多2次请求
  async testRateLimit() {
    return true
  }

  @Get('categories')
  @RateLimit({ ttl: 60, limit: 60 }) // 每分钟最多60次请求
  @ApiOperation({ summary: '获取站点下所有目录' })
  @ApiResult(CategoryVo, { isArray: true })
  async findCategories(@Query('siteCode') siteCode: string) {
    return this.articlesService.findCategories(siteCode)
  }

  @Get('tags')
  @RateLimit({ ttl: 60, limit: 60 }) // 每分钟最多60次请求
  @ApiOperation({ summary: '获取站点下所有标签' })
  @ApiResult(TagVo, { isArray: true })
  async findTags(@Query('siteCode') siteCode: string) {
    return this.articlesService.findTags(siteCode)
  }

  @Post('replaceUrlPrefix')
  @ApiOperation({ summary: '替换文章内容' })
  @ApiResult(String)
  async replaceUrlPrefix(@Body(ValidationPipe) body: ReplaceUrlPrefixDto) {
    return this.articlesService.replaceUrlPrefix(body)
  }
}
