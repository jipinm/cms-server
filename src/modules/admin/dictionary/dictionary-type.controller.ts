import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { DictionaryTypeService } from './dictionary-type.service'
import { CreateDictionaryTypeDto, DictionaryTypeQuery, UpdateDictionaryTypeDto } from './dto/dictionary-type.dto'
import { DictionaryTypeVo } from './vo/dictionary-type.vo'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { ApiResult } from '@common/swagger/api-result-decorator'

@ApiTags('字典类型管理')
@Controller('admin/dictionary/type')
export class DictionaryTypeController {
  constructor(private readonly dictionaryTypeService: DictionaryTypeService) {}

  @Post()
  @ApiOperation({ summary: '创建字典类型' })
  @ApiResult(DictionaryTypeVo)
  async create(@RequestUser() user: JwtUser, @Body(ValidationPipe) dto: CreateDictionaryTypeDto) {
    return this.dictionaryTypeService.create(user.siteId, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新字典类型' })
  @ApiResult(DictionaryTypeVo)
  async update(@Param('id') id: number, @Body(ValidationPipe) dto: UpdateDictionaryTypeDto) {
    return this.dictionaryTypeService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除字典类型' })
  @ApiResult(null)
  async delete(@Param('id') id: number) {
    return this.dictionaryTypeService.delete(id)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取字典类型详情' })
  @ApiResult(DictionaryTypeVo)
  async findById(@Param('id') id: number) {
    return this.dictionaryTypeService.findById(id)
  }

  @Get()
  @ApiOperation({ summary: '获取字典类型列表' })
  @ApiResult(DictionaryTypeVo, { isArray: true })
  async findAll(@RequestUser() user: JwtUser, @Query(ValidationPipe) query: DictionaryTypeQuery) {
    return this.dictionaryTypeService.findAll(user.siteId, query)
  }
}
