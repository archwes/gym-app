import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  const { date, time, duration, type, status, notes } = await request.json();

  await db.execute({
    sql: `UPDATE schedule_sessions SET
      date = COALESCE(?, date), time = COALESCE(?, time),
      duration = COALESCE(?, duration), type = COALESCE(?, type),
      status = COALESCE(?, status), notes = COALESCE(?, notes)
    WHERE id = ?`,
    args: [date || null, time || null, duration || null, type || null, status || null, notes || null, id],
  });

  const session = await db.execute({ sql: 'SELECT * FROM schedule_sessions WHERE id = ?', args: [id] });
  if (session.rows.length === 0) return error('Sessão não encontrada', 404);
  return json(session.rows[0]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { id } = await params;
  const session = await db.execute({
    sql: 'SELECT id FROM schedule_sessions WHERE id = ? AND trainer_id = ?',
    args: [id, user.id],
  });
  if (session.rows.length === 0) return error('Sessão não encontrada', 404);

  await db.execute({ sql: 'DELETE FROM schedule_sessions WHERE id = ?', args: [id] });
  return json({ ok: true });
}
