import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const url = new URL(request.url);
  const student_id = url.searchParams.get('student_id');

  let targetId: string;
  if (user.role === 'trainer') {
    if (!student_id) return error('student_id necessário para o personal');
    targetId = student_id;
  } else {
    targetId = user.id;
  }

  const result = await db.execute({
    sql: 'SELECT * FROM student_progress WHERE student_id = ? ORDER BY date DESC',
    args: [targetId],
  });
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { student_id, session_id, date, weight, body_fat, chest, waist, hips, arms, thighs, notes } = await request.json();
  const targetId = user.role === 'trainer' ? student_id : user.id;

  if (!targetId || !date) return error('Aluno e data obrigatórios');

  const id = uuidv4();
  await db.execute({
    sql: 'INSERT INTO student_progress (id, student_id, session_id, date, weight, body_fat, chest, waist, hips, arms, thighs, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, targetId, session_id || null, date, weight || null, body_fat || null, chest || null, waist || null, hips || null, arms || null, thighs || null, notes || null],
  });

  const entry = await db.execute({ sql: 'SELECT * FROM student_progress WHERE id = ?', args: [id] });
  return json(entry.rows[0], 201);
}
