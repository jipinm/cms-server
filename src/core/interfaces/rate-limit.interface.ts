export interface RateLimitOptions {
  ttl?: number // 时间窗口(秒)
  limit?: number // 限制次数
  key?: string // 限流键名
}
