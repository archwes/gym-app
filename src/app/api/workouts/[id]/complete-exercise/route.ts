import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  const { exercise_id } = await request.json();
  if (!exercise_id) return error('exercise_id obrigatório');

  const existing = await db.execute({
    sql: `SELECT id FROM completed_exercises WHERE student_id = ? AND workout_plan_id = ? AND exercise_id = ? AND DATE(completed_at) = DATE('now')`,
    args: [user.id, id, exercise_id],
  });

  if (existing.rows.length > 0) {
    await db.execute({ sql: 'DELETE FROM completed_exercises WHERE id = ?', args: [existing.rows[0].id as string] });
    return json({ completed: false });
  }

  await db.execute({
    sql: 'INSERT INTO completed_exercises (id, student_id, workout_plan_id, exercise_id) VALUES (?, ?, ?, ?)',
    args: [uuidv4(), user.id, id, exercise_id],
  });
  return json({ completed: true });
}
