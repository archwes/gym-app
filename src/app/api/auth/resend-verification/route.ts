import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { json, error } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return error('Email é obrigatório');

  const result = await db.execute({
    sql: 'SELECT id, name, email, email_verified FROM users WHERE email = ?',
    args: [email],
  });

  if (result.rows.length === 0) {
    return error('Nenhuma conta encontrada com este e-mail', 404);
  }

  const user = result.rows[0];

  if (user.email_verified) {
    return error('Este e-mail já foi confirmado', 400);
  }

  const newToken = uuidv4();
  await db.execute({
    sql: 'UPDATE users SET verification_token = ? WHERE id = ?',
    args: [newToken, user.id],
  });

  try {
    await sendVerificationEmail(user.email as string, user.name as string, newToken);
  } catch {
    // Email sending failed, but token is saved — user can try again
  }

  return json({ message: 'E-mail de verificação reenviado!' });
}
