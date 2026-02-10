export const IamErrorCodes = {
  SUCCESS: '0',
  INVALID_SIGNATURE: '1001',
  INVALID_CREDENTIALS: '1002',
  USER_NOT_FOUND: '1003',
  USER_ALREADY_EXISTS: '1004',
  INVALID_PARAMS: '1005',
  SYSTEM_ERROR: '5000',
} as const

export type IamErrorCode = (typeof IamErrorCodes)[keyof typeof IamErrorCodes]

export const IamErrorMessages = {
  [IamErrorCodes.SUCCESS]: 'success',
  [IamErrorCodes.INVALID_SIGNATURE]: '签名验证失败',
  [IamErrorCodes.INVALID_CREDENTIALS]: '用户名或密码错误',
  [IamErrorCodes.USER_NOT_FOUND]: '用户不存在',
  [IamErrorCodes.USER_ALREADY_EXISTS]: '用户已存在',
  [IamErrorCodes.INVALID_PARAMS]: '无效的参数',
  [IamErrorCodes.SYSTEM_ERROR]: '系统错误',
} as const
