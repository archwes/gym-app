import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  const result = await db.execute({ sql: 'SELECT * FROM exercises WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return error('Exercício não encontrado', 404);
  return json(result.rows[0]);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { id } = await params;
  const { name, muscle_group, equipment, description, difficulty } = await request.json();

  await db.execute({
    sql: 'UPDATE exercises SET name = COALESCE(?, name), muscle_group = COALESCE(?, muscle_group), equipment = COALESCE(?, equipment), description = COALESCE(?, description), difficulty = COALESCE(?, difficulty) WHERE id = ?',
    args: [name || null, muscle_group || null, equipment || null, description || null, difficulty || null, id],
  });

  const result = await db.execute({ sql: 'SELECT * FROM exercises WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return error('Exercício não encontrado', 404);
  return json(result.rows[0]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { id } = await params;
  const result = await db.execute({ sql: 'SELECT * FROM exercises WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return error('Exercício não encontrado', 404);

  await db.execute({ sql: 'DELETE FROM exercises WHERE id = ?', args: [id] });
  return json({ message: 'Exercício removido' });
}
