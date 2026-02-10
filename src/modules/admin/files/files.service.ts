import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { ObsService } from '@database/obs.service'
import { remove } from 'fs-extra'
import { ConfigService } from '@nestjs/config'
@Injectable()
export class FilesService {
  constructor(
    private readonly obs: ObsService,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File, user: JwtUser) {
    const subPath = dayjs().format('YYYYMMDD')
    const { url } = await this.obs.uploadFile({
      Key: `${file.mimetype.split('/')[0]}/${subPath}/${file.filename}`,
      SourceFile: file.path,
      siteCode: user.siteCode,
    })
    remove(file.path)
    const response = {
      name: file.filename,
      url,
      size: file.size,
    }
    return response
  }
}
