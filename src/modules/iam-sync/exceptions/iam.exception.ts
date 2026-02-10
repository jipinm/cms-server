import { HttpException } from '@nestjs/common'
import { IamErrorCode, IamErrorMessages } from '../constants/iam-error-codes'
import { BaseIamResponse } from '../dto/base.dto'

export class IamException extends HttpException {
  constructor(response: BaseIamResponse) {
    super(response, 200) // IAM接口统一返回200状态码
  }

  static fromError(bimRequestId: string, errorCode: IamErrorCode, message?: string): IamException {
    return new IamException({
      bimRequestId,
      resultCode: errorCode,
      message: message || IamErrorMessages[errorCode],
    })
  }
}
