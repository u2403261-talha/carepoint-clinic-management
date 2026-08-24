import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env explicitly to ensure credentials exist on Windows
dotenv.config({ path: resolve(process.cwd(), '.env') });

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const host = process.env.SQL_HOST;
    
    // Automatically detect if we are running in the AI Studio sandbox (Unix Socket)
    // Unix sockets start with '/' and do not support SSL.
    // External hosts (Neon, Supabase) are domains/IPs and strictly require SSL.
    const isUnixSocket = host && host.startsWith('/');
    const useSSL = !isUnixSocket;

    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    });
    
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
