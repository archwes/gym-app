import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  await db.execute({
    sql: 'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
    args: [user.id],
  });
  return json({ ok: true });
}
