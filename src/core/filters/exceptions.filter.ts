import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { Logger } from 'winston'
import { get, pick } from 'lodash'
import { Request } from 'express'
import { IamException } from '@modules/iam-sync/exceptions/iam.exception'
import { IamErrorCodes, IamErrorMessages } from '@modules/iam-sync/constants/iam-error-codes'

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse()

    // 处理IAM接口异常
    if (request.path.startsWith('/api/iam-sync/')) {
      const errorResponse =
        exception instanceof IamException
          ? exception.getResponse()
          : {
              bimRequestId: request.body?.bimRequestId || '',
              resultCode: IamErrorCodes.SYSTEM_ERROR,
              message: IamErrorMessages[IamErrorCodes.SYSTEM_ERROR],
            }

      this.logger.error(`IAM接口异常: ${request.url} -> ${JSON.stringify(errorResponse)}`)
      httpAdapter.reply(response, errorResponse, 200)
      return
    }

    // 处理其他接口异常
    const responseBody = {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      msg: process.env.NODE_ENV !== 'production' ? exception.message : 'INTERNAL SERVER ERROR',
    }

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus()
      const message = exception.message || 'UNKNOWN ERROR'
      const user = pick(get(request, 'user'), ['id', 'username'])

      this.logger.error(
        `{${httpStatus}:${request.method}:${request.url}} ${user ? JSON.stringify(user) : ''} -> ${message}`,
        user,
      )
      responseBody.code = httpStatus
      responseBody.msg = message
      httpAdapter.reply(response, responseBody, httpStatus)
    } else {
      this.logger.error(exception)
      httpAdapter.reply(response, responseBody, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
