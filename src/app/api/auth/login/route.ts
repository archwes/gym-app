import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken, json, error } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) return error('Email e senha obrigatórios');

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  if (result.rows.length === 0) return error('Nenhuma conta encontrada com este e-mail', 401);

  const user = result.rows[0];
  const valid = bcrypt.compareSync(password, user.password as string);
  if (!valid) return error('Senha incorreta. Tente novamente', 401);

  // Check email verification
  if (!user.email_verified) {
    return Response.json(
      {
        error: 'E-mail não verificado. Verifique sua caixa de entrada.',
        requiresVerification: true,
        email: user.email,
      },
      { status: 403 }
    );
  }

  const token = signToken(user.id as string, user.role as string);
  const { password: _, verification_token: _v, reset_token: _r, reset_token_expires: _e, ...safeUser } = user;
  return json({ token, user: safeUser });
}
