import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  await db.execute({
    sql: 'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    args: [id, user.id],
  });
  return json({ ok: true });
}
