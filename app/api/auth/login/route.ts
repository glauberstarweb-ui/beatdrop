import pg from "pg";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }

  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await db.connect();
    const { rows } = await db.query(
      `SELECT id, email, username, password_hash FROM public.app_users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });
    }
    const cookieStore = await cookies();
    cookieStore.set("user_id", user.id, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
    cookieStore.set("username", user.username, { maxAge: 60 * 60 * 24 * 30, path: "/" });
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, username: user.username } });
  } catch {
    return NextResponse.json({ error: "Erro ao fazer login." }, { status: 500 });
  } finally {
    await db.end();
  }
}
