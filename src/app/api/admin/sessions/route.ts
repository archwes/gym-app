import { NextRequest } from 'next/server';
import { InValue } from '@libsql/client';
import db, { initializeDatabase } from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  let sql = `SELECT ss.*, 
    t.name as trainer_name, t.avatar as trainer_avatar,
    s.name as student_name, s.avatar as student_avatar
    FROM schedule_sessions ss
    JOIN users t ON ss.trainer_id = t.id
    JOIN users s ON ss.student_id = s.id
    WHERE 1=1`;
  const args: InValue[] = [];

  if (search) {
    sql += " AND (t.name LIKE ? OR s.name LIKE ?)";
    args.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    sql += " AND ss.status = ?";
    args.push(status);
  }

  sql += " ORDER BY ss.date DESC, ss.time DESC";

  const result = await db.execute({ sql, args });
  return json(result.rows);
}

export async function DELETE(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { id } = await request.json();
  if (!id) return error('ID obrigatório');

  await db.execute({ sql: 'DELETE FROM schedule_sessions WHERE id = ?', args: [id] });
  return json({ deleted: true });
}
