import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const result = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    args: [user.id],
  });
  return json({ count: result.rows[0].count });
}
