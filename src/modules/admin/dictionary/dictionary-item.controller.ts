import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DictionaryItemService } from './dictionary-item.service'
import {
  CreateDictionaryItemDto,
  DictionaryItemQuery,
  UpdateDictionaryItemDto,
  QueryDictionaryItemDto,
} from './dto/dictionary-item.dto'
import { DictionaryItemVo } from './vo/dictionary-item.vo'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
@ApiTags('字典项管理')
@Controller('admin/dictionary/item')
export class DictionaryItemController {
  constructor(private readonly dictionaryItemService: DictionaryItemService) {}

  @Post()
  @ApiOperation({ summary: '创建字典项' })
  @ApiResult(DictionaryItemVo)
  async create(@RequestUser() user: JwtUser, @Body(ValidationPipe) dto: CreateDictionaryItemDto) {
    return this.dictionaryItemService.create(user.siteId, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新字典项' })
  @ApiResult(DictionaryItemVo)
  async update(
    @RequestUser() user: JwtUser,
    @Param('id') id: number,
    @Body(ValidationPipe) dto: UpdateDictionaryItemDto,
  ) {
    return this.dictionaryItemService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除字典项' })
  @ApiResult(DictionaryItemVo)
  async delete(@RequestUser() user: JwtUser, @Param('id') id: number) {
    return this.dictionaryItemService.delete(id)
  }

  // 根据label或者value获取字典项详情
  @Get('detail')
  @ApiOperation({ summary: '根据label或者value获取字典项详情' })
  @ApiResult(DictionaryItemVo)
  async findByLabelOrValue(@RequestUser() user: JwtUser, @Query(ValidationPipe) query: QueryDictionaryItemDto) {
    return this.dictionaryItemService.findByLabelOrValue(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取字典项详情' })
  @ApiResult(DictionaryItemVo)
  async findById(@RequestUser() user: JwtUser, @Param('id', ParseIntPipe) id: number) {
    return this.dictionaryItemService.findById(id)
  }

  @Get()
  @ApiOperation({ summary: '获取字典项列表' })
  @ApiResult(DictionaryItemVo, { isArray: true, isPager: true })
  async findAll(@RequestUser() user: JwtUser, @Query(ValidationPipe) query: DictionaryItemQuery) {
    return this.dictionaryItemService.findAll(user.siteId, query)
  }
}
