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

  await db.execute({
    sql: 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    args: [id, user.id],
  });

  const n = await db.execute({ sql: 'SELECT * FROM notifications WHERE id = ?', args: [id] });
  if (n.rows.length === 0) return error('Notificação não encontrada', 404);
  return json(n.rows[0]);
}
