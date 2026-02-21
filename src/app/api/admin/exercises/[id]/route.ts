import { NextRequest } from 'next/server';
import { InValue } from '@libsql/client';
import db, { initializeDatabase } from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { id } = await params;
  const body = await request.json();
  const { name, muscle_group, equipment, description, difficulty } = body;

  const existing = await db.execute({ sql: 'SELECT id FROM exercises WHERE id = ?', args: [id] });
  if (existing.rows.length === 0) return error('Exercício não encontrado', 404);

  const updates: string[] = [];
  const args: InValue[] = [];

  if (name !== undefined) { updates.push('name = ?'); args.push(name); }
  if (muscle_group !== undefined) { updates.push('muscle_group = ?'); args.push(muscle_group); }
  if (equipment !== undefined) { updates.push('equipment = ?'); args.push(equipment); }
  if (description !== undefined) { updates.push('description = ?'); args.push(description); }
  if (difficulty !== undefined) { updates.push('difficulty = ?'); args.push(difficulty); }

  if (updates.length === 0) return error('Nenhum campo para atualizar');

  args.push(id);
  await db.execute({ sql: `UPDATE exercises SET ${updates.join(', ')} WHERE id = ?`, args });

  const updated = await db.execute({ sql: "SELECT * FROM exercises WHERE id = ?", args: [id] });
  return json(updated.rows[0]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { id } = await params;

  const existing = await db.execute({ sql: 'SELECT id FROM exercises WHERE id = ?', args: [id] });
  if (existing.rows.length === 0) return error('Exercício não encontrado', 404);

  // Remove from workout_exercises first
  await db.execute({ sql: 'DELETE FROM workout_exercises WHERE exercise_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM completed_exercises WHERE exercise_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM exercises WHERE id = ?', args: [id] });

  return json({ deleted: true });
}
