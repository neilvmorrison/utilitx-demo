import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export * from './schema';

export type Database = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle({ client });
}
