import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return error('Token não fornecido', 400);

  const result = await db.execute({
    sql: 'SELECT id, name, email, email_verified FROM users WHERE verification_token = ?',
    args: [token],
  });

  if (result.rows.length === 0) {
    return error('Token inválido ou expirado', 400);
  }

  const user = result.rows[0];

  if (user.email_verified) {
    return json({ message: 'E-mail já confirmado anteriormente', alreadyVerified: true });
  }

  await db.execute({
    sql: 'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
    args: [user.id],
  });

  return json({ message: 'E-mail confirmado com sucesso!', verified: true });
}
