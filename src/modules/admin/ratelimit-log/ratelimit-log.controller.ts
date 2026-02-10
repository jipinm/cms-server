import { Controller, Get, Param, ParseIntPipe, Post, Body } from '@nestjs/common'
import { RatelimitLogService } from './ratelimit-log.service'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { QueryRatelimitLogDto } from './dto/query-ratelimit-log.dto'
import { RatelimitLogVo, RatelimitLogPagerVo } from './vo/ratelimit-log.vo'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'

@ApiTags('限流日志')
@Controller('ratelimit-log')
export class RatelimitLogController {
  constructor(private readonly ratelimitLogService: RatelimitLogService) {}

  @Post('/list')
  @ApiOperation({ summary: '分页查询限流日志' })
  @ApiResult(RatelimitLogVo, { isArray: true, isPager: true })
  async findAll(@Body(ValidationPipe) query: QueryRatelimitLogDto): Promise<RatelimitLogPagerVo> {
    return this.ratelimitLogService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '查询单条限流日志' })
  @ApiResult(RatelimitLogVo)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RatelimitLogVo | null> {
    return this.ratelimitLogService.findOne(id)
  }
}
