import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from '@/lib/db';
import { json, error } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await initializeDatabase();

    // Force migration: recreate users table with admin role allowed
    const tableInfo = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
    const createSql = (tableInfo.rows[0]?.sql as string) || '';

    if (!createSql.includes("'admin'")) {
      // Disable foreign keys so we can drop the users table
      await db.execute("PRAGMA foreign_keys = OFF");

      // Need to recreate the table with updated CHECK constraint
      await db.execute("DROP TABLE IF EXISTS users_new");
      await db.execute(`CREATE TABLE users_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('trainer', 'student', 'admin')),
        avatar TEXT DEFAULT '💪',
        phone TEXT,
        cref TEXT,
        email_verified INTEGER DEFAULT 0,
        verification_token TEXT,
        reset_token TEXT,
        reset_token_expires TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        trainer_id TEXT REFERENCES users(id)
      )`);

      // Get actual columns from the existing table
      const cols = await db.execute("PRAGMA table_info(users)");
      const colNames = cols.rows.map((r) => r.name as string);

      // Build column list that exists in both tables
      const allCols = ['id','name','email','password','role','avatar','phone','cref','email_verified','verification_token','reset_token','reset_token_expires','created_at','trainer_id'];
      const safeCols = allCols.filter((c) => colNames.includes(c));
      const colList = safeCols.join(', ');

      await db.execute(`INSERT OR IGNORE INTO users_new (${colList}) SELECT ${colList} FROM users`);
      await db.execute("DROP TABLE users");
      await db.execute("ALTER TABLE users_new RENAME TO users");

      // Re-enable foreign keys
      await db.execute("PRAGMA foreign_keys = ON");
    }

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
