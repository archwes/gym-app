import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { json, error } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { name, email, password, role, phone, trainerId, cref } = await request.json();
  if (!name || !email || !password || !role) {
    return error('Nome, email, senha e tipo são obrigatórios');
  }

  if (password.length < 6) {
    return error('A senha deve ter pelo menos 6 caracteres');
  }

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) return error('Email já cadastrado', 409);

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);
  const avatar = role === 'trainer' ? '💪' : '🏋️';
  const verificationToken = uuidv4();

  await db.execute({
    sql: `INSERT INTO users (id, name, email, password, role, avatar, phone, trainer_id, cref, email_verified, verification_token)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    args: [id, name, email, hashed, role, avatar, phone || null, trainerId || null, cref || null, verificationToken],
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, name, verificationToken);
  } catch {
    // Email sending failed but account was created
  }

  return json({
    message: 'Conta criada! Verifique seu e-mail para ativar a conta.',
    requiresVerification: true,
    email,
  }, 201);
}
