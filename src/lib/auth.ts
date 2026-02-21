import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fitpro_saas_secret_2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string | null;
  created_at: string;
  trainer_id: string | null;
}

export function signToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, avatar, phone, cref, email_verified, created_at, trainer_id FROM users WHERE id = ?',
      args: [decoded.userId],
    });
    if (result.rows.length === 0) return null;
    return result.rows[0] as unknown as AuthUser;
  } catch {
    return null;
  }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function error(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
