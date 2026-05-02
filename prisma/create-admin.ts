import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  if (!username || !password) {
    console.error("用法: npx tsx prisma/create-admin.ts <username> <password>");
    process.exit(1);
  }

  const usernameLower = username.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({
    where: { username: usernameLower },
  });
  if (existing) {
    await prisma.admin.update({
      where: { username: usernameLower },
      data: { passwordHash },
    });
    console.log(`✏️  管理员 ${usernameLower} 已存在，密码已重置`);
  } else {
    await prisma.admin.create({
      data: { username: usernameLower, passwordHash },
    });
    console.log(`✅ 创建管理员: ${usernameLower}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
