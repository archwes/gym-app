import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  if (user.role === 'trainer') {
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, avatar, phone, created_at, trainer_id FROM users WHERE trainer_id = ? ORDER BY name',
      args: [user.id],
    });
    return json(result.rows);
  } else {
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?',
      args: [user.trainer_id],
    });
    return json(result.rows);
  }
}
