import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import * as CryptoJS from 'crypto-js'

@Injectable()
export class SignatureAuthGuard implements CanActivate {
  private readonly nonce = 'coret_ui'
  private readonly salt = '5c7af05e6fbf562842ef483ee96e06a0'

  canActivate(context: ExecutionContext): boolean {
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const { signature, nonce, timestamp, url } = request.headers

    if (!signature || !nonce || !timestamp || !url) {
      throw new BadRequestException('Missing signature parameter')
    }

    const originalUrl = request.path
    if (originalUrl !== url) {
      throw new BadRequestException('Signature parameter error')
    }

    const expectedSignature = CryptoJS.MD5(`${this.salt}${this.nonce}${url}${timestamp}`).toString()

    if (signature !== expectedSignature) {
      throw new BadRequestException('Signature verification failed')
    }

    return true
  }
}
