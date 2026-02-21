import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { json, error } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) return error('Token e nova senha são obrigatórios');
  if (password.length < 6) return error('A senha deve ter pelo menos 6 caracteres');

  const result = await db.execute({
    sql: 'SELECT id, reset_token_expires FROM users WHERE reset_token = ?',
    args: [token],
  });

  if (result.rows.length === 0) {
    return error('Token inválido ou expirado', 400);
  }

  const user = result.rows[0];
  const expires = new Date(user.reset_token_expires as string);

  if (expires < new Date()) {
    await db.execute({
      sql: 'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      args: [user.id],
    });
    return error('Token expirado. Solicite uma nova redefinição de senha.', 400);
  }

  const hashed = bcrypt.hashSync(password, 10);

  await db.execute({
    sql: 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    args: [hashed, user.id],
  });

  return json({ message: 'Senha redefinida com sucesso!' });
}
