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
  const { weight, body_fat, chest, waist, hips, arms, thighs, notes } = await request.json();

  await db.execute({
    sql: `UPDATE student_progress SET
      weight = COALESCE(?, weight), body_fat = COALESCE(?, body_fat),
      chest = COALESCE(?, chest), waist = COALESCE(?, waist),
      hips = COALESCE(?, hips), arms = COALESCE(?, arms),
      thighs = COALESCE(?, thighs), notes = COALESCE(?, notes)
    WHERE id = ?`,
    args: [weight || null, body_fat || null, chest || null, waist || null, hips || null, arms || null, thighs || null, notes || null, id],
  });

  const entry = await db.execute({ sql: 'SELECT * FROM student_progress WHERE id = ?', args: [id] });
  if (entry.rows.length === 0) return error('Registro não encontrado', 404);
  return json(entry.rows[0]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { id } = await params;
  const entry = await db.execute({ sql: 'SELECT id FROM student_progress WHERE id = ?', args: [id] });
  if (entry.rows.length === 0) return error('Registro não encontrado', 404);

  await db.execute({ sql: 'DELETE FROM student_progress WHERE id = ?', args: [id] });
  return json({ ok: true });
}
