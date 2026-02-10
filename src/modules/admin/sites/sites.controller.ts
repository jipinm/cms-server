import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { SitesService } from './sites.service'
import { QuerySiteDto, SiteDto } from './dto/site.dto'
import { Permissions } from '@core/decorators/permissions.decorator'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { SiteVo } from './vo/site.vo'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { RequestUser } from '@core/decorators/request-user.decorator'

@ApiTags('站点管理')
@Controller('admin/sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有站点列表' })
  @ApiResult(SiteVo, { isArray: true, isPager: true })
  @Permissions('site:list')
  async findAll(@Query(ValidationPipe) query: QuerySiteDto, @RequestUser() user: JwtUser) {
    return this.sitesService.findAll(query, user)
  }

  // 获取当前用户能管理的站点列表
  @Get('current-user-sites')
  @ApiOperation({ summary: '获取当前用户能管理的站点列表' })
  @ApiResult(SiteVo, { isArray: true, isPager: true })
  @Permissions('site:list')
  async findCurrentUserSites(@Query(ValidationPipe) query: QuerySiteDto, @RequestUser() user: JwtUser) {
    return this.sitesService.findCurrentUserSites(query, user)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取站点详情' })
  @ApiResult(SiteVo)
  @Permissions('site:read')
  async findOne(@Param('id') id: number) {
    return this.sitesService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: '创建站点' })
  @Permissions('site:create')
  @ApiResult(SiteVo)
  async create(@Body(ValidationPipe) createSiteDto: SiteDto, @RequestUser() user) {
    return this.sitesService.create(createSiteDto, user)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新站点' })
  @Permissions('site:update')
  @ApiResult(SiteVo)
  async update(@Param('id') id: number, @Body(ValidationPipe) updateSiteDto: SiteDto, @RequestUser() user) {
    return this.sitesService.update(id, updateSiteDto, user)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除站点' })
  @Permissions('site:delete')
  async remove(@Param('id') id: number) {
    return this.sitesService.remove(id)
  }

  @Get('enabled/list')
  @ApiOperation({ summary: '获取所有启用的站点列表' })
  @ApiResult(SiteVo, { isArray: true })
  async findAllEnabled() {
    return this.sitesService.findAllEnabled()
  }
}
