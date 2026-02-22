import { NextRequest } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas personal trainers', 403);

  await initializeDatabase();
  const { id } = await params;

  // Get student info
  const studentResult = await db.execute({
    sql: 'SELECT id, name, email, avatar, phone, created_at FROM users WHERE id = ? AND trainer_id = ?',
    args: [id, user.id],
  });

  if (studentResult.rows.length === 0) {
    return error('Aluno não encontrado', 404);
  }

  const student = studentResult.rows[0];

  // Workouts with exercises
  const workoutsResult = await db.execute({
    sql: 'SELECT * FROM workout_plans WHERE student_id = ? AND trainer_id = ? ORDER BY created_at DESC',
    args: [id, user.id],
  });

  const workouts = await Promise.all(
    workoutsResult.rows.map(async (plan) => {
      const exercises = await db.execute({
        sql: `SELECT we.*, e.name as exercise_name, e.muscle_group, e.equipment, e.difficulty
              FROM workout_exercises we
              JOIN exercises e ON e.id = we.exercise_id
              WHERE we.workout_plan_id = ?
              ORDER BY we.sort_order`,
        args: [plan.id as string],
      });
      return { ...plan, exercises: exercises.rows };
    })
  );

  // Sessions (past and future)
  const sessionsResult = await db.execute({
    sql: `SELECT * FROM schedule_sessions
          WHERE student_id = ? AND trainer_id = ?
          ORDER BY date DESC, time DESC`,
    args: [id, user.id],
  });

  // Progress
  const progressResult = await db.execute({
    sql: 'SELECT * FROM student_progress WHERE student_id = ? ORDER BY date DESC',
    args: [id],
  });

  // Feedback notifications (trainer received from this student's workout completions)
  const feedbackResult = await db.execute({
    sql: `SELECT n.* FROM notifications n
          WHERE n.user_id = ? AND n.title LIKE '%finalizou o treino%'
          AND n.message LIKE '%' || ? || '%'
          ORDER BY n.created_at DESC
          LIMIT 20`,
    args: [user.id, student.name as string],
  });

  return json({
    student,
    workouts,
    sessions: sessionsResult.rows,
    progress: progressResult.rows,
    feedbacks: feedbackResult.rows,
  });
}
