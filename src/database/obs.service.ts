import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { ObsConfig } from '../config/config.interface'
import fs from 'fs'

@Injectable()
export class ObsService {
  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  uploadFile({
    Key,
    SourceFile,
    siteCode = 'chery_xt',
  }: {
    Key: string
    SourceFile: string
    siteCode?: string
  }): Promise<{ url: string }> {
    return new Promise(async (resolve, reject) => {
      let obsConfig = this.configService.get<ObsConfig>(`obs.${siteCode}`)

      if (!obsConfig) {
        obsConfig =
          this.configService.get<ObsConfig>(`obs.default`) || this.configService.get<ObsConfig>(`obs.chery_xt`)
      }

      const s3Client = new S3Client({
        region: obsConfig.region || 'us-east-1',
        credentials: {
          accessKeyId: obsConfig.access_key_id,
          secretAccessKey: obsConfig.access_key_secret,
        },
        endpoint: obsConfig.endpoint,
        forcePathStyle: !!obsConfig.endpoint,
      })

      const prefix = `${obsConfig.public_dir || 'platform/public'}${siteCode ? '/' + siteCode : ''}`

      const fileContent = fs.readFileSync(SourceFile)

      const params = {
        Bucket: obsConfig.bucket,
        Key: `${prefix}/${Key}`,
        Body: fileContent,
      }

      try {
        const command = new PutObjectCommand(params)
        const result = await s3Client.send(command)

        if (result.$metadata.httpStatusCode === 200) {
          resolve({
            url: `${obsConfig.domain}/${prefix}/${Key}`,
          })
        } else {
          this.logger.error('上传文件失败，result：', result)
          reject(false)
        }
      } catch (err) {
        this.logger.error('上传文件失败，err：', err)
        reject(false)
      }
    })
  }
}
