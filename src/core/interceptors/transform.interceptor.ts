import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest()
    const isIamRequest = request.path.startsWith('/api/iam-sync/')

    return next.handle().pipe(
      map((data) => {
        // IAM接口直接返回原始响应
        if (isIamRequest) {
          return data
        }
        // 其他接口使用统一响应格式
        return {
          code: 0,
          data,
          msg: 'success',
        }
      }),
    )
  }
}
