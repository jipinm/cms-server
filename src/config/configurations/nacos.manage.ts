import * as nacos from 'nacos'
import { NacosConfigClient } from 'nacos'
import { Logger } from '@nestjs/common'
import * as yaml from 'yaml'

function parseYml(content: string) {
  return yaml.parse(content)
}

export class NacosManager {
  private client: NacosConfigClient
  private readonly logger = new Logger(NacosManager.name)

  private DATA_ID = process.env.NACOS_DATA_ID ?? 'chery-cms-server.yml'
  private GROUP = process.env.NACOS_GROUP ?? 'DEFAULT_GROUP'
  private NAMESPACE = process.env.NACOS_NAMESPACE ?? 'cms'
  private SERVER_ADDR = process.env.NACOS_HOST
  private USERNAME = process.env.NACOS_USERNAME
  private PASSWORD = process.env.NACOS_PASSWORD

  constructor() {
    this.initClient()
  }

  private async initClient() {
    try {
      this.client = new nacos.NacosConfigClient({
        serverAddr: this.SERVER_ADDR,
        namespace: this.NAMESPACE,
        username: this.USERNAME,
        password: this.PASSWORD,
        requestTimeout: 6000,
      })

      // 添加配置监听
      // await this.subscribeConfig()
    } catch (error) {
      this.logger.error('Nacos 客户端初始化失败', error)
      throw error
    }
  }

  public async getAllConfig() {
    try {
      const content = await this.client.getConfig(this.DATA_ID, this.GROUP)
      // yml转化为json
      // return JSON.parse(content)
      return parseYml(content)
    } catch (error) {
      this.logger.error('获取 Nacos 配置失败')
      this.logger.error(error)
      throw error
    }
  }

  private async subscribeConfig() {
    await this.client.subscribe(
      {
        dataId: this.DATA_ID,
        group: this.GROUP,
      },
      (content) => {
        // winston日志
        this.logger.log('配置更新:')
      },
    )
  }
}
