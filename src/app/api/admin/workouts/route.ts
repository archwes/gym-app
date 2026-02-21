import { NextRequest } from 'next/server';
import { InValue } from '@libsql/client';
import db, { initializeDatabase } from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  let sql = `SELECT wp.*, 
    t.name as trainer_name, t.avatar as trainer_avatar,
    s.name as student_name, s.avatar as student_avatar,
    (SELECT COUNT(*) FROM workout_exercises we WHERE we.workout_plan_id = wp.id) as exercise_count
    FROM workout_plans wp
    JOIN users t ON wp.trainer_id = t.id
    JOIN users s ON wp.student_id = s.id
    WHERE 1=1`;
  const args: InValue[] = [];

  if (search) {
    sql += " AND (wp.name LIKE ? OR t.name LIKE ? OR s.name LIKE ?)";
    args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY wp.created_at DESC";

  const result = await db.execute({ sql, args });
  return json(result.rows);
}

export async function DELETE(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { id } = await request.json();
  if (!id) return error('ID obrigatório');

  await db.execute({ sql: 'DELETE FROM completed_exercises WHERE workout_plan_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM workout_exercises WHERE workout_plan_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM workout_plans WHERE id = ?', args: [id] });

  return json({ deleted: true });
}
