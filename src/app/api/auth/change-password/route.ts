import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Não autorizado', 401);

  const { oldPassword, newPassword } = await request.json();
  if (!oldPassword || !newPassword) return error('Senhas antiga e nova são obrigatórias');
  if (newPassword.length < 6) return error('A nova senha deve ter pelo menos 6 caracteres');

  // Verify old password
  const result = await db.execute({
    sql: 'SELECT password FROM users WHERE id = ?',
    args: [user.id],
  });
  if (result.rows.length === 0) return error('Usuário não encontrado', 404);

  const valid = bcrypt.compareSync(oldPassword, result.rows[0].password as string);
  if (!valid) return error('Senha atual incorreta', 400);

  const hashed = bcrypt.hashSync(newPassword, 10);
  await db.execute({
    sql: 'UPDATE users SET password = ? WHERE id = ?',
    args: [hashed, user.id],
  });

  return json({ message: 'Senha alterada com sucesso!' });
}
