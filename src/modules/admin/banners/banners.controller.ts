import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BannersService } from './banners.service'
import { CreateBannerDto, QueryBannerDto, UpdateBannerDto } from './dto/banner.dto'
import { Permissions } from '@core/decorators/permissions.decorator'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { ApiResult, SuccessVo } from '@common/swagger/api-result-decorator'
import { BannerVo } from './vo/banner.vo'

@ApiTags('Banner管理')
@Controller('admin/banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: '获取Banner列表' })
  @ApiResult(BannerVo, { isArray: true, isPager: true })
  @Permissions('banner:list')
  async findAll(@Query(ValidationPipe) query: QueryBannerDto, @RequestUser() user: JwtUser) {
    return this.bannersService.findAll(query, user)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取Banner详情' })
  @ApiResult(BannerVo)
  @Permissions('banner:read')
  async findOne(@Param('id') id: number, @RequestUser() user: JwtUser) {
    return this.bannersService.findOne(id, user)
  }

  @Post()
  @ApiOperation({ summary: '创建Banner' })
  @Permissions('banner:create')
  @ApiResult(BannerVo)
  async create(@Body(ValidationPipe) createBannerDto: CreateBannerDto, @RequestUser() user: JwtUser) {
    return this.bannersService.create(createBannerDto, user)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新Banner' })
  @Permissions('banner:update')
  @ApiResult(BannerVo)
  async update(
    @Param('id') id: number,
    @Body(ValidationPipe) updateBannerDto: UpdateBannerDto,
    @RequestUser() user: JwtUser,
  ) {
    return this.bannersService.update(id, updateBannerDto, user)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除Banner' })
  @Permissions('banner:delete')
  @ApiResult(SuccessVo)
  async remove(@Param('id') id: number, @RequestUser() user: JwtUser) {
    return this.bannersService.remove(id, user)
  }
}
