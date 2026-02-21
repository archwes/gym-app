import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from '@/lib/db';
import { json, error } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await initializeDatabase();

    // Check if admin already exists
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
      args: [],
    });
    if (existing.rows.length > 0) {
      return json({ message: 'Admin já existe. Faça login com admin@fitpro.com / 123456' });
    }

    const id = uuidv4();
    const password = bcrypt.hashSync('123456', 10);

    await db.execute({
      sql: `INSERT INTO users (id, name, email, password, role, avatar, phone, email_verified)
            VALUES (?, ?, ?, ?, 'admin', '👑', '(11) 90000-0000', 1)`,
      args: [id, 'Administrador', 'admin@fitpro.com', password],
    });

    return json({ message: 'Admin criado com sucesso!', email: 'admin@fitpro.com', password: '123456' });
  } catch (err: unknown) {
    return error(err instanceof Error ? err.message : 'Erro ao criar admin', 500);
  }
}
