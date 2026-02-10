import { Controller, Get, Delete, Param, Query, UseGuards, Res, Req } from '@nestjs/common'
import { Response, Request } from 'express'
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ContactUsService } from './contact-us.service'
import { ContactUsQueryDto } from './dto/contact-us-query.dto'
import { RequestUser } from '@core/decorators/request-user.decorator'
import { Permissions } from '@core/decorators/permissions.decorator'
import { ValidationPipe } from '@core/pipes/validation.pipe'
import { ContactUsVo } from './vo/contact-us.vo'
import { ApiResult } from '@common/swagger/api-result-decorator'

@ApiTags('联系我们管理')
@Controller('admin/contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Get()
  @ApiOperation({ summary: '获取联系我们列表' })
  @ApiResult(ContactUsVo, { isArray: true, isPager: true })
  @Permissions('contact-us:list')
  async findAll(@RequestUser() user: JwtUser, @Query(ValidationPipe) query: ContactUsQueryDto) {
    return this.contactUsService.findAll(user.siteId, query)
  }

  @Get('export/excel')
  @ApiOperation({ summary: '导出联系我们列表' })
  @Permissions('contact-us:list')
  async exportToExcel(
    @RequestUser() user: JwtUser,
    @Query(ValidationPipe) query: ContactUsQueryDto,
    @Res() res: Response,
  ) {
    const workbook = await this.contactUsService.exportToExcel(user.siteId, query)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=contact-us-${Date.now()}.xlsx`)

    await workbook.xlsx.write(res)
    res.end()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取联系我们详情' })
  @ApiResult(ContactUsVo)
  @Permissions('contact-us:read')
  async findOne(@RequestUser() user: JwtUser, @Param('id') id: number) {
    return this.contactUsService.findOne(user.siteId, id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除联系我们' })
  @ApiResult(null)
  @Permissions('contact-us:delete')
  async remove(@RequestUser() user: JwtUser, @Param('id') id: number) {
    return this.contactUsService.remove(user.siteId, id)
  }
}
