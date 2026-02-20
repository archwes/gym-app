import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const url = new URL(request.url);
  const muscle_group = url.searchParams.get('muscle_group');
  const difficulty = url.searchParams.get('difficulty');
  const search = url.searchParams.get('search');

  let sql = 'SELECT * FROM exercises WHERE 1=1';
  const params: (string | null)[] = [];

  if (muscle_group) { sql += ' AND muscle_group = ?'; params.push(muscle_group); }
  if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
  if (search) { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY name';

  const result = await db.execute({ sql, args: params });
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { name, muscle_group, equipment, description, difficulty } = await request.json();
  if (!name || !muscle_group) return error('Nome e grupo muscular são obrigatórios');

  const id = uuidv4();
  await db.execute({
    sql: 'INSERT INTO exercises (id, name, muscle_group, equipment, description, difficulty, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [id, name, muscle_group, equipment || null, description || null, difficulty || 'Intermediário', user.id],
  });

  const result = await db.execute({ sql: 'SELECT * FROM exercises WHERE id = ?', args: [id] });
  return json(result.rows[0], 201);
}
