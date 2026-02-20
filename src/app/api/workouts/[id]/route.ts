import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

async function enrichPlan(plan: Record<string, unknown>) {
  const exercises = await db.execute({
    sql: `SELECT we.*, e.name as exercise_name, e.muscle_group, e.equipment, e.difficulty
          FROM workout_exercises we
          JOIN exercises e ON e.id = we.exercise_id
          WHERE we.workout_plan_id = ?
          ORDER BY we.sort_order`,
    args: [plan.id as string],
  });
  const student = await db.execute({
    sql: 'SELECT id, name, email, avatar FROM users WHERE id = ?',
    args: [plan.student_id as string],
  });
  return { ...plan, exercises: exercises.rows, student: student.rows[0] || null };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  const result = await db.execute({ sql: 'SELECT * FROM workout_plans WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return error('Treino não encontrado', 404);
  return json(await enrichPlan(result.rows[0]));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { id } = await params;
  const { name, description, day_of_week, is_active, exercises } = await request.json();

  const plan = await db.execute({
    sql: 'SELECT * FROM workout_plans WHERE id = ? AND trainer_id = ?',
    args: [id, user.id],
  });
  if (plan.rows.length === 0) return error('Treino não encontrado', 404);

  const dayJson = day_of_week ? (Array.isArray(day_of_week) ? JSON.stringify(day_of_week) : day_of_week) : null;

  await db.execute({
    sql: 'UPDATE workout_plans SET name = COALESCE(?, name), description = COALESCE(?, description), day_of_week = COALESCE(?, day_of_week), is_active = COALESCE(?, is_active) WHERE id = ?',
    args: [name || null, description || null, dayJson, is_active !== undefined ? (is_active ? 1 : 0) : null, id],
  });

  if (exercises && Array.isArray(exercises)) {
    await db.execute({ sql: 'DELETE FROM workout_exercises WHERE workout_plan_id = ?', args: [id] });
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await db.execute({
        sql: 'INSERT INTO workout_exercises (id, workout_plan_id, exercise_id, sets, reps, rest_seconds, weight, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), id, ex.exercise_id, ex.sets || 3, ex.reps || '10', ex.rest_seconds || 60, ex.weight || null, ex.notes || null, i],
      });
    }
  }

  const updated = await db.execute({ sql: 'SELECT * FROM workout_plans WHERE id = ?', args: [id] });
  return json(await enrichPlan(updated.rows[0]));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { id } = await params;
  const plan = await db.execute({
    sql: 'SELECT id FROM workout_plans WHERE id = ? AND trainer_id = ?',
    args: [id, user.id],
  });
  if (plan.rows.length === 0) return error('Treino não encontrado', 404);

  await db.execute({ sql: 'DELETE FROM workout_exercises WHERE workout_plan_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM workout_plans WHERE id = ?', args: [id] });
  return json({ ok: true });
}
