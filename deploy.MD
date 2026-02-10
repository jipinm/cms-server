# 后端本地运行指南

## 项目概述

基于 NestJS (Node.js/TypeScript) 的微服务架构内容管理系统后端，支持MySQL数据库、Redis缓存和S3对象存储。

## 技术栈

- **框架**: NestJS (Node.js/TypeScript)
- **数据库**: MySQL (通过 Prisma ORM)
- **缓存**: Redis (令牌缓存)
- **安全**: JWT 认证, Helmet 安全头, Passport 认证策略
- **API 文档**: Swagger
- **日志**: Winston (每日切割)
- **配置中心**: Nacos
- **对象存储**: Amazon S3 (已从华为云OBS迁移)

## 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0 (推荐)
- MySQL >= 8.0
- Redis >= 6.0

## 安装依赖

```bash
# 使用 pnpm 安装依赖
pnpm install
```

## 数据库配置

### 1. 创建数据库

```sql
CREATE DATABASE cms_server CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置数据库连接

编辑 `.env.nonacos` 文件：

```env
# 数据库配置
DATABASE_URL="mysql://username:password@127.0.0.1:3306/cms_server"
```

### 3. 数据库初始化

#### 方式一：使用SQL脚本初始化（推荐）

```bash
# 导入初始数据结构
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server < prisma/init.sql
```

`prisma/init.sql` 文件包含：
- 数据库表结构定义
- 基础菜单数据
- 系统配置数据
- 默认权限数据

#### 方式二：使用Prisma迁移

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移（同步schema）
npx prisma db push

# (可选) 填充初始数据
npx prisma db seed
```

### 4. 数据库初始化检查

初始化完成后，验证数据库是否正确创建：

```sql
-- 连接数据库
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server

-- 检查表是否创建成功
SHOW TABLES;

-- 检查基础数据是否导入
SELECT COUNT(*) FROM admin_menu;
SELECT COUNT(*) FROM admin_user;
```

预期的核心表包括：
- `admin_menu` - 系统菜单表
- `admin_user` - 用户表
- `admin_role` - 角色表
- `admin_permission` - 权限表
- 以及其他业务表

## 环境配置

### 1. 复制环境配置文件

```bash
cp .env.nonacos.example .env.nonacos
```

### 2. 配置 `.env.nonacos`

```env
# 应用配置
NODE_ENV="development"
SERVER_PORT=3000

# 数据库配置
DATABASE_URL="mysql://username:password@127.0.0.1:3306/cms_server"

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DATABASE_INDEX=0

# S3对象存储配置 (已从OBS迁移)
S3_ACCESS_KEY_ID=your_access_key_id
S3_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_DOMAIN=https://your-cdn-domain.com
S3_PUBLIC_DIR=platform/public

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```

### 3. Nacos配置 (可选)

如果使用Nacos配置中心，请在 `.env.nonacos` 中添加：

```env
# Nacos配置中心
NACOS_HOST=your_nacos_host
NACOS_PORT=8848
NACOS_NAMESPACE=your_namespace
NACOS_USERNAME=nacos
NACOS_PASSWORD=nacos
```

## 运行命令

### 开发模式

```bash
# 启动开发服务器 (自动重启)
pnpm start:dev

# 或者使用 watch 模式
pnpm start:debug
```

### 生产模式

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start:prod
```

### 其他命令

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 代码修复
pnpm fix

# 运行单元测试
pnpm test
pnpm test:e2e
pnpm test:cov

# 数据库相关
npx prisma studio
npx prisma migrate dev
npx prisma migrate reset
```

## 项目结构

```
cms_server/
├── src/
│   ├── auth/              # 认证模块
│   ├── common/            # 公共模块
│   ├── config/            # 配置模块
│   │   └── configurations/ # 配置加载器
│   ├── database/          # 数据库服务
│   │   ├── obs.service.ts # S3对象存储服务
│   │   └── prisma/        # Prisma 配置
│   ├── logger/            # 日志模块
│   ├── modules/           # 业务模块
│   ├── utils/             # 工具函数
│   ├── main.ts           # 应用入口
│   └── app.module.ts     # 根模块
├── prisma/                # Prisma 配置
│   ├── schema.prisma     # 数据库模型
│   └── migrations/        # 迁移文件
├── upload/                # 上传文件目录
├── logs/                  # 日志文件目录
├── .env.nonacos          # 环境配置
└── package.json          # 项目配置
```

## API文档

启动服务后，访问以下地址查看API文档：

- Swagger UI: `http://localhost:3000/api/docs`
- API JSON: `http://localhost:3000/api/docs/json`

## S3对象存储配置

### 1. AWS S3配置

```env
# AWS S3 标准配置
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_DOMAIN=https://your-bucket.s3.amazonaws.com
```

### 2. 兼容S3的存储服务

```env
# 如MinIO、阿里云OSS等兼容S3的存储服务
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000  # MinIO示例
S3_DOMAIN=http://localhost:9000/your-bucket
S3_PUBLIC_DIR=platform/public
```

### 3. 文件上传使用示例

```typescript
import { ObsService } from './database/obs.service'

// 上传文件
const result = await obsService.uploadFile({
  Key: 'uploads/example.jpg',
  SourceFile: '/path/to/local/file.jpg',
  siteCode: 'chery_xt'
})

// 返回文件URL
console.log(result.url) // https://your-domain.com/platform/public/chery_xt/uploads/example.jpg
```

## 开发注意事项

### 1. 数据库模型变更

```bash
# 1. 修改 prisma/schema.prisma 文件
# 2. 生成新的迁移
npx prisma migrate dev --name migration_name

# 3. 重新生成 Prisma 客户端
npx prisma generate
```

### 2. 日志查看

```bash
# 查看应用日志
tail -f logs/app-*.log

# 查看错误日志
tail -f logs/error-*.log
```

### 3. 环境变量配置优先级

1. 生产环境：Nacos配置中心
2. 开发环境：`nacos-config-example.yaml`
3. 无Nacos：`.env.nonacos` 环境变量

### 4. 安全配置

- JWT密钥请使用强随机字符串
- 数据库密码和Redis密码使用复杂密码
- S3访问密钥定期轮换
- 生产环境关闭Swagger文档

## 常见问题

### 1. 数据库连接失败

检查数据库配置和网络连接：

```bash
# 测试数据库连接
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server
```

### 2. 数据库初始化失败

如果 `prisma/init.sql` 导入失败：

```bash
# 检查SQL文件语法
mysql -h 127.0.0.1 -P 3306 -u username -p --execute="SELECT 1"

# 分步骤执行SQL文件
# 先检查字符集设置
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server < prisma/init.sql
```

常见失败原因：
- 数据库权限不足
- 字符集不匹配
- SQL语法版本兼容性
- 存储引擎不支持

### 3. 数据库表不存在

启动应用后提示表不存在：

```bash
# 重新导入数据库
mysql -h 127.0.0.1 -P 3306 -u username -p cms_server < prisma/init.sql

# 或者使用Prisma同步
npx prisma db push
```

### 4. Redis连接失败

检查Redis服务状态：

```bash
# 检查Redis服务
redis-cli ping

# 测试连接
redis-cli -h localhost -p 6379 -a your_password
```

### 5. S3上传失败

检查S3配置和权限：

- 确认访问密钥正确
- 检查存储桶权限
- 验证区域配置
- 确认端点URL正确

### 6. 端口占用

修改 `.env.nonacos` 中的端口：

```env
SERVER_PORT=3001
```

### 7. 依赖安装问题

清除缓存并重新安装：

```bash
# 清除 pnpm 缓存
pnpm store prune

# 删除 node_modules
rm -rf node_modules

# 重新安装
pnpm install
```
