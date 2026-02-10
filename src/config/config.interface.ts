export interface DatabaseConfig {
  url: string
  username: string
  password: string
  log_level: string[]
}
export interface RedisClusterConfig {
  nodes: string
}

export interface RedisConfig {
  // 集群模式配置
  cluster?: RedisClusterConfig
  // 单节点模式配置
  host?: string
  port?: number
  // 通用配置
  password: string
  database_index: number
}

export type ISiteCodes = 'chery_icar' | 'chery_xt' | 'icar_global' | 'default'

export interface ObsConfig {
  access_key_id: string
  access_key_secret: string
  bucket: string
  region: string
  endpoint: string
  domain: string
  public_dir: string
}

export interface ProxyHeader {
  name: string
  value: string
}

export interface ConvertField {
  name: string
  value: string
}

export interface ProxyConfig {
  name: string
  path: string
  url: string
  headers: ProxyHeader[]
  convert_query_fields: ConvertField[]
  convert_response_fields: ConvertField[]
}

export interface SSOConfig {
  auth_url: string
  token_url: string
  userinfo_url: string
  logout_url: string
  client_id: string
  client_secret: string
  redirect_uri: string
  frontend_url: string
}

export interface IamConfig {
  remote_user: string
  remote_password: string
  sm4_key: string
  schema: {
    required_fields: string[]
  }
}

export interface SystemConfig {
  proxy_token_secret: string
}

export interface PlatformConfig {
  database: DatabaseConfig
  redis: RedisConfig
  // 支持部分配置，默认配置
  obs: Partial<Record<ISiteCodes, ObsConfig>> | ObsConfig
}
