import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable, tap, catchError, throwError } from 'rxjs'
import { DatabaseService } from '../../database/database.service'
import { Reflector } from '@nestjs/core'

@Injectable()
export class ApiLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiLogInterceptor.name)

  constructor(
    private readonly prisma: DatabaseService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const startTime = Date.now()

    // 检查是否为前端接口，如果是则跳过日志记录
    if (this.shouldSkipLogging(request)) {
      return next.handle()
    }

    // 获取用户ID和站点ID
    const user = (request as any).user
    const userId = user?.id
    const siteId = user?.siteId

    // 获取客户端IP
    const clientIp = this.getClientIp(request)

    // 获取查询参数
    const query = JSON.stringify(request.query)

    // 获取请求头信息（排除敏感信息）
    const headers = this.sanitizeHeaders(request.headers)

    // 获取请求体数据
    const requestBody = this.sanitizeRequestBody(request.body)

    return next.handle().pipe(
      tap(async (responseData) => {
        const responseTime = Date.now() - startTime
        const statusCode = response.statusCode

        try {
          // 记录请求和响应数据
          await this.logApiRequest({
            siteId,
            userId,
            method: request.method,
            path: request.path,
            query,
            headers,
            requestBody,
            statusCode,
            clientIp,
            userAgent: request.headers['user-agent'],
            responseTime,
          })
        } catch (error) {
          // 记录日志失败不应该影响主流程
          this.logger.error('Failed to log API request:', error)
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime
        const statusCode = error.status || 500

        // 异步记录错误日志，不阻塞错误处理
        this.logApiRequest({
          siteId,
          userId,
          method: request.method,
          path: request.path,
          query,
          headers,
          requestBody,
          statusCode,
          clientIp,
          userAgent: request.headers['user-agent'],
          responseTime,
          errorMessage: error.message || 'Internal Server Error',
        }).catch((logError) => {
          this.logger.error('Failed to log API error:', logError)
        })

        return throwError(() => error)
      }),
    )
  }

  private shouldSkipLogging(request: Request): boolean {
    // 跳过前端接口日志记录
    if (request.path?.startsWith('/api/front/')) {
      return true
    }

    // 可以添加其他需要跳过日志记录的路径
    const skipPaths = ['/api/front/', '/health', '/api/health', '/api/admin/api-log/', '/metrics', '/favicon.ico']

    return skipPaths.some((path) => request.path?.startsWith(path))
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      ''
    )
      .split(',')[0]
      ?.trim()
  }

  private sanitizeHeaders(headers: any): string {
    const sensitiveHeaders = ['authorization', 'cookie', 'password', 'token']
    const sanitized = { ...headers }

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveHeaders.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[FILTERED]'
      }
    })

    return JSON.stringify(sanitized)
  }

  private sanitizeRequestBody(body: any): string {
    if (!body) return null

    // 过滤敏感字段
    const sensitiveFields = ['password', 'token', 'secret', 'key']
    const sanitized = { ...body }

    const filterSensitive = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj

      if (Array.isArray(obj)) {
        return obj.map(filterSensitive)
      }

      const result: any = {}
      Object.keys(obj).forEach((key) => {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
          result[key] = '[FILTERED]'
        } else if (typeof obj[key] === 'object') {
          result[key] = filterSensitive(obj[key])
        } else {
          result[key] = obj[key]
        }
      })
      return result
    }

    return JSON.stringify(filterSensitive(sanitized))
  }

  private sanitizeResponseData(data: any): string {
    if (!data) return null

    // 限制响应数据大小，避免存储过大的数据
    const maxSize = 100 * 1024 // 100KB
    const dataStr = JSON.stringify(data)

    if (dataStr.length > maxSize) {
      return JSON.stringify({
        message: 'Response data too large to log',
        size: dataStr.length,
        maxSize,
      })
    }

    return dataStr
  }

  private async logApiRequest(logData: {
    siteId?: bigint
    userId?: bigint
    method: string
    path: string
    query?: string
    headers?: string
    requestBody?: string
    statusCode: number
    clientIp?: string
    userAgent?: string
    responseTime: number
    errorMessage?: string
  }) {
    try {
      await this.prisma.apiLog.create({
        data: logData,
      })
    } catch (error) {
      this.logger.error('Database log creation failed:', error)
    }
  }
}
