import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from '@database/database.service'
import axios, { AxiosInstance } from 'axios'

export interface CrmTokenResponse {
  access_token: string
  signature: string
  scope: string
  instance_url: string
  id: string
  token_type: string
  issued_at: string
}

export interface CrmLeadRequest {
  LastName: string
  Post_Code__c?: string
  Lead_Preferred_Seller__r?: {
    ERP_No__c: string
  }
  Lead_Preferred_City__c?: string
  Lead_Preferred_City_Name__c?: string
  Phone?: string
  MobilePhone?: string
  Email?: string
  Channel__c: string
  Channel_Name__c: string
  Campaign_Code__c?: string
  Preferred_Model__r?: {
    Model_Name_External_Key__c: string
  }
  Rating?: string
  Verified_by_Call_Centre__c: boolean
  Lead_Creation_Source__c: string
  DoNotCall: boolean
  HasOptedOutOfEmail: boolean
  HasOptedOutOfFax: boolean
  Is_OEM_Lead__c: boolean
  Preferred_Color__c?: string
  Remarks__c?: string
  Expected_Test_Drive_Time__c?: string
}

interface ContactData {
  name?: string
  phone?: string
  email?: string
  dealer?: string
  region?: string
  city?: string
  message?: string
  carColor?: string
  crmCityCode?: string
  vehicleType?: string
  type: string
  expectedPurchaseDate?: string
  postalCode?: string
  testDriveTime?: string
}

export interface CrmLeadResponse {
  id: string
  success: boolean
  errors: string[]
}

export interface CrmErrorResponse {
  message: string
  errorCode: string
  fields: string[]
}

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name)
  private readonly httpClient: AxiosInstance
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private configCache: Map<number, { config: any; expiry: number }> = new Map()

  constructor(
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
  ) {
    this.httpClient = axios.create({
      timeout: 30000,
    })
  }

  /**
   * 获取CRM访问令牌
   */
  private async getAccessToken(siteId: number): Promise<string> {
    const now = Date.now()

    // 如果令牌还有效，直接返回
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const config = await this.getCrmConfig(siteId)

      if (!config.tokenUrl || !config.clientId || !config.clientSecret) {
        throw new Error('CRM配置信息不完整')
      }

      const response = await this.httpClient.post<CrmTokenResponse>(
        config.tokenUrl,
        {
          grant_type: 'client_credentials',
          client_id: config.clientId,
          client_secret: config.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      this.accessToken = response.data.access_token
      // 令牌有效期设置为1小时（3600000毫秒）
      this.tokenExpiry = now + 3600000

      this.logger.log('成功获取CRM访问令牌')
      return this.accessToken
    } catch (error) {
      this.logger.error('获取CRM访问令牌失败', error)
      throw new Error('获取CRM访问令牌失败')
    }
  }

  /**
   * 获取CRM访问令牌（使用已查询的配置）
   */
  private async getAccessTokenWithConfig(siteId: number, config: any): Promise<string> {
    const now = Date.now()

    // 如果令牌还有效，直接返回
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      if (!config.tokenUrl || !config.clientId || !config.clientSecret) {
        throw new Error('CRM配置信息不完整')
      }

      const response = await this.httpClient.post<CrmTokenResponse>(
        config.tokenUrl,
        {
          grant_type: 'client_credentials',
          client_id: config.clientId,
          client_secret: config.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      this.accessToken = response.data.access_token
      // 令牌有效期设置为6分钟
      this.tokenExpiry = now + 360000

      this.logger.log('成功获取CRM访问令牌')
      return this.accessToken
    } catch (error) {
      this.logger.error('获取CRM访问令牌失败', error)
      throw new Error('获取CRM访问令牌失败')
    }
  }

  /**
   * 创建CRM线索（优化版本，只查询一次配置）
   */
  async createLeadWithConfig(
    siteId: number,
    contactData: ContactData,
  ): Promise<{ result: CrmLeadResponse | null; leadData: CrmLeadRequest | null }> {
    let leadData: CrmLeadRequest | null = null

    try {
      // 只查询一次配置
      const config = await this.getCrmConfig(siteId)

      // 检查是否启用CRM
      if (!config.enabled) {
        throw new Error(`站点 ${siteId} 未启用CRM功能`)
      }

      // 构建CRM线索数据
      leadData = this.buildLeadData(contactData, config)
      if (!leadData) {
        this.logger.log(`联系类型 ${contactData.type} 没有对应的CRM渠道映射，跳过创建线索`, { siteId })
        return { result: null, leadData: null }
      }

      if (!config.leadUrl) {
        throw new Error('CRM线索接口地址未配置')
      }

      // 获取访问令牌（使用已查询的配置）
      const accessToken = await this.getAccessTokenWithConfig(siteId, config)

      const response = await this.httpClient.post<CrmLeadResponse>(config.leadUrl, leadData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: config.timeout,
      })
      console.log('response', response.data)

      this.logger.log(`成功创建CRM线索: ${response.data.id}`)
      return { result: response.data, leadData }
    } catch (error) {
      this.logger.error('创建CRM线索失败', error)

      // 返回详细的错误信息
      const errorInfo = {
        message: '创建CRM线索失败',
        originalError: error.message,
        crmResponse: error.response?.data || null,
        status: error.response?.status || null,
        statusText: error.response?.statusText || null,
        leadData: leadData, // 添加传递给CRM的数据
      }

      throw errorInfo
    }
  }

  /**
   * 根据联系信息构建CRM线索数据
   */
  buildLeadData(contactData: ContactData, config: any): CrmLeadRequest | null {
    // 检查是否有对应的渠道映射
    const channel = this.mapChannelFromType(contactData.type, config)
    if (!channel) {
      return null // 没有对应的渠道映射，不创建线索
    }
    const channelName = this.mapChannelNameFromType(contactData.type, config)
    const leadData: CrmLeadRequest = {
      LastName: contactData.name || 'Unknown',
      Channel__c: channel,
      Channel_Name__c: channelName,
      Verified_by_Call_Centre__c: false,
      Lead_Creation_Source__c: 'System_API',
      DoNotCall: false,
      HasOptedOutOfEmail: false,
      HasOptedOutOfFax: false,
      Is_OEM_Lead__c: true,
      Rating: 'Unknown',
    }

    // 添加电话或邮箱
    if (contactData.phone) {
      leadData.MobilePhone = contactData.phone
    }
    if (contactData.email) {
      leadData.Email = contactData.email
    }

    if (contactData.expectedPurchaseDate) {
      leadData.Rating = contactData.expectedPurchaseDate
    }

    if (contactData.postalCode) {
      leadData.Post_Code__c = contactData.postalCode
    }

    // 添加经销商信息
    if (contactData.dealer) {
      leadData.Lead_Preferred_Seller__r = {
        ERP_No__c: contactData.dealer,
      }
    }

    // 添加城市code信息
    if (contactData.crmCityCode) {
      leadData.Lead_Preferred_City__c = contactData.crmCityCode
    }
    // 添加城市name信息
    if (contactData.city) {
      leadData.Lead_Preferred_City_Name__c = contactData.city
    }

    // 添加车型信息
    if (contactData.vehicleType) {
      leadData.Preferred_Model__r = {
        Model_Name_External_Key__c: contactData.vehicleType,
      }
    }

    if (contactData.message) {
      leadData.Remarks__c = contactData.message
    }

    if (contactData.carColor) {
      leadData.Preferred_Color__c = contactData.carColor
    }

    if (contactData.testDriveTime) {
      leadData.Expected_Test_Drive_Time__c = contactData.testDriveTime
    }

    return leadData
  }

  /**
   * 根据联系类型映射CRM渠道
   */
  private mapChannelFromType(type: string, config: any): string | null {
    const channelMapping = config.channelMapping || {}
    return channelMapping[type] || null
  }

  private mapChannelNameFromType(type: string, config: any): string | null {
    const channelNameMapping = config.channelNameMapping || {}
    return channelNameMapping[type] || null
  }

  /**
   * 获取站点CRM配置
   */
  private async getCrmConfig(siteId: number) {
    const now = Date.now()
    const cacheKey = siteId
    const cached = this.configCache.get(cacheKey)

    // 如果缓存存在且未过期（缓存5分钟），直接返回
    if (cached && now < cached.expiry) {
      return cached.config
    }

    // 查找CRM配置字典类型
    const dictType = await this.db.dictionaryType.findFirst({
      where: { siteId, dictType: 'CRM_CONFIG' },
    })

    if (!dictType) {
      throw new Error(`站点 ${siteId} 的CRM配置不存在`)
    }

    // 获取所有CRM配置项
    const configItems = await this.db.dictionaryItem.findMany({
      where: { dictId: dictType.id },
    })

    // 转换为配置对象
    const config: any = {}
    configItems.forEach((item) => {
      config[item.label] = item.value
    })

    const result = {
      enabled: config.CRM_ENABLED === 'true',
      tokenUrl: config.CRM_TOKEN_URL,
      clientId: config.CRM_CLIENT_ID,
      clientSecret: config.CRM_CLIENT_SECRET,
      leadUrl: config.CRM_LEAD_URL,
      timeout: parseInt(config.CRM_TIMEOUT) || 30000,
      // 渠道映射配置（JSON字符串格式）
      channelMapping: (() => {
        try {
          return config.CRM_CHANNEL_MAPPING ? JSON.parse(config.CRM_CHANNEL_MAPPING) : {}
        } catch (error) {
          this.logger.warn('CRM渠道映射配置JSON解析失败，使用空对象', { error })
          return {}
        }
      })(),
      channelNameMapping: (() => {
        try {
          return config.CRM_CHANNEL_NAME_MAPPING ? JSON.parse(config.CRM_CHANNEL_NAME_MAPPING) : {}
        } catch (error) {
          this.logger.warn('CRM渠道名称映射配置JSON解析失败，使用空对象', { error })
          return {}
        }
      })(),
    }

    // 缓存配置（5分钟有效期）
    this.configCache.set(cacheKey, {
      config: result,
      expiry: now + 5 * 60 * 1000,
    })

    return result
  }

  /**
   * 检查站点是否启用CRM
   */
  async isCrmEnabled(siteId: number): Promise<boolean> {
    try {
      const config = await this.getCrmConfig(siteId)
      return config.enabled
    } catch (error) {
      return false
    }
  }

  /**
   * 清除站点CRM配置缓存
   */
  clearConfigCache(siteId?: number): void {
    if (siteId) {
      this.configCache.delete(siteId)
    } else {
      this.configCache.clear()
    }
  }
}
