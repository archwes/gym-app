import { NextRequest } from 'next/server';
import { InValue } from '@libsql/client';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { id } = await params;
  const result = await db.execute({
    sql: "SELECT id, name, email, role, avatar, phone, cref, email_verified, created_at, trainer_id FROM users WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return error('Usuário não encontrado', 404);
  return json(result.rows[0]);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { id } = await params;
  const body = await request.json();
  const { name, email, phone, role, avatar, cref, email_verified, password } = body;

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE id = ?', args: [id] });
  if (existing.rows.length === 0) return error('Usuário não encontrado', 404);

  // Check email uniqueness if changed
  if (email) {
    const emailCheck = await db.execute({ sql: 'SELECT id FROM users WHERE email = ? AND id != ?', args: [email, id] });
    if (emailCheck.rows.length > 0) return error('Email já em uso por outro usuário', 409);
  }

  const updates: string[] = [];
  const args: InValue[] = [];

  if (name !== undefined) { updates.push('name = ?'); args.push(name); }
  if (email !== undefined) { updates.push('email = ?'); args.push(email); }
  if (phone !== undefined) { updates.push('phone = ?'); args.push(phone || null); }
  if (role !== undefined) { updates.push('role = ?'); args.push(role); }
  if (avatar !== undefined) { updates.push('avatar = ?'); args.push(avatar); }
  if (cref !== undefined) { updates.push('cref = ?'); args.push(cref || null); }
  if (email_verified !== undefined) { updates.push('email_verified = ?'); args.push(email_verified ? 1 : 0); }
  if (password) {
    const hashed = bcrypt.hashSync(password, 10);
    updates.push('password = ?');
    args.push(hashed);
  }

  if (updates.length === 0) return error('Nenhum campo para atualizar');

  args.push(id);
  await db.execute({ sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`, args });

  const updated = await db.execute({
    sql: "SELECT id, name, email, role, avatar, phone, cref, email_verified, created_at, trainer_id FROM users WHERE id = ?",
    args: [id],
  });

  return json(updated.rows[0]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { id } = await params;

  // Prevent deleting yourself
  if (id === user.id) return error('Você não pode excluir sua própria conta', 400);

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE id = ?', args: [id] });
  if (existing.rows.length === 0) return error('Usuário não encontrado', 404);

  // Delete related data
  await db.execute({ sql: 'DELETE FROM notifications WHERE user_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM completed_exercises WHERE student_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM student_progress WHERE student_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM schedule_sessions WHERE trainer_id = ? OR student_id = ?', args: [id, id] });
  await db.execute({ sql: 'DELETE FROM workout_exercises WHERE workout_plan_id IN (SELECT id FROM workout_plans WHERE trainer_id = ? OR student_id = ?)', args: [id, id] });
  await db.execute({ sql: 'DELETE FROM workout_plans WHERE trainer_id = ? OR student_id = ?', args: [id, id] });
  await db.execute({ sql: 'DELETE FROM exercises WHERE created_by = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });

  return json({ deleted: true });
}
