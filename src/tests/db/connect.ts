import Database from 'better-sqlite3';
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';

type DbClient = BetterSQLite3Database<Record<string, never>> & {
  $client: Database.Database;
};

let db: DbClient;

export async function connectDb(): Promise<DbClient> {
  if (db) return db;
  db = drizzle(new Database('test.db'));
  return db;
}

export function disconnectDb(): void {
  db.$client.close();
}
