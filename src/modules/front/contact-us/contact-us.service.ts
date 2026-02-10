import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { I18nService } from 'nestjs-i18n'
import { DatabaseService } from '@database/database.service'
import { CrmService } from '../../crm/crm.service'
import { AlqCrmService } from './alq_crm.service'
import { CreateContactUsDto } from './dto/create-contact-us.dto'
import { ContactUsVo } from './vo/contact-us.vo'

@Injectable()
export class ContactUsService {
  private readonly logger = new Logger(ContactUsService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly crmService: CrmService,
    private readonly alqCrmService: AlqCrmService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async create(createContactUsDto: CreateContactUsDto): Promise<ContactUsVo> {
    const {
      siteCode,
      type,
      name,
      phone,
      email,
      dealer,
      region,
      annualSalesVolume,
      expectedPurchaseDate,
      postalCode,
      city,
      crmCityCode,
      message,
      vehicleType,
      vehicleVin,
      country,
      carColor,
      source,
      showroom_location,
    } = createContactUsDto

    const site = await this.db.site.findUnique({
      where: { code: siteCode },
    })

    if (!site) {
      throw new NotFoundException(`未找到站点编码为 ${siteCode} 的站点`)
    }

    // 对于de_oj站点，检查1个月内是否有重复的手机号或邮箱
    // if (siteCode === 'de_oj') {
    //   const oneMonthAgo = new Date()
    //   oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    //
    //   const duplicateSubmission = await this.db.contactUs.findFirst({
    //     where: {
    //       siteId: site.id,
    //       createTime: {
    //         gte: oneMonthAgo,
    //       },
    //       OR: [{ phone: phone }, { email: email }],
    //     },
    //   })
    //
    //   if (duplicateSubmission) {
    //     const errorMessage = this.i18n.t('contact-us.validation.duplicate_submission')
    //     throw new BadRequestException(errorMessage)
    //   }
    // }

    const contactUs = await this.db.contactUs.create({
      data: {
        site: { connect: { id: site.id } },
        type,
        name,
        phone,
        email,
        dealer,
        region,
        annualSalesVolume,
        expectedPurchaseDate,
        postalCode,
        city,
        crmCityCode,
        message,
        vehicleType,
        vehicleVin,
        country,
        carColor,
      },
    })

    // 同步调用CRM接口创建线索
    let crmResult
    if (siteCode === 'alq_oj') {
      crmResult = await this.createAlqCrmLead(contactUs, createContactUsDto)
    } else {
      crmResult = await this.createCrmLead(contactUs)
    }

    return {
      id: Number(contactUs.id),
      type: contactUs.type,
      dealer: contactUs.dealer,
      region: contactUs.region,
      annualSalesVolume: contactUs.annualSalesVolume,
      expectedPurchaseDate: contactUs.expectedPurchaseDate,
      postalCode: contactUs.postalCode,
      city: contactUs.city,
      crmCityCode: contactUs.crmCityCode,
      createTime: contactUs.createTime,
      crmResult, // 添加CRM结果
    }
  }

  /**
   * 创建ALQ CRM线索
   */
  private async createAlqCrmLead(contactUs: any, createContactUsDto: CreateContactUsDto): Promise<any> {
    try {
      const result = await this.alqCrmService.createLead({
        name: contactUs.name,
        email: contactUs.email,
        phone: contactUs.phone,
        message: contactUs.message,
        vehicleType: contactUs.vehicleType,
        country: contactUs.country,
        dealer: contactUs.dealer,
        city: contactUs.city,
        source: createContactUsDto.source,
        showroom_location: createContactUsDto.showroom_location,
      })

      if (result.success) {
        this.logger.log(`成功创建ALQ CRM线索`, { siteId: contactUs.siteId })
        return {
          success: true,
          message: 'ALQ CRM线索创建成功',
          crmResponse: result.response,
        }
      } else {
        this.logger.error('ALQ CRM线索创建失败', { error: result.error, response: result.response })
        return {
          success: false,
          error: result.error,
          crmResponse: result.response,
          message: 'ALQ CRM线索创建失败',
        }
      }
    } catch (error) {
      this.logger.error('创建ALQ CRM线索失败', error)
      return {
        success: false,
        error: error.message,
        message: 'ALQ CRM线索创建失败',
      }
    }
  }

  /**
   * 创建CRM线索
   */
  private async createCrmLead(contactUs: any): Promise<any> {
    try {
      // 调用CRM接口创建线索（内部会处理配置查询和启用检查）
      const result = await this.crmService.createLeadWithConfig(contactUs.siteId, {
        name: contactUs.name,
        phone: contactUs.phone,
        email: contactUs.email,
        dealer: contactUs.dealer,
        region: contactUs.region,
        message: contactUs.message,
        city: contactUs.city,
        crmCityCode: contactUs.crmCityCode,
        vehicleType: contactUs.vehicleType,
        type: contactUs.type,
        expectedPurchaseDate: contactUs.expectedPurchaseDate,
        postalCode: contactUs.postalCode,
        carColor: contactUs.carColor,
        testDriveTime: contactUs.testDriveTime,
      })

      if (result.result) {
        this.logger.log(`成功创建CRM线索，ID: ${result.result.id}`, { siteId: contactUs.siteId })
        return {
          success: true,
          crmLeadId: result.result.id,
          message: 'CRM线索创建成功',
          leadData: result.leadData, // 添加传递给CRM的数据
        }
      } else {
        this.logger.log('跳过创建CRM线索（没有对应的渠道映射）', { siteId: contactUs.siteId })
        return {
          success: false,
          message: '跳过创建CRM线索（没有对应的渠道映射）',
        }
      }
    } catch (error) {
      this.logger.error('创建CRM线索失败', error)
      console.log(error)

      // 检查是否是配置相关的错误
      const errorMessage = error.message || error.originalError || ''
      if (
        errorMessage.includes('CRM配置不存在') ||
        errorMessage.includes('未启用CRM功能') ||
        errorMessage.includes('CRM配置信息不完整')
      ) {
        // 配置不存在或未启用，这不是错误，而是正常情况
        this.logger.log('CRM未配置或未启用，跳过创建线索', {
          siteId: contactUs.siteId,
          reason: errorMessage,
        })
        return {
          success: false,
          message: 'CRM未配置或未启用，跳过创建线索',
          reason: errorMessage,
        }
      }

      // 如果error是对象且包含crmResponse，则返回详细的错误信息
      if (error.crmResponse) {
        return {
          success: false,
          error: error.message,
          crmResponse: error.crmResponse,
          status: error.status,
          statusText: error.statusText,
          leadData: error.leadData, // 添加传递给CRM的数据
          message: 'CRM线索创建失败',
        }
      } else {
        return {
          success: false,
          error: error.message,
          message: 'CRM线索创建失败',
        }
      }
    }
  }
}
