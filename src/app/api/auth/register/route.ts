import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validation";

const REGISTER_BONUS = 10000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const { username, password } = parsed.data;
  const usernameLower = username.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { username: usernameLower },
  });
  if (existing) {
    return NextResponse.json({ error: "账号已被使用" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        username: usernameLower,
        passwordHash,
        nickname: username,
        avatarSeed: usernameLower,
        balance: REGISTER_BONUS,
      },
    });
    await tx.ledger.create({
      data: {
        userId: created.id,
        type: "REGISTER_BONUS",
        amount: REGISTER_BONUS,
        balanceAfter: REGISTER_BONUS,
        note: "注册奖励",
      },
    });
    return created;
  });

  const token = await signSession({ uid: user.id });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    balance: user.balance.toString(),
  });
}
