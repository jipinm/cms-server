import { Injectable, OnModuleInit } from '@nestjs/common'
import { DatabaseService } from '@database/database.service'

@Injectable()
export class StartupService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    await this.checkAndAddMissingFields()
  }

  private async checkAndAddMissingFields() {
    try {
      // 检查 ContactUs 表结构
      const tableInfo = (await this.databaseService.$queryRaw`
        DESCRIBE contact_us
      `) as any[]

      console.log('contact_us tableInfo', tableInfo)

      // 定义需要检查的字段
      const fieldsToCheck = [
        { name: 'test_drive_time', type: 'VARCHAR(100) NULL', comment: '预约试驾时间' },
        { name: 'annual_sales_volume', type: 'VARCHAR(50) NULL', comment: '年销量' },
        { name: 'car_color', type: 'VARCHAR(50) NULL', comment: '车辆颜色' },
        { name: 'city', type: 'VARCHAR(100) NULL', comment: '城市' },
        { name: 'crm_city_code', type: 'VARCHAR(50) NULL', comment: 'CRM城市代码' },
        { name: 'dealer', type: 'VARCHAR(200) NULL', comment: '经销商' },
        { name: 'expected_purchase_date', type: 'VARCHAR(50) NULL', comment: '预计购买日期' },
        { name: 'postal_code', type: 'VARCHAR(20) NULL', comment: '邮政编码' },
        { name: 'region', type: 'VARCHAR(100) NULL', comment: '地区' },
      ]

      // 检查每个字段是否存在，不存在则添加
      for (const field of fieldsToCheck) {
        const fieldExists = tableInfo.some((column) => column.Field === field.name)

        if (!fieldExists) {
          console.log(`${field.name} 字段不存在，正在添加...`)

          await this.databaseService.$executeRawUnsafe(`
            ALTER TABLE contact_us
            ADD COLUMN \`${field.name}\` ${field.type} COMMENT '${field.comment}'
          `)

          console.log(`${field.name} 字段添加成功`)
        } else {
          console.log(`${field.name} 字段已存在`)
        }
      }

      // 检查并创建 api_log 表
      await this.checkAndCreateApiLogTable()
    } catch (error) {
      console.error('检查或添加字段时出错:', error)
      // 不抛出异常，避免影响程序启动
    }
  }

  private async checkAndCreateApiLogTable() {
    try {
      // 检查 api_log 表是否存在
      const tableExists = (await this.databaseService.$queryRawUnsafe(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        AND table_name = 'api_log'
      `)) as any[]

      const exists = tableExists[0]?.count > 0

      if (!exists) {
        console.log('api_log 表不存在，正在创建...')

        // 创建 api_log 表
        await this.databaseService.$executeRawUnsafe(`
          CREATE TABLE \`api_log\` (
              \`id\` BIGINT NOT NULL AUTO_INCREMENT,
              \`site_id\` BIGINT NULL,
              \`user_id\` BIGINT NULL,
              \`method\` VARCHAR(10) NOT NULL,
              \`path\` VARCHAR(500) NOT NULL,
              \`query\` TEXT NULL,
              \`headers\` TEXT NULL,
              \`request_body\` TEXT NULL,
              \`statusCode\` INTEGER NOT NULL,
              \`client_ip\` VARCHAR(50) NULL,
              \`user_agent\` VARCHAR(500) NULL,
              \`response_time\` INTEGER NOT NULL,
              \`error_message\` TEXT NULL,
              \`create_time\` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

              INDEX \`api_log_site_id_idx\`(\`site_id\`),
              INDEX \`api_log_user_id_idx\`(\`user_id\`),
              INDEX \`api_log_path_idx\`(\`path\`),
              INDEX \`api_log_method_idx\`(\`method\`),
              INDEX \`api_log_statusCode_idx\`(\`statusCode\`),
              INDEX \`api_log_create_time_idx\`(\`create_time\`),
              INDEX \`api_log_response_time_idx\`(\`response_time\`),
              PRIMARY KEY (\`id\`)
          ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `)

        console.log('api_log 表创建成功')
      } else {
        console.log('api_log 表已存在')
      }
    } catch (error) {
      console.error('检查或创建 api_log 表时出错:', error)
      // 不抛出异常，避免影响程序启动
    }
  }
}
