import { Request } from 'express'

global {
  interface JwtUser {
    id: number
    username: string
    nickname: string
    userType: string
    siteId: number
    siteCode: string
    roles: number[]
  }
}

interface IJwtRequest extends Request {
  user: JwtUser
}

interface IPagination {
  page: number
  size: number
}

interface IResponseList<T> {
  items: T[]
  total: number
}
