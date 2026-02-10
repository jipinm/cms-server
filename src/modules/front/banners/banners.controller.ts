import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BannersService } from './banners.service'
import { QueryBannerCodesDto, QueryBannerDto } from './dto/query-banner.dto'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { BannerVo } from './vo/banner.vo'
import { Public } from '@core/guards/jwt-auth.guard'
import { RateLimit } from '@core/decorators/rate-limit.decorator'

@ApiTags('前台配置')
@Controller('front/banners')
@Public()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @RateLimit({ ttl: 60, limit: 60 }) // 每分钟最多60次请求
  @ApiOperation({ summary: '根据配置分类获取配置' })
  @ApiResult(BannerVo, { isArray: true })
  async findByPositionCode(@Query(ValidationPipe) query: QueryBannerDto) {
    return this.bannersService.findByPositionCode(query)
  }

  @Post('listByCodes')
  @RateLimit({ ttl: 60, limit: 60 }) // 每分钟最多60次请求
  @ApiOperation({ summary: '根据配置分类code获取分类列表，包含关联的配置列表' })
  @ApiResult(BannerVo, { isArray: true })
  async findByPositionCodes(@Body(ValidationPipe) query: QueryBannerCodesDto) {
    return this.bannersService.findByPositionCodes(query)
  }
}
