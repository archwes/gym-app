import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const activePlans = (await db.execute({
    sql: 'SELECT COUNT(*) as count FROM workout_plans WHERE student_id = ? AND is_active = 1',
    args: [user.id],
  })).rows[0].count;

  const todayCompletedExercises = (await db.execute({
    sql: "SELECT COUNT(*) as count FROM completed_exercises WHERE student_id = ? AND DATE(completed_at) = DATE('now')",
    args: [user.id],
  })).rows[0].count;

  const latestProgressResult = await db.execute({
    sql: 'SELECT * FROM student_progress WHERE student_id = ? ORDER BY date DESC LIMIT 1',
    args: [user.id],
  });
  const latestProgress = latestProgressResult.rows[0] || null;

  const upcomingSessions = (await db.execute({
    sql: `SELECT ss.*, u.name as trainer_name
          FROM schedule_sessions ss
          JOIN users u ON u.id = ss.trainer_id
          WHERE ss.student_id = ? AND ss.date >= DATE('now') AND ss.status = 'scheduled'
          ORDER BY ss.date, ss.time
          LIMIT 5`,
    args: [user.id],
  })).rows;

  const totalSessions = (await db.execute({
    sql: "SELECT COUNT(*) as count FROM schedule_sessions WHERE student_id = ? AND status = 'completed'",
    args: [user.id],
  })).rows[0].count;

  const unreadNotifications = (await db.execute({
    sql: 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    args: [user.id],
  })).rows[0].count;

  return json({
    stats: { activePlans, todayCompletedExercises, totalSessions, unreadNotifications },
    latestProgress,
    upcomingSessions,
  });
}
