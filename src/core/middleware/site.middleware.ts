import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { DatabaseService } from '@database/database.service'

interface SiteRequest extends Request {
  siteId: number
}

@Injectable()
export class SiteMiddleware implements NestMiddleware {
  constructor(private readonly db: DatabaseService) {}

  async use(req: SiteRequest, res: Response, next: NextFunction) {
    // 从请求头或域名获取站点信息
    const domain = req.headers.host || req.hostname

    const site = await this.db.site.findFirst({
      where: { domain },
    })

    if (site) {
      req.siteId = Number(site.id)
    }

    next()
  }
}
