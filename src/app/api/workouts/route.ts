import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from '@/lib/db';
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

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  await initializeDatabase();

  let result;
  if (user.role === 'trainer') {
    result = await db.execute({
      sql: 'SELECT * FROM workout_plans WHERE trainer_id = ? ORDER BY created_at DESC',
      args: [user.id],
    });
  } else {
    result = await db.execute({
      sql: 'SELECT * FROM workout_plans WHERE student_id = ? AND is_active = 1 ORDER BY created_at DESC',
      args: [user.id],
    });
  }

  const plans = await Promise.all(result.rows.map(enrichPlan));
  return json(plans);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { name, description, student_id, day_of_week, exercises } = await request.json();
  if (!name || !student_id) return error('Nome e aluno são obrigatórios');

  const planId = uuidv4();
  const dayJson = Array.isArray(day_of_week) ? JSON.stringify(day_of_week) : (day_of_week || '[]');

  await db.execute({
    sql: 'INSERT INTO workout_plans (id, name, description, trainer_id, student_id, day_of_week, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
    args: [planId, name, description || null, user.id, student_id, dayJson],
  });

  if (exercises && Array.isArray(exercises)) {
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await db.execute({
        sql: 'INSERT INTO workout_exercises (id, workout_plan_id, exercise_id, sets, reps, rest_seconds, weight, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), planId, ex.exercise_id, ex.sets || 3, ex.reps || '10', ex.rest_seconds || 60, ex.weight || null, ex.notes || null, i],
      });
    }
  }

  // Notification for student
  await db.execute({
    sql: 'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
    args: [uuidv4(), student_id, 'Novo treino disponível', `Seu personal criou o treino "${name}" para você!`, 'success'],
  });

  const plan = await db.execute({ sql: 'SELECT * FROM workout_plans WHERE id = ?', args: [planId] });
  const enriched = await enrichPlan(plan.rows[0]);
  return json(enriched, 201);
}
