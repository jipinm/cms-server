import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { NextFunction, Request, Response } from 'express'
import { createProxy } from 'http-proxy'
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard'
import { ProxyConfig, ConvertField } from '../../config/config.interface'
import { get, set, unset, isArray } from 'lodash'
import { JwtService } from '@nestjs/jwt'
import { RedisService } from '@database/redis.service'
import { SystemConfig } from 'src/config/config.interface'
@Injectable()
export class ProxyCenterMiddleware implements NestMiddleware {
  private proxyConfigs: ProxyConfig[] = []

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {
    this.proxyConfigs = this.configService.get<ProxyConfig[]>('proxy_center') || []
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const config = this.proxyConfigs.find((cfg) => req.originalUrl.startsWith(cfg.path))
    if (!config) {
      return next()
    }

    // JWT 验证
    const jwtAuthGuard = new JwtAuthGuard(this.reflector, this.jwtService)
    const canActivate = await jwtAuthGuard.canActivate({
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any)

    if (!canActivate) {
      throw new UnauthorizedException('请先登录')
    }

    // 解析token中的用户信息
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.access_token
    let jwtToken = ''
    if (token) {
      const decoded = await jwtAuthGuard.getTokenInfo(token)
      const proxyTokenSecret = this.configService.get<SystemConfig>('system')
      const userPermissions = await Promise.all(
        decoded.roles?.map(async (roleId: any) => {
          const permissions = await this.redisService.getRolePermissions(Number(roleId))
          return permissions
        }),
      )
      const permissions = [...new Set(userPermissions.flat())]
      jwtToken = this.jwtService.sign(
        {
          username: decoded.username,
          nickname: decoded.nickname,
          id: decoded.id,
          roles: decoded.roles,
          userType: decoded.userType,
          permissions,
        },
        { secret: proxyTokenSecret.proxy_token_secret },
      )
    }

    // 转换请求参数
    this.transformRequestParams(req, config.convert_query_fields)

    // 构建新的 URL
    const url = new URL(req.originalUrl, `http://${req.headers.host}`)

    // 清除原有查询参数并设置转换后的参数
    const originalQuery = { ...req.query }
    url.search = '' // 清除所有查询参数
    Object.entries(originalQuery).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value as string)
      }
    })

    req.url = url.pathname + url.search
    req.url = req.url.replace(config.path, '')
    req.originalUrl = req.originalUrl.replace(config.path, '')
    req.baseUrl = req.baseUrl.replace(config.path, '')
    // 构建请求头
    const proxyHeaders = {
      ...Object.entries(req.headers)
        .filter(([key]) => key !== 'set-cookie' && key.toLowerCase() !== 'authorization')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      AdminAuthorization: jwtToken,
      Pragma: 'no-cache',
      Expires: '0',
    }

    // 添加配置的headers
    config.headers.forEach((header) => {
      proxyHeaders[header.name] = header.value
    })

    // 创建代理
    const proxy = this.createProxy(config.url, proxyHeaders)

    // 处理请求体
    this.handleProxyRequest(proxy)

    // 处理响应
    this.handleProxyResponse(proxy, req, res, config.convert_response_fields)

    return
  }

  private transformRequestParams(req: Request, convertFields: ConvertField[]) {
    // 转换查询参数
    const originalQuery = { ...req.query }
    convertFields.forEach((field) => {
      const [sourceName, targetName] = [field.name, field.value]
      if (originalQuery[sourceName]) {
        originalQuery[targetName] = originalQuery[sourceName]
        delete originalQuery[sourceName]
      }
    })
    req.query = originalQuery

    // 转换请求体
    if (req.body) {
      if (!isArray(req.body)) {
        const originalBody = { ...req.body }
        convertFields.forEach((field) => {
          const [sourceName, targetName] = [field.name, field.value]
          if (originalBody[sourceName]) {
            originalBody[targetName] = originalBody[sourceName]
            delete originalBody[sourceName]
          }
        })
        req.body = originalBody
      }
    }
  }

  private createProxy(target: string, headers: any) {
    return createProxy({
      target,
      changeOrigin: true,
      headers,
      proxyTimeout: 30000,
      timeout: 30000,
      secure: false,
      followRedirects: true,
    })
  }

  private handleProxyRequest(proxy: any) {
    proxy.on('proxyReq', (proxyReq: any, req: Request) => {
      // 如果是 multipart/form-data 请求,保持原有的 Content-Type
      const contentType = req.headers['content-type'] || ''
      if (contentType.includes('multipart/form-data')) {
        return
      }

      // 对于其他类型的请求,如果有请求体则按 JSON 处理
      if (req.body) {
        const bodyData = JSON.stringify(req.body)
        proxyReq.setHeader('Content-Type', 'application/json')
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
        proxyReq.write(bodyData)
      }
    })
  }

  private handleProxyResponse(proxy: any, req: Request, res: Response, convertFields: ConvertField[]) {
    proxy.web(
      req,
      res,
      {
        selfHandleResponse: true,
      },
      (error: Error) => {
        if (error) {
          console.error('Proxy error:', error)
          res.status(500).json({ message: error.message || '请求失败' })
        }
      },
    )

    proxy.on('proxyRes', (proxyRes: any, req: Request, res: Response) => {
      let body = ''
      proxyRes.on('data', (chunk: any) => {
        body += chunk
      })
      proxyRes.on('end', () => {
        try {
          const responseData = JSON.parse(body)

          // 转换响应字段
          convertFields.forEach((field) => {
            const sourceValue = get(responseData, field.name)
            if (sourceValue !== undefined) {
              set(responseData, field.value, sourceValue)
              unset(responseData, field.name)
            }
          })

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(responseData))
        } catch (error) {
          res.setHeader('Content-Type', 'application/json')
          res.end(body)
        }
      })
    })
  }
}
