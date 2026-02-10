# CMS SERVER

## 技术栈
- 后端框架：NestJS
- 开发语言：TypeScript
- 数据库：
  - MySQL（通过 Prisma ORM）
  - Redis（用于令牌缓存）
  - Elasticsearch（用于搜索功能，目前没用到）
- 消息推送：Socket.IO
- 配置中心：Nacos
- 对象存储：华为云 OBS
- 安全相关：
  - JWT 认证
  - Helmet 安全头
  - Passport 认证策略
- 开发工具：
  - ESLint + Prettier（代码规范）
  - Jest（单元测试）
  - Swagger（API 文档）
  - Winston（日志管理）

## 功能清单
- [x] 通用功能
  - [x] 请求参数校验
  - [x] 响应结构包装
  - [x] 异常统一处理
  - [x] 接口文档生成：访问 `/api/docs` 即可看到 Swagger 文档
  - [x] 接口文档生成：访问 `/api/docs/json` 即可看到 openapi 3.0规范json文档，方便导入apifox、postman等其他工具
  - [x] 统一日志收集：使用 [winston](https://github.com/winstonjs/winston)，每日切割保存
  - [x] 响应安全处理：基于 [helmet](https://helmetjs.github.io/)
  - [x] 代码风格校验
- [x] 数据存储
  - [x] MySQL + [Prisma](https://www.prisma.io/docs/concepts/components/prisma-client)
  - [x] Redis：默认启用，仅用在令牌缓存，支持多点登录
- [x] 权限验证
  - [x] 登录校验：基于 JWT
  - [x] 角色校验
  - [x] C端对外接口验签
- [x] 通用接口
  - [x] 健康检查
      - [x] 接口健康
      - [x] 数据库健康
- [x] 消息推送：基于 [socket.io]目前没用到(https://socket.io/)
- [x] 定时任务：理论上定时任务应该单独拆分服务，目前没用到
  
## 接口文档地址
- [/api/docs](https://localhost:3000/api/docs)
- [/api/docs/json导入apifox或者postman](https://localhost:3000/api/docs)

## 安装依赖
```bash
$ npm i
```

## 环境变量
SERVER_PORT=3000
NACOS_DATA_ID=chery-platformt-c2b2e-local.yml
NACOS_HOST=172.25.203.69:31390
NACOS_NAMESPACE=xx
NACOS_USERNAME=xxx
NACOS_PASSWORD=xxx

## 开发环境

```bash
$ npm run dev
```

> 本地开发请提前准备好 MySQL 和 Redis，可以使用 docker-compose.yaml 直接启动，并使用 [Prisma](https://www.prisma.io/docs/reference/api-reference/command-reference#prisma-migrate) 初始化 MySQL 表结构

用户默认密码 icar-admin@9527

## 生产部署
jenkins + Docker
