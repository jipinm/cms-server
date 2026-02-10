import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ArticlesService } from './articles.service'
import { Permissions } from '@core/decorators/permissions.decorator'
import { ApiResult, SuccessVo } from '@common/swagger/api-result-decorator'
import { CreateArticleDto, QueryArticleDto, UpdateArticleDto, UpdateArticleStatusDto } from './dto/article.dto'
import { ArticleVo } from './vo/article.vo'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { RequestUser } from '@core/decorators/request-user.decorator'

@ApiTags('文章管理')
@Controller('admin/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('list')
  @ApiOperation({
    summary: '获取文章列表',
    description: '分页获取文章列表,支持按关键词搜索和状态筛选',
  })
  @Permissions('article:list')
  @ApiResult(ArticleVo, { isPager: true, isArray: true })
  async findAll(@Body(ValidationPipe) query: QueryArticleDto, @RequestUser() user: JwtUser) {
    return this.articlesService.findAll(query, user)
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取文章详情',
    description: '根据文章ID获取详细信息,包含标签和分类信息',
  })
  @Permissions('article:read')
  @ApiResult(ArticleVo)
  async findOne(@Param('id', ParseIntPipe) id: number, @RequestUser() user: JwtUser) {
    return this.articlesService.findOne(id, user)
  }

  @Post()
  @ApiOperation({ summary: '创建文章' })
  @Permissions('article:create')
  @ApiResult(ArticleVo)
  async create(@Body(ValidationPipe) createArticleDto: CreateArticleDto, @RequestUser() user: JwtUser) {
    return this.articlesService.create(createArticleDto, user)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新文章' })
  @Permissions('article:update')
  @ApiResult(ArticleVo)
  async update(@Param('id') id: number, @Body(ValidationPipe) updateArticleDto: UpdateArticleDto, @RequestUser() user) {
    return this.articlesService.update(id, updateArticleDto, user)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文章' })
  @ApiResult(SuccessVo)
  @Permissions('article:delete')
  async remove(@Param('id') id: number, @RequestUser() user: JwtUser) {
    return this.articlesService.remove(id, user)
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新文章状态' })
  @Permissions('article:update')
  @ApiResult(ArticleVo)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateStatusDto: UpdateArticleStatusDto,
    @RequestUser() user: JwtUser,
  ) {
    return this.articlesService.updateStatus(id, updateStatusDto, user)
  }
}
