import { NextRequest } from 'next/server';
import { getAuthUser, json, error } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return error('Token inválido', 401);
  return json({ user });
}
