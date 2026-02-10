import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ContactUsService } from './contact-us.service'
import { CreateContactUsDto } from './dto/create-contact-us.dto'
import { ContactUsVo } from './vo/contact-us.vo'
import { RateLimit } from '@core/decorators/rate-limit.decorator'
import { ApiResult } from '@common/swagger/api-result-decorator'
import { Public } from '@core/guards/jwt-auth.guard'

@ApiTags('前台联系我们')
@Controller('front/contact-us')
@Public()
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @RateLimit({ limit: 10, ttl: 60 })
  @ApiOperation({ summary: '提交联系我们信息' })
  @ApiResult(ContactUsVo, { description: '提交联系我们信息成功' })
  async create(@Body() createContactUsDto: CreateContactUsDto): Promise<ContactUsVo> {
    return this.contactUsService.create(createContactUsDto)
  }
}
