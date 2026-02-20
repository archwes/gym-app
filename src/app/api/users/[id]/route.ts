import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  const result = await db.execute({
    sql: 'SELECT id, name, email, role, avatar, phone, created_at, trainer_id FROM users WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return error('Usuário não encontrado', 404);
  return json(result.rows[0]);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  if (user.id !== id && user.role !== 'trainer') return error('Sem permissão', 403);

  const { name, phone, avatar } = await request.json();
  await db.execute({
    sql: 'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?',
    args: [name || null, phone || null, avatar || null, id],
  });

  const result = await db.execute({
    sql: 'SELECT id, name, email, role, avatar, phone, created_at, trainer_id FROM users WHERE id = ?',
    args: [id],
  });
  return json(result.rows[0]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);
  if (user.role !== 'trainer') return error('Apenas trainers', 403);

  const { id } = await params;
  const check = await db.execute({
    sql: 'SELECT id FROM users WHERE id = ? AND trainer_id = ?',
    args: [id, user.id],
  });
  if (check.rows.length === 0) return error('Aluno não encontrado', 404);

  await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
  return json({ ok: true });
}
