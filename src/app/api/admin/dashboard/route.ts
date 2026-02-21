import { NextRequest } from 'next/server';
import db, { initializeDatabase } from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const [
    usersResult,
    trainersResult,
    studentsResult,
    exercisesResult,
    workoutsResult,
    sessionsResult,
    notificationsResult,
    verifiedResult,
    unverifiedResult,
  ] = await Promise.all([
    db.execute("SELECT COUNT(*) as count FROM users"),
    db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'trainer'"),
    db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'"),
    db.execute("SELECT COUNT(*) as count FROM exercises"),
    db.execute("SELECT COUNT(*) as count FROM workout_plans"),
    db.execute("SELECT COUNT(*) as count FROM schedule_sessions"),
    db.execute("SELECT COUNT(*) as count FROM notifications WHERE is_read = 0"),
    db.execute("SELECT COUNT(*) as count FROM users WHERE email_verified = 1"),
    db.execute("SELECT COUNT(*) as count FROM users WHERE email_verified = 0"),
  ]);

  // Recent users
  const recentUsers = await db.execute(
    "SELECT id, name, email, role, avatar, phone, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT 10"
  );

  // Today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = await db.execute({
    sql: `SELECT ss.*, u1.name as trainer_name, u2.name as student_name
          FROM schedule_sessions ss
          JOIN users u1 ON ss.trainer_id = u1.id
          JOIN users u2 ON ss.student_id = u2.id
          WHERE ss.date = ? ORDER BY ss.time`,
    args: [today],
  });

  return json({
    stats: {
      totalUsers: Number(usersResult.rows[0].count),
      totalTrainers: Number(trainersResult.rows[0].count),
      totalStudents: Number(studentsResult.rows[0].count),
      totalExercises: Number(exercisesResult.rows[0].count),
      totalWorkouts: Number(workoutsResult.rows[0].count),
      totalSessions: Number(sessionsResult.rows[0].count),
      unreadNotifications: Number(notificationsResult.rows[0].count),
      verifiedUsers: Number(verifiedResult.rows[0].count),
      unverifiedUsers: Number(unverifiedResult.rows[0].count),
    },
    recentUsers: recentUsers.rows,
    todaySessions: todaySessions.rows,
  });
}
