export const PREFIX = 'platformt_:'

export const AUTH_SECRET = `${PREFIX}server`
export const AUTH_TOKEN_EXPIRED_TIME = 60 * 60 * 24 * 30 // 7天

export const MAX_TOKEN_EXISTS = 99 //单个用户最大允许token数量
export const REDIS_AUTH_PREFIX = `${PREFIX}access_token`
export const REDIS_TENANT_IDS_KEY = `${PREFIX}tenant_ids`

// 重置密码的默认密码
export const DEFAULT_ENCRYPTED_PASSWORD = '25ea0cef03d7160e2fc702e73b8549e1'
