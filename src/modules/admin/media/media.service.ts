import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DatabaseService } from '@database/database.service'
import { CreateMediaDto } from './dto/create-media.dto'
import { QueryMediaDto } from './dto/query-media.dto'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'
import { ObsService } from '@database/obs.service'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { ListOrder } from '@common/constants'
import { OBS_DOMAIN_KEY } from '@common/constants'

@Injectable()
export class MediaService {
  constructor(
    private database: DatabaseService,
    private configService: ConfigService,
    private obsService: ObsService,
  ) {}

  private getDomain(user: JwtUser) {
    return this.configService.get(`obs.${user.siteCode}.domain`) || this.configService.get('obs.default.domain')
  }

  async create(file: Express.Multer.File, createMediaDto: CreateMediaDto, user: JwtUser) {
    const extension = file.originalname.split('.').pop()

    const site = await this.database.site.findUnique({
      where: { id: user.siteId },
    })

    const directory = createMediaDto.directory || ''
    const useOriginFileName = createMediaDto.useOriginFileName === '1'

    const fileName = useOriginFileName ? file.originalname : `${uuidv4()}.${extension}`
    const key = `material/${directory ? `${directory.startsWith('/') ? directory.slice(1) : directory}/` : ''}${fileName}`

    // 创建临时文件
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, fileName)
    fs.writeFileSync(tempFilePath, file.buffer)

    try {
      // 上传到OBS
      const result = await this.obsService.uploadFile({
        Key: key,
        SourceFile: tempFilePath,
        siteCode: site.code,
      })

      const url = result.url.replace(this.getDomain(user), OBS_DOMAIN_KEY)

      // 创建数据库记录
      return this.database.media.create({
        data: {
          siteId: BigInt(user.siteId),
          name: fileName,
          url,
          description: createMediaDto.description,
          size: file.size,
          mimeType: file.mimetype,
          directory: directory || '',
        },
      })
    } finally {
      // 删除临时文件
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
    }
  }

  async getMimeTypes() {
    const mimeTypes = await this.database.media.findMany({
      select: {
        mimeType: true,
      },
      distinct: ['mimeType'],
    })

    return mimeTypes.map((item) => item.mimeType)
  }

  async findAll(query: QueryMediaDto, user: JwtUser) {
    const { mimeType, directory, name, current = 1, size = 10 } = query
    const where: Prisma.MediaWhereInput = {
      siteId: BigInt(user.siteId),
      ...(mimeType && { mimeType }),
      ...(directory && {
        directory: {
          contains: directory,
        },
      }),
      ...(name && {
        name: {
          contains: name,
        },
      }),
    }

    const [total, items] = await Promise.all([
      this.database.media.count({ where }),
      this.database.media.findMany({
        where,
        skip: (current - 1) * size,
        take: size,
        orderBy: { createTime: ListOrder.Desc },
      }),
    ])

    return {
      items: items.map((item) => ({
        ...item,
        url: item.url.replace(OBS_DOMAIN_KEY, this.getDomain(user)),
      })),
      total,
      current,
      size,
    }
  }

  async findOne(id: string, user: JwtUser) {
    const media = await this.database.media.findUnique({
      where: { id },
    })

    if (!media) {
      throw new NotFoundException('素材不存在')
    }

    if (media.siteId !== BigInt(user.siteId)) {
      throw new ForbiddenException('无权访问此素材')
    }

    return {
      ...media,
      url: media.url.replace(OBS_DOMAIN_KEY, this.getDomain(user)),
    }
  }

  async remove(ids: string[], user: JwtUser) {
    const media = await this.database.media.findMany({
      where: { id: { in: ids }, siteId: BigInt(user.siteId) },
    })

    // 从OBS删除文件
    const keys = media.map((item) => item.url.split('/').slice(-2).join('/'))
    // 注意：ObsService可能没有deleteObject方法，这里需要根据实际情况调整
    // 如果需要删除OBS文件，可能需要添加相应的方法到ObsService

    // 删除数据库记录
    return this.database.media.deleteMany({
      where: { id: { in: ids }, siteId: BigInt(user.siteId) },
    })
  }
}
