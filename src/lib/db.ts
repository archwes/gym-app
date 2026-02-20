import { createClient } from '@libsql/client';

const db = createClient({
  url: (process.env.TURSO_DATABASE_URL || '').trim(),
  authToken: (process.env.TURSO_AUTH_TOKEN || '').trim(),
});

export default db;

export async function initializeDatabase() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('trainer', 'student')),
      avatar TEXT DEFAULT '💪',
      phone TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      trainer_id TEXT REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      equipment TEXT NOT NULL DEFAULT 'Nenhum',
      description TEXT,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('Iniciante', 'Intermediário', 'Avançado')),
      created_by TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      trainer_id TEXT NOT NULL REFERENCES users(id),
      student_id TEXT NOT NULL REFERENCES users(id),
      day_of_week TEXT NOT NULL DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY,
      workout_plan_id TEXT NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      sets INTEGER NOT NULL DEFAULT 3,
      reps TEXT NOT NULL DEFAULT '10-12',
      rest_seconds INTEGER NOT NULL DEFAULT 60,
      weight TEXT,
      notes TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS schedule_sessions (
      id TEXT PRIMARY KEY,
      trainer_id TEXT NOT NULL REFERENCES users(id),
      student_id TEXT NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER NOT NULL DEFAULT 60,
      type TEXT NOT NULL CHECK(type IN ('Treino', 'Avaliação', 'Consulta')),
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student_progress (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      weight REAL,
      body_fat REAL,
      chest REAL,
      waist REAL,
      hips REAL,
      arms REAL,
      thighs REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning')),
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS completed_exercises (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id),
      workout_plan_id TEXT NOT NULL REFERENCES workout_plans(id),
      exercise_id TEXT NOT NULL REFERENCES exercises(id),
      completed_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
