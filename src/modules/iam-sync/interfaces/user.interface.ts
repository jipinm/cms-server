import { Gender, UserType } from '@modules/iam-sync/interfaces/common.interface'

export interface IamUserCreate {
  fullname: string
  gender?: string
  birthDate?: string
  userType: string
  username: string
  employeeNumber: string
  mobile?: string
  organizationId?: string
  sequence?: string
  enterpriseEmail?: string
  adAccount?: string
  entryTime?: string
  displayName?: string
  password?: string
}

export interface IamUserUpdate {
  fullname?: string
  gender?: Gender
  birthDate?: string
  userType?: UserType
  username?: string
  mobile?: string
  organizationId?: string
  sequence?: string
  enterpriseEmail?: string
  adAccount?: string
  entryTime?: string
  displayName?: string
}

export interface IamUserResponse {
  fullname: string
  gender: string | null
  birthDate: string | null
  userType: string
  username: string
  employeeNumber: string
  mobile: string | null
  organizationId: string | null
  sequence: string | null
  enterpriseEmail: string | null
  adAccount: string | null
  entryTime: string | null
  displayName: string | null
}
