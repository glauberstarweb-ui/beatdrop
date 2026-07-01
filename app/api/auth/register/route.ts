import pg from "pg";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { email, username, password } = await request.json();

  if (!email || !username || !password) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "A senha precisa ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await db.connect();
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO public.app_users (email, username, password_hash)
       VALUES ($1, $2, $3) RETURNING id, email, username`,
      [email.toLowerCase().trim(), username.trim(), hash]
    );
    const user = rows[0];
    const cookieStore = await cookies();
    cookieStore.set("user_id", user.id, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/" });
    cookieStore.set("username", user.username, { maxAge: 60 * 60 * 24 * 30, path: "/" });
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e: unknown) {
    const msg = String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  } finally {
    await db.end();
  }
}
