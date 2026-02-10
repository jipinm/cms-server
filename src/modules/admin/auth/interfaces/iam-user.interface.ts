/**
 * IAM用户信息接口
 */
export interface IAMUser {
  /**
   * 人员姓名
   */
  fullname: string

  /**
   * 性别
   */
  gender: string

  /**
   * 出生日期
   */
  birthDate: string

  /**
   * 人员类型（三种：行政管理、专业技术、技术工人）
   */
  userType: 'ADMIN' | 'PROFESSIONAL' | 'WORKER'

  /**
   * 用户名(飞书ID)
   */
  username: string

  /**
   * 工号(人员唯一ID)
   */
  employeeNumber: string

  /**
   * 手机号
   */
  mobile: string

  /**
   * 所在机构ID
   */
  organizationId: string

  /**
   * 序号(最长9位数字)
   */
  sequence: string

  /**
   * 企业邮箱(可选)
   */
  enterpriseEmail?: string

  /**
   * AD域账号
   */
  adAccount: string

  /**
   * 入职时间
   */
  entryTime: string

  /**
   * 显示名称
   */
  displayName: string
} 