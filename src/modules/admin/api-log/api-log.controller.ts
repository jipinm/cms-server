import { Controller, Get, Query, Param, Delete, Post, Body, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { ApiLogService } from './api-log.service'
import { QueryApiLogDto } from './dto/query-api-log.dto'
import { ApiLogVO, ApiLogStatisticsVO } from './vo/api-log.vo'
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard'
import { RoleGuard } from '../../../core/guards/role-auth.guard'
import { Roles } from '../../../core/decorators/roles.decorator'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'

@ApiTags('API日志管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('SYSTEM_ADMIN')
@Controller('admin/api-log')
export class ApiLogController {
  constructor(private readonly apiLogService: ApiLogService) {}

  @Post('list')
  @ApiOperation({ summary: '分页查询API日志列表' })
  @ApiResult(ApiLogVO, { isArray: true, isPager: true })
  async findMany(@Body(ValidationPipe) query: QueryApiLogDto) {
    const { current, size, ...whereQuery } = query

    // 转换日期字符串为Date对象
    const transformedQuery: any = { current, size }
    if (whereQuery.siteId) transformedQuery.siteId = BigInt(whereQuery.siteId)
    if (whereQuery.userId) transformedQuery.userId = BigInt(whereQuery.userId)
    if (whereQuery.method) transformedQuery.method = whereQuery.method
    if (whereQuery.path) transformedQuery.path = whereQuery.path
    if (whereQuery.statusCode) transformedQuery.statusCode = whereQuery.statusCode
    if (whereQuery.clientIp) transformedQuery.clientIp = whereQuery.clientIp
    if (whereQuery.startTime) transformedQuery.startTime = new Date(whereQuery.startTime)
    if (whereQuery.endTime) transformedQuery.endTime = new Date(whereQuery.endTime)

    return this.apiLogService.findMany(transformedQuery)
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询API日志详情' })
  @ApiParam({ name: 'id', description: '日志ID' })
  @ApiResult(ApiLogVO)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.apiLogService.findOne(BigInt(id))
  }

  @Post('statistics')
  @ApiOperation({ summary: '获取API统计信息' })
  @ApiResult(ApiLogStatisticsVO)
  async getStatistics(@Body(ValidationPipe) query: { siteId?: number; startTime?: string; endTime?: string }) {
    const { siteId, startTime, endTime } = query

    const transformedQuery: any = {}
    if (siteId) transformedQuery.siteId = BigInt(siteId)
    if (startTime) transformedQuery.startTime = new Date(startTime)
    if (endTime) transformedQuery.endTime = new Date(endTime)

    return this.apiLogService.getStatistics(transformedQuery)
  }

  @Post('cleanup')
  @ApiOperation({ summary: '清理过期日志' })
  @ApiResult(Number)
  async cleanup(@Body(ValidationPipe) body: { days?: number }) {
    const { days = 30 } = body
    return this.apiLogService.cleanup(days)
  }

  @Delete()
  @ApiOperation({ summary: '批量删除日志' })
  @ApiResult(Number)
  async deleteMany(@Body(ValidationPipe) body: { ids: number[] }) {
    const { ids } = body
    return this.apiLogService.deleteMany(ids.map((id) => BigInt(id)))
  }
}
