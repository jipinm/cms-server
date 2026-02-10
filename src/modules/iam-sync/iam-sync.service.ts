import { Injectable, Logger } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'
import { CryptoUtil } from './utils/crypto.util'
import { BaseIamDto, BaseIamResponse } from './dto/base.dto'
import { DeleteUserDto, UpdateUserDto } from './dto/user.dto'
import { ConfigService } from '@nestjs/config'
import { IamErrorCodes, IamErrorMessages } from './constants/iam-error-codes'
import { IamUserResponse } from './interfaces/user.interface'
import { CreateUserDto } from './dto/create-user.dto'
import { USER_STATUS } from './constants/common'
import { UpdateData } from './interfaces/common.interface'
import { IamException } from './exceptions/iam.exception'

@Injectable()
export class IamSyncService {
  private readonly logger = new Logger(IamSyncService.name)

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  // 验证基础参数
  private async validateBaseParams(params: BaseIamDto): Promise<void> {
    // 验证签名
    if (!CryptoUtil.verifySignature(params.bimRequestId + params.bimRemoteUser, params.signature)) {
      throw IamException.fromError(params.bimRequestId, IamErrorCodes.INVALID_SIGNATURE)
    }

    // 从配置中获取用户名密码
    const remoteUser = this.configService.get('iam.remote_user')
    const remotePwd = this.configService.get('iam.remote_password')

    if (params.bimRemoteUser !== remoteUser || params.bimRemotePwd !== remotePwd) {
      throw IamException.fromError(params.bimRequestId, IamErrorCodes.INVALID_CREDENTIALS)
    }
  }

  // 获取Schema定义
  async getSchema(params: BaseIamDto) {
    await this.validateBaseParams(params)

    return {
      bimRequestId: params.bimRequestId,
      account: [
        {
          name: 'fullname',
          type: 'String',
          required: true,
          multivalued: false,
        },
        {
          name: 'gender',
          type: 'String',
          required: false,
          multivalued: false,
        },
        {
          name: 'birthDate',
          type: 'String',
          required: false,
          multivalued: false,
        },
        {
          name: 'userType',
          type: 'String',
          required: true,
          multivalued: false,
        },
        {
          name: 'username',
          type: 'String',
          required: true,
          multivalued: false,
        },
        {
          name: 'employeeNumber',
          type: 'String',
          required: true,
          multivalued: false,
        },
        {
          name: 'mobile',
          type: 'String',
          required: false,
          multivalued: false,
        },
        {
          name: 'organizationId',
          type: 'String',
          required: false,
          multivalued: false,
        },
        {
          name: 'sequence',
          type: 'String',
          required: false,
          multivalued: false,
        },
        {
          name: 'enterpriseEmail',
          type: 'String',
          required: false,
          multivalued: false,
        },
        {
          name: 'adAccount',
          type: 'String',
          required: false,
          multivalued: false,
        },
        {
          name: 'entryTime',
          type: 'String',
          required: false,
          multivalued: false,
        },
        {
          name: 'displayName',
          type: 'String',
          required: false,
          multivalued: false,
        },
      ],
    }
  }

  // 获取所有用户ID
  async getAllUserIds(params: BaseIamDto): Promise<BaseIamResponse & { userIdList: string[] }> {
    try {
      await this.validateBaseParams(params)

      const users = await this.databaseService.iamUser.findMany({
        select: { employeeNumber: true },
        where: { status: USER_STATUS.ENABLED },
      })

      return {
        bimRequestId: params.bimRequestId,
        resultCode: IamErrorCodes.SUCCESS,
        message: IamErrorMessages[IamErrorCodes.SUCCESS],
        userIdList: users.map((user) => user.employeeNumber),
      }
    } catch (error) {
      this.logger.error(`获取用户ID列表失败: ${error.message}`)
      if (error instanceof IamException) {
        throw error
      }
      throw IamException.fromError(params.bimRequestId, IamErrorCodes.SYSTEM_ERROR)
    }
  }

  // 根据ID获取用户信息
  async getUserById(params: BaseIamDto & { bimUid: string }): Promise<BaseIamResponse & { account: IamUserResponse }> {
    try {
      await this.validateBaseParams(params)

      const user = await this.databaseService.iamUser.findFirst({
        where: {
          employeeNumber: params.bimUid,
          status: USER_STATUS.ENABLED,
        },
      })

      if (!user) {
        throw IamException.fromError(params.bimRequestId, IamErrorCodes.USER_NOT_FOUND)
      }

      return {
        bimRequestId: params.bimRequestId,
        resultCode: IamErrorCodes.SUCCESS,
        message: IamErrorMessages[IamErrorCodes.SUCCESS],
        account: {
          fullname: user.nickname,
          gender: user.gender,
          birthDate: user.birthDate,
          userType: user.userType,
          username: user.username,
          employeeNumber: user.employeeNumber,
          mobile: user.phone,
          organizationId: user.organizationId,
          sequence: user.sequence,
          enterpriseEmail: user.enterpriseEmail,
          adAccount: user.adAccount,
          entryTime: user.entryTime,
          displayName: user.displayName,
        },
      }
    } catch (error) {
      this.logger.error(`获取用户失败: ${error.message}`)
      if (error instanceof IamException) {
        throw error
      }
      throw IamException.fromError(params.bimRequestId, IamErrorCodes.SYSTEM_ERROR)
    }
  }

  // 创建用户
  async createUser(params: CreateUserDto): Promise<BaseIamResponse> {
    try {
      await this.validateBaseParams(params)

      // 检查用户是否已存在
      const existingUser = await this.databaseService.iamUser.findFirst({
        where: {
          OR: [{ employeeNumber: params.employeeNumber }, { username: params.username }, { phone: params.mobile }],
        },
      })

      if (existingUser) {
        const field =
          existingUser.employeeNumber === params.employeeNumber
            ? '工号'
            : existingUser.username === params.username
              ? '用户名'
              : '手机号'
        throw IamException.fromError(params.bimRequestId, IamErrorCodes.USER_ALREADY_EXISTS, `${field}已存在`)
      }

      // 检查必填字段
      const requiredFields = this.configService.get('iam.schema.required_fields') || []
      const missingFields = requiredFields.filter((field) => !params[field])

      if (missingFields.length > 0) {
        throw IamException.fromError(
          params.bimRequestId,
          IamErrorCodes.INVALID_PARAMS,
          `缺少必填字段: ${missingFields.join(', ')}`,
        )
      }

      await this.databaseService.iamUser.create({
        data: {
          username: params.username,
          nickname: params.fullname,
          employeeNumber: params.employeeNumber,
          gender: params.gender,
          birthDate: params.birthDate,
          userType: params.userType,
          phone: params.mobile,
          organizationId: params.organizationId,
          sequence: params.sequence,
          enterpriseEmail: params.enterpriseEmail,
          adAccount: params.adAccount,
          entryTime: params.entryTime,
          displayName: params.displayName,
          password: CryptoUtil.encrypt(params.password || '123456'),
          status: USER_STATUS.ENABLED,
        },
      })

      return {
        bimRequestId: params.bimRequestId,
        resultCode: IamErrorCodes.SUCCESS,
        message: IamErrorMessages[IamErrorCodes.SUCCESS],
      }
    } catch (error) {
      this.logger.error(`创建用户失败: ${error.message}`)
      if (error instanceof IamException) {
        throw error
      }
      throw IamException.fromError(params.bimRequestId, IamErrorCodes.SYSTEM_ERROR)
    }
  }

  // 更新用户
  async updateUser(params: UpdateUserDto): Promise<BaseIamResponse> {
    try {
      await this.validateBaseParams(params)

      const existingUser = await this.databaseService.iamUser.findFirst({
        where: { employeeNumber: params.bimUid },
      })

      if (!existingUser) {
        throw IamException.fromError(params.bimRequestId, IamErrorCodes.USER_NOT_FOUND)
      }

      const updateData: UpdateData = {}

      // 处理启用/禁用
      if (params.__ENABLE__ !== undefined) {
        updateData.status = params.__ENABLE__ ? USER_STATUS.ENABLED : USER_STATUS.DISABLED
      }

      // 检查用户名唯一性
      if (params.username) {
        const userWithSameUsername = await this.databaseService.iamUser.findFirst({
          where: {
            username: params.username,
            employeeNumber: { not: params.bimUid },
          },
        })
        if (userWithSameUsername) {
          throw IamException.fromError(params.bimRequestId, IamErrorCodes.USER_ALREADY_EXISTS, '用户名已存在')
        }
        updateData.username = params.username
      }

      // 检查手机号唯一性
      if (params.mobile) {
        const userWithSamePhone = await this.databaseService.iamUser.findFirst({
          where: {
            phone: params.mobile,
            employeeNumber: { not: params.bimUid },
          },
        })
        if (userWithSamePhone) {
          throw IamException.fromError(params.bimRequestId, IamErrorCodes.USER_ALREADY_EXISTS, '手机号已存在')
        }
        updateData.phone = params.mobile
      }

      // 更新其他字段
      if (params.fullname) updateData.nickname = params.fullname
      if (params.gender) updateData.gender = params.gender
      if (params.birthDate) updateData.birthDate = params.birthDate
      if (params.userType) updateData.userType = params.userType
      if (params.organizationId) updateData.organizationId = params.organizationId
      if (params.sequence) updateData.sequence = params.sequence
      if (params.enterpriseEmail) updateData.enterpriseEmail = params.enterpriseEmail
      if (params.adAccount) updateData.adAccount = params.adAccount
      if (params.entryTime) updateData.entryTime = params.entryTime
      if (params.displayName) updateData.displayName = params.displayName

      await this.databaseService.iamUser.update({
        where: { employeeNumber: params.bimUid },
        data: updateData,
      })

      return {
        bimRequestId: params.bimRequestId,
        resultCode: IamErrorCodes.SUCCESS,
        message: IamErrorMessages[IamErrorCodes.SUCCESS],
      }
    } catch (error) {
      this.logger.error(`更新用户失败: ${error.message}`)
      if (error instanceof IamException) {
        throw error
      }
      throw IamException.fromError(params.bimRequestId, IamErrorCodes.SYSTEM_ERROR)
    }
  }

  // 删除用户
  async deleteUser(params: DeleteUserDto): Promise<BaseIamResponse> {
    try {
      await this.validateBaseParams(params)

      // 检查用户是否存在
      const existingUser = await this.databaseService.iamUser.findFirst({
        where: { employeeNumber: params.bimUid },
      })

      if (!existingUser) {
        throw IamException.fromError(params.bimRequestId, IamErrorCodes.USER_NOT_FOUND)
      }

      // 检查用户是否已经被删除
      if (existingUser.status === USER_STATUS.DISABLED) {
        this.logger.warn(`删除用户失败: 用户已被删除 ${params.bimUid}`)
        return {
          bimRequestId: params.bimRequestId,
          resultCode: IamErrorCodes.SUCCESS,
          message: IamErrorMessages[IamErrorCodes.SUCCESS],
        }
      }

      await this.databaseService.iamUser.update({
        where: { employeeNumber: params.bimUid },
        data: { status: USER_STATUS.DISABLED },
      })

      this.logger.log(`用户删除成功: ${params.bimUid}`)
      return {
        bimRequestId: params.bimRequestId,
        resultCode: IamErrorCodes.SUCCESS,
        message: IamErrorMessages[IamErrorCodes.SUCCESS],
      }
    } catch (error) {
      this.logger.error(`删除用户失败: ${error.message}`)
      if (error instanceof IamException) {
        throw error
      }
      throw IamException.fromError(params.bimRequestId, IamErrorCodes.SYSTEM_ERROR)
    }
  }
}
