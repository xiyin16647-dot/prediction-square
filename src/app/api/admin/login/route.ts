import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  signAdminSession,
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
} from "@/lib/admin-auth";

const Schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const INVALID = "账号或密码错误";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  const usernameLower = parsed.data.username.toLowerCase();
  const admin = await prisma.admin.findUnique({
    where: { username: usernameLower },
  });
  if (!admin) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  const token = await signAdminSession({ aid: admin.id });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true, username: admin.username });
}
