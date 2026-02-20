import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { email, name, phone } = await request.json();
  if (!email) return error('Email é obrigatório');

  // Check if user already exists
  const existing = await db.execute({
    sql: 'SELECT id, name, email, role, avatar, phone, trainer_id, created_at FROM users WHERE email = ?',
    args: [email],
  });

  if (existing.rows.length > 0) {
    const existingUser = existing.rows[0];

    if (existingUser.role !== 'student') {
      return error('Este email pertence a um personal trainer, não pode ser adicionado como aluno', 400);
    }

    if (existingUser.trainer_id === user.id) {
      return error('Este aluno já está vinculado a você', 400);
    }

    if (existingUser.trainer_id) {
      return error('Este aluno já está vinculado a outro personal', 400);
    }

    // Link existing student to this trainer
    await db.execute({
      sql: 'UPDATE users SET trainer_id = ? WHERE id = ?',
      args: [user.id, existingUser.id],
    });

    // Create notification for student
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      args: [uuidv4(), existingUser.id as string, 'Novo personal trainer', `${user.name} adicionou você como aluno(a). Agora vocês estão conectados na plataforma!`, 'success'],
    });

    const updated = await db.execute({
      sql: 'SELECT id, name, email, role, avatar, phone, trainer_id, created_at FROM users WHERE id = ?',
      args: [existingUser.id],
    });
    return json({ user: updated.rows[0], created: false, message: 'Aluno existente vinculado com sucesso!' });
  }

  // Create new student account
  if (!name) return error('Nome é obrigatório para novo aluno');

  const tempPassword = Math.random().toString(36).slice(-8);
  const hashed = bcrypt.hashSync(tempPassword, 10);
  const id = uuidv4();

  await db.execute({
    sql: 'INSERT INTO users (id, name, email, password, role, avatar, phone, trainer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, name, email, hashed, 'student', '🏋️', phone || null, user.id],
  });

  // Notification for the new student (for when they log in)
  await db.execute({
    sql: 'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
    args: [uuidv4(), id, 'Bem-vindo ao FitPro!', `Sua conta foi criada pelo personal ${user.name}. Altere sua senha e informações pessoais nas configurações.`, 'info'],
  });

  const result = await db.execute({
    sql: 'SELECT id, name, email, role, avatar, phone, trainer_id, created_at FROM users WHERE id = ?',
    args: [id],
  });

  return json({ user: result.rows[0], created: true, tempPassword, message: `Conta criada! Senha temporária: ${tempPassword}` }, 201);
}
