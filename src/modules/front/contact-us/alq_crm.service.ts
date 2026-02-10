import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

export interface AlqCrmLeadRequest {
  firstName: string
  email?: string
  mobile?: string
  company?: string
  remarks?: string
  country?: string
  nationality?: string
  interests?: string
  teamName?: string
  source?: string
  showroom_location?: string
  city?: string
  'enter_the_car_name_&_model'?: string
}

export interface AlqCrmLeadResponse {
  status: number
  message?: string
  [key: string]: any
}

@Injectable()
export class AlqCrmService {
  private readonly logger = new Logger(AlqCrmService.name)
  private readonly crmUrl = 'https://csapi.corporatestack.com/v2/crm/webtolead'
  private readonly authToken = '5168a484-1ec8-4c35-b2a1-cc933827ab3d'

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 创建CRM线索
   */
  async createLead(contactData: {
    name: string
    email?: string
    phone?: string
    message?: string
    vehicleType?: string
    country?: string
    dealer?: string
    city?: string
    source?: string
    showroom_location?: string
    'enter_the_car_name_&_model'?: string
  }): Promise<{ success: boolean; response?: AlqCrmLeadResponse; error?: string }> {
    try {
      const leadData: AlqCrmLeadRequest = {
        firstName: contactData.name,
        email: contactData.email,
        mobile: contactData.phone,
        company: '',
        remarks: contactData.message,
        country: 'United Arab Emirates',
        nationality: '',
        interests: contactData.vehicleType,
        teamName: '',
        source: contactData.source,
        showroom_location: contactData.showroom_location,
        city: contactData.city || contactData.dealer,
        'enter_the_car_name_&_model': contactData.vehicleType,
      }

      this.logger.log('发送CRM请求数据', leadData)

      const response = await firstValueFrom(
        this.httpService.post<AlqCrmLeadResponse>(this.crmUrl, leadData, {
          headers: {
            Authorization: `Basic ${this.authToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }),
      )

      const result = response.data

      this.logger.log('CRM响应数据', result)

      // 检查导入是否成功(status存在且值为1)
      if (Number(result.status) === 1) {
        return {
          success: true,
          response: result,
        }
      } else {
        return {
          success: false,
          response: result,
          error: 'CRM导入失败',
        }
      }
    } catch (error) {
      this.logger.error('CRM请求失败', error)
      return {
        success: false,
        error: error.message || 'CRM请求失败',
      }
    }
  }
}
