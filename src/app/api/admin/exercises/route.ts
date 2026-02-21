import { NextRequest } from 'next/server';
import { InValue } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const muscleGroup = searchParams.get('muscle_group') || '';

  let sql = "SELECT e.*, u.name as creator_name FROM exercises e LEFT JOIN users u ON e.created_by = u.id WHERE 1=1";
  const args: InValue[] = [];

  if (search) {
    sql += " AND (e.name LIKE ? OR e.equipment LIKE ?)";
    args.push(`%${search}%`, `%${search}%`);
  }
  if (muscleGroup) {
    sql += " AND e.muscle_group = ?";
    args.push(muscleGroup);
  }

  sql += " ORDER BY e.created_at DESC";

  const result = await db.execute({ sql, args });
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { name, muscle_group, equipment, description, difficulty } = await request.json();
  if (!name || !muscle_group || !difficulty) return error('Nome, grupo muscular e dificuldade são obrigatórios');

  const id = uuidv4();
  await db.execute({
    sql: `INSERT INTO exercises (id, name, muscle_group, equipment, description, difficulty, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, name, muscle_group, equipment || 'Nenhum', description || null, difficulty, user.id],
  });

  const created = await db.execute({ sql: "SELECT * FROM exercises WHERE id = ?", args: [id] });
  return json(created.rows[0], 201);
}
