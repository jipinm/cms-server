import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto, QueryCategoryDto, UpdateCategoryDto } from './dto'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { CategoryDetailVo, CategoryVo } from './vo'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { Permissions } from '@core/decorators/permissions.decorator'

@ApiTags('文章分类管理')
@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: '创建分类' })
  @ApiResult(CategoryVo)
  @Post()
  @Permissions('categories:create')
  create(@Body(ValidationPipe) createCategoryDto: CreateCategoryDto, @RequestUser() user) {
    return this.categoriesService.create(createCategoryDto, user)
  }

  @ApiOperation({ summary: '分类列表' })
  @ApiResult(CategoryVo, { isArray: true, isPager: true })
  @Get()
  @Permissions('categories:list')
  findAll(@Query(ValidationPipe) query: QueryCategoryDto, @RequestUser() user: JwtUser) {
    return this.categoriesService.findAll(query, user)
  }

  @ApiOperation({ summary: '分类详情' })
  @ApiResult(CategoryDetailVo)
  @Get(':id')
  @Permissions('categories:read')
  findOne(@Param('id', ParseIntPipe) id: number, @RequestUser() user) {
    return this.categoriesService.findOne(id, user)
  }

  @ApiOperation({ summary: '更新分类' })
  @ApiResult(CategoryVo)
  @Patch(':id')
  @Permissions('categories:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
    @RequestUser() user,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user)
  }

  @ApiOperation({ summary: '删除分类' })
  @Delete(':id')
  @Permissions('categories:delete')
  remove(@Param('id', ParseIntPipe) id: number, @RequestUser() user) {
    return this.categoriesService.remove(id, user)
  }
}
