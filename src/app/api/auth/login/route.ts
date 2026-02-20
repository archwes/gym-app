import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { getAuthUser, signToken, json, error } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) return error('Email e senha obrigatórios');

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  if (result.rows.length === 0) return error('Nenhuma conta encontrada com este e-mail', 401);

  const user = result.rows[0];
  const valid = bcrypt.compareSync(password, user.password as string);
  if (!valid) return error('Senha incorreta. Tente novamente', 401);

  const token = signToken(user.id as string, user.role as string);
  const { password: _, ...safeUser } = user;
  return json({ token, user: safeUser });
}
