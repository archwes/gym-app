import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { json, error } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return error('Email é obrigatório');

  const result = await db.execute({
    sql: 'SELECT id, name, email FROM users WHERE email = ?',
    args: [email],
  });

  // Always return success to avoid email enumeration
  if (result.rows.length === 0) {
    return json({ message: 'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.' });
  }

  const user = result.rows[0];
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await db.execute({
    sql: 'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
    args: [token, expires, user.id],
  });

  try {
    await sendPasswordResetEmail(user.email as string, user.name as string, token);
  } catch {
    // Email sending failed
  }

  return json({ message: 'Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.' });
}
