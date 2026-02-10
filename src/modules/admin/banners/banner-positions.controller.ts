import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BannerPositionsService } from './banner-positions.service'
import { CreateBannerPositionDto, QueryBannerPositionDto, UpdateBannerPositionDto } from './dto/banner-position.dto'
import { Permissions } from '@core/decorators/permissions.decorator'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { ApiResult, SuccessVo } from '@common/swagger/api-result-decorator'
import { BannerPositionVo } from './vo/banner-position.vo'

@ApiTags('Banner位置管理')
@Controller('admin/banner-positions')
export class BannerPositionsController {
  constructor(private readonly bannerPositionsService: BannerPositionsService) {}

  @Get()
  @ApiOperation({ summary: '获取Banner位置列表' })
  @Permissions('banner-position:list')
  @ApiResult(BannerPositionVo, { isArray: true, isPager: true })
  async findAll(@Query(ValidationPipe) query: QueryBannerPositionDto, @RequestUser() user: JwtUser) {
    return this.bannerPositionsService.findAll(query, user)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取Banner位置详情' })
  @Permissions('banner-position:read')
  @ApiResult(BannerPositionVo)
  async findOne(@Param('id') id: number, @RequestUser() user: JwtUser) {
    return this.bannerPositionsService.findOne(id, user)
  }

  @Post()
  @ApiOperation({ summary: '创建Banner位置' })
  @Permissions('banner-position:create')
  @ApiResult(BannerPositionVo)
  async create(@Body(ValidationPipe) createBannerPositionDto: CreateBannerPositionDto, @RequestUser() user: JwtUser) {
    return this.bannerPositionsService.create(createBannerPositionDto, user)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新Banner位置' })
  @Permissions('banner-position:update')
  @ApiResult(BannerPositionVo)
  async update(@Body(ValidationPipe) updateBannerPositionDto: UpdateBannerPositionDto, @RequestUser() user: JwtUser) {
    return this.bannerPositionsService.update(updateBannerPositionDto, user)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除Banner位置' })
  @Permissions('banner-position:delete')
  @ApiResult(SuccessVo)
  async remove(@Param('id') id: number, @RequestUser() user: JwtUser) {
    return this.bannerPositionsService.remove(id, user)
  }
}
