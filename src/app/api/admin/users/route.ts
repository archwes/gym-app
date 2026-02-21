import { NextRequest } from 'next/server';
import { InValue } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from '@/lib/db';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  let sql = "SELECT id, name, email, role, avatar, phone, cref, email_verified, created_at, trainer_id FROM users WHERE 1=1";
  const args: InValue[] = [];

  if (search) {
    sql += " AND (name LIKE ? OR email LIKE ?)";
    args.push(`%${search}%`, `%${search}%`);
  }
  if (role) {
    sql += " AND role = ?";
    args.push(role);
  }

  sql += " ORDER BY created_at DESC";

  const result = await db.execute({ sql, args });
  return json(result.rows);
}

export async function POST(request: NextRequest) {
  await initializeDatabase();
  const user = await getAuthUser(request);
  if (!user || user.role !== 'admin') return error('Acesso negado', 403);

  const { name, email, password, role, phone, cref, email_verified } = await request.json();
  if (!name || !email || !password || !role) return error('Campos obrigatórios: nome, email, senha, tipo');

  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) return error('Email já cadastrado', 409);

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);
  const avatar = role === 'trainer' ? '💪' : role === 'admin' ? '👑' : '🏋️';

  await db.execute({
    sql: `INSERT INTO users (id, name, email, password, role, avatar, phone, cref, email_verified)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, name, email, hashed, role, avatar, phone || null, cref || null, email_verified ? 1 : 0],
  });

  const created = await db.execute({
    sql: "SELECT id, name, email, role, avatar, phone, cref, email_verified, created_at FROM users WHERE id = ?",
    args: [id],
  });

  return json(created.rows[0], 201);
}
