export class PayloadDto {
  id: bigint
  username: string
  nickname: string
  siteId: number
  siteCode: string
  jti: string
  iat: number
  roles: number[]
  exp: number
}
