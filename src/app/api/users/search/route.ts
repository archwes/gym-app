import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  if (!q || q.trim().length < 2) return json([]);

  const result = await db.execute({
    sql: `SELECT id, name, email, avatar, phone, trainer_id 
          FROM users 
          WHERE role = 'student' 
            AND (name LIKE ? OR email LIKE ?)
            AND id NOT IN (SELECT id FROM users WHERE trainer_id = ?)
          ORDER BY name 
          LIMIT 10`,
    args: [`%${q}%`, `%${q}%`, user.id],
  });

  return json(result.rows);
}
