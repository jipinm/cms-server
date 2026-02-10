import { GENDER, USER_STATUS, USER_TYPE } from '../constants/common'

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]
export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE]
export type Gender = (typeof GENDER)[keyof typeof GENDER]

export interface UpdateData {
  status?: UserStatus
  username?: string
  nickname?: string
  gender?: string
  birthDate?: string
  userType?: string
  phone?: string
  organizationId?: string
  sequence?: string
  enterpriseEmail?: string
  adAccount?: string
  entryTime?: string
  displayName?: string
}
