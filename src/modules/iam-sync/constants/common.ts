export const USER_STATUS = {
  DISABLED: 0,
  ENABLED: 1,
} as const

export const USER_TYPE = {
  ADMIN: 'ADMIN',
  PROFESSIONAL: 'PROFESSIONAL',
  WORKER: 'WORKER',
} as const

export const GENDER = {
  MALE: '男',
  FEMALE: '女',
} as const

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
export const MOBILE_PATTERN = /^1[3-9]\d{9}$/
export const EMAIL_PATTERN = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/
export const SEQUENCE_PATTERN = /^\d{1,9}$/
