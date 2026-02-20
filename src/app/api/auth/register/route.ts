import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { signToken, json, error } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { name, email, password, role, phone, trainerId } = await request.json();
  if (!name || !email || !password || !role) {
    return error('Nome, email, senha e tipo são obrigatórios');
  }

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) return error('Email já cadastrado', 409);

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);
  const avatar = role === 'trainer' ? '💪' : '🏋️';

  await db.execute({
    sql: 'INSERT INTO users (id, name, email, password, role, avatar, phone, trainer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, name, email, hashed, role, avatar, phone || null, trainerId || null],
  });

  const result = await db.execute({
    sql: 'SELECT id, name, email, role, avatar, phone, created_at, trainer_id FROM users WHERE id = ?',
    args: [id],
  });
  const token = signToken(id, role);
  return json({ token, user: result.rows[0] }, 201);
}
