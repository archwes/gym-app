import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  const result = await db.execute({
    sql: `SELECT exercise_id FROM completed_exercises WHERE student_id = ? AND workout_plan_id = ? AND DATE(completed_at) = DATE('now')`,
    args: [user.id, id],
  });
  return json(result.rows.map(c => c.exercise_id));
}
