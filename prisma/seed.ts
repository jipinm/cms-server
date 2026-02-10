import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // const tenant = await prisma.tenant.create({
  //   data: {
  //     domain: 'www.icarglobal.com',
  //     name: '默认租户',
  //   },
  // });
  // await prisma.user.create({
  //   data: {
  //     username: 'admin',
  //     password: '13576c95e14c8df2ba795d8eee226c82',
  //     nickname: 'admin',
  //     role: 'ADMIN',
  //     tenantId: tenant.id,
  //   },
  // });
}
// INSERT INTO icar_platformt.user (id, username, nickname, password, email, avatar, phone, status, last_login, login_ip, create_by, create_time, update_by, update_time, user_type, third_party, third_party_id) VALUES (1, 'admin', '系统管理员', 'c9a2484c104596dffd7b0bf2c5496489', 'admin@example.com', null, null, 1, null, null, 'admin', '2025-01-16 19:13:05', null, null, 'SYSTEM_ADMIN', null, null);

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
