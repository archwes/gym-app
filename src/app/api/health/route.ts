import { initializeDatabase } from '@/lib/db';
import { json } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    return json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (e) {
    return json({ status: 'error', message: (e as Error).message }, 500);
  }
}
