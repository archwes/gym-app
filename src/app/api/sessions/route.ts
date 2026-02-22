import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const status = url.searchParams.get('status');

  let sql: string;
  const params: (string | null)[] = [];

  if (user.role === 'trainer') {
    sql = `SELECT ss.*, u.name as student_name, u.avatar as student_avatar
           FROM schedule_sessions ss
           JOIN users u ON u.id = ss.student_id
           WHERE ss.trainer_id = ?`;
    params.push(user.id);
  } else {
    sql = `SELECT ss.*, u.name as trainer_name, u.avatar as trainer_avatar
           FROM schedule_sessions ss
           JOIN users u ON u.id = ss.trainer_id
           WHERE ss.student_id = ?`;
    params.push(user.id);
  }

  if (date) { sql += ' AND ss.date = ?'; params.push(date); }
  if (status) { sql += ' AND ss.status = ?'; params.push(status); }
  sql += ' ORDER BY ss.date, ss.time';

  const result = await db.execute({ sql, args: params });
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { student_id, date, time, duration, type, notes } = await request.json();
  if (!student_id || !date || !time) return error('Aluno, data e horário são obrigatórios');

  const id = uuidv4();
  await db.execute({
    sql: 'INSERT INTO schedule_sessions (id, trainer_id, student_id, date, time, duration, type, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, user.id, student_id, date, time, duration || 60, type || 'Treino', 'scheduled', notes || null],
  });

  // Notify student
  await db.execute({
    sql: 'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
    args: [uuidv4(), student_id, 'Sessão agendada', `Nova sessão de ${type || 'Treino'} em ${date.split('-').reverse().join('/')} às ${time}.`, 'info'],
  });

  const session = await db.execute({
    sql: `SELECT ss.*, u.name as student_name, u.avatar as student_avatar
          FROM schedule_sessions ss
          JOIN users u ON u.id = ss.student_id
          WHERE ss.id = ?`,
    args: [id],
  });
  return json(session.rows[0], 201);
}
