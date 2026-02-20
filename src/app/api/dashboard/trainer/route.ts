import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const totalStudents = (await db.execute({
    sql: 'SELECT COUNT(*) as count FROM users WHERE trainer_id = ?',
    args: [user.id],
  })).rows[0].count;

  const activePlans = (await db.execute({
    sql: 'SELECT COUNT(*) as count FROM workout_plans WHERE trainer_id = ? AND is_active = 1',
    args: [user.id],
  })).rows[0].count;

  const todaySessions = (await db.execute({
    sql: "SELECT COUNT(*) as count FROM schedule_sessions WHERE trainer_id = ? AND date = DATE('now')",
    args: [user.id],
  })).rows[0].count;

  const completedSessions = (await db.execute({
    sql: "SELECT COUNT(*) as count FROM schedule_sessions WHERE trainer_id = ? AND status = 'completed'",
    args: [user.id],
  })).rows[0].count;

  const todaySchedule = (await db.execute({
    sql: `SELECT ss.*, u.name as student_name, u.avatar as student_avatar
          FROM schedule_sessions ss
          JOIN users u ON u.id = ss.student_id
          WHERE ss.trainer_id = ? AND ss.date = DATE('now')
          ORDER BY ss.time`,
    args: [user.id],
  })).rows;

  const recentStudents = (await db.execute({
    sql: 'SELECT id, name, email, avatar, phone, created_at FROM users WHERE trainer_id = ? ORDER BY created_at DESC LIMIT 5',
    args: [user.id],
  })).rows;

  return json({
    stats: { totalStudents, activePlans, todaySessions, completedSessions },
    todaySchedule,
    recentStudents,
  });
}
