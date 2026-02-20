import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { workoutPlanId, duration, rating, intensity, observations } = await request.json();

  if (!workoutPlanId || !duration) {
    return error('Dados incompletos', 400);
  }

  // Get workout plan to find trainer
  const plan = await db.execute({
    sql: 'SELECT wp.*, u.name as student_name FROM workout_plans wp JOIN users u ON u.id = wp.student_id WHERE wp.id = ?',
    args: [workoutPlanId],
  });

  if (!plan.rows.length) {
    return error('Treino não encontrado', 404);
  }

  const workout = plan.rows[0];
  const trainerId = workout.trainer_id as string;
  const studentName = workout.student_name as string;
  const workoutName = workout.name as string;

  // Build notification message
  const ratingStars = rating ? '⭐'.repeat(rating as number) : 'Não informada';
  const intensityLabels: Record<string, string> = {
    light: '🟢 Leve',
    moderate: '🟡 Moderada',
    intense: '🔴 Intensa',
    extreme: '💀 Extrema',
  };
  const intensityText = intensity ? intensityLabels[intensity as string] || intensity : 'Não informada';

  let message = `📋 Treino: ${workoutName}\n⏱️ Duração: ${duration}\n⭐ Nota: ${ratingStars}\n💪 Intensidade: ${intensityText}`;
  if (observations) {
    message += `\n📝 Obs: ${observations}`;
  }

  // Create notification for trainer
  await db.execute({
    sql: 'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
    args: [
      uuidv4(),
      trainerId,
      `${studentName} finalizou o treino!`,
      message,
      'success',
    ],
  });

  return json({ ok: true });
}
