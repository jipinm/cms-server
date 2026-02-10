import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { QuerySiteDto, SiteDto } from './dto/site.dto'
import { ListOrder } from '@common/constants/list'
import { Prisma } from '@prisma/client'

@Injectable()
export class SitesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QuerySiteDto, user: JwtUser) {
    const { current, size, name, code, domain } = query
    const skip = (current - 1) * size

    const where: Prisma.SiteWhereInput = {
      siteUsers: { some: { userId: user.id } },
    }

    if (user.username === 'admin') {
      delete where.siteUsers
    }

    if (name) where.name = { contains: name }
    if (code) where.code = { contains: code }
    if (domain) where.domain = { contains: domain }

    const [total, items] = await Promise.all([
      this.db.site.count({ where }),
      this.db.site.findMany({
        where,
        skip,
        take: size,
        orderBy: { createTime: ListOrder.Desc },
      }),
    ])

    return { items, total, current, size }
  }

  // 获取当前用户能管理的站点列表
  async findCurrentUserSites(query: QuerySiteDto, user: JwtUser) {
    const { current, size, name, code, domain } = query
    const skip = (current - 1) * size

    const where: Prisma.SiteWhereInput = {
      siteUsers: { some: { userId: user.id } },
    }
    if (name) where.name = { contains: name }
    if (code) where.code = { contains: code }
    if (domain) where.domain = { contains: domain }

    const [total, items] = await Promise.all([
      this.db.site.count({ where }),
      this.db.site.findMany({
        where,
        skip,
        take: size,
        orderBy: { createTime: ListOrder.Desc },
      }),
    ])

    return { items, total, current, size }
  }

  async create(createSiteDto: SiteDto, user: JwtUser) {
    if (createSiteDto.code) {
      const exists = await this.db.site.findUnique({
        where: { code: createSiteDto.code },
      })
      if (exists) {
        throw new BadRequestException('站点编码已存在')
      }
    }
    // 检查域名是否已存在
    if (createSiteDto.domain) {
      const exists = await this.db.site.findUnique({
        where: { domain: createSiteDto.domain },
      })
      if (exists) {
        throw new BadRequestException('域名已存在')
      }
    }

    // 去除空值保存，并且剔除数据库不存在的字段
    return this.db.site.create({
      data: {
        name: createSiteDto.name,
        code: createSiteDto.code,
        domain: createSiteDto.domain,
        status: createSiteDto.status,
        description: createSiteDto.description,
        logo: createSiteDto.logo,
        favicon: createSiteDto.favicon,
        createBy: user.username,
      },
    })
  }

  async update(id: number, updateSiteDto: SiteDto, user: JwtUser) {
    const site = await this.db.site.findUnique({ where: { id } })

    if (!site) {
      throw new NotFoundException('站点不存在')
    }

    // 检查域名是否已被其他站点使用
    if (updateSiteDto.domain) {
      const exists = await this.db.site.findFirst({
        where: {
          domain: updateSiteDto.domain,
          NOT: { id },
        },
      })
      if (exists) {
        throw new BadRequestException('域名已被其他站点使用')
      }
    }

    // 检查编码是否已存在
    const exists = await this.db.site.findUnique({
      where: { code: updateSiteDto.code, NOT: { id } },
    })
    if (exists) {
      throw new BadRequestException('站点编码已存在')
    }

    // 去除空值保存，并且剔除数据库不存在的字段
    return this.db.site.update({
      where: { id },
      data: {
        name: updateSiteDto.name,
        domain: updateSiteDto.domain,
        code: updateSiteDto.code,
        description: updateSiteDto.description,
        status: updateSiteDto.status,
        logo: updateSiteDto.logo,
        favicon: updateSiteDto.favicon,
        updateTime: new Date(),
        createBy: user.username,
      },
    })
  }

  async remove(id: number) {
    await this.db.site.delete({ where: { id } })
    return { success: true }
  }

  async findOne(id: number) {
    return this.db.site.findUnique({ where: { id } })
  }

  // 获取所有启用的站点，用于配置选择
  async findAllEnabled() {
    return this.db.site.findMany({
      where: { status: 1 },
      orderBy: { createTime: ListOrder.Desc },
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
        status: true,
      },
    })
  }
}
