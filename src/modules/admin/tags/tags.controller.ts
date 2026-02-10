import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { TagsService } from './tags.service'
import { CreateTagDto, UpdateTagDto, QueryTagDto } from './dto/tag.dto'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { TagVo } from './vo/tag.vo'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { Permissions } from '@core/decorators/permissions.decorator'

@ApiTags('标签管理')
@Controller('admin/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiOperation({ summary: '创建标签' })
  @ApiResult(TagVo)
  @Post()
  @Permissions('tags:create')
  create(@Body(ValidationPipe) createTagDto: CreateTagDto, @RequestUser() user: JwtUser) {
    return this.tagsService.create(createTagDto, user)
  }

  @ApiOperation({ summary: '标签列表' })
  @ApiResult(TagVo, { isArray: true, isPager: true })
  @Get()
  @Permissions('tags:list')
  findAll(@Query(ValidationPipe) query: QueryTagDto, @RequestUser() user: JwtUser) {
    return this.tagsService.findAll(user.siteId, query)
  }

  @ApiOperation({ summary: '更新标签' })
  @ApiResult(TagVo)
  @Patch(':id')
  @Permissions('tags:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTagDto: UpdateTagDto,
    @RequestUser() user: JwtUser,
  ) {
    return this.tagsService.update(id, updateTagDto, user)
  }

  @ApiOperation({ summary: '删除标签' })
  @Delete(':id')
  @Permissions('tags:delete')
  remove(@Param('id', ParseIntPipe) id: number, @RequestUser() user: JwtUser) {
    return this.tagsService.remove(id, user)
  }
}
