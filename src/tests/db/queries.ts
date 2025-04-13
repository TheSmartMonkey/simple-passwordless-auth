import { PartialUserWithRequiredEmail } from '@/models/user.model';
import { eq } from 'drizzle-orm';
import { connectDb } from './connect';
import { InsertDbUser, partialUserToSQLiteUpdate, SelectDbUser, usersTable } from './schemas';

export async function createUser(user: InsertDbUser): Promise<void> {
  const db = await connectDb();
  await db.insert(usersTable).values(user);
}

export async function getAllUsers(): Promise<SelectDbUser[]> {
  const db = await connectDb();
  return await db.select().from(usersTable);
}

export async function deleteAllUsers(): Promise<void> {
  const db = await connectDb();
  await db.delete(usersTable);
}

export async function getUserByEmail(email: string): Promise<SelectDbUser | undefined> {
  const db = await connectDb();
  const userDb = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1).execute();
  return userDb[0] ?? undefined;
}

export async function updateUser(partialUser: PartialUserWithRequiredEmail): Promise<void> {
  const db = await connectDb();
  const user = partialUserToSQLiteUpdate(partialUser);
  await db.update(usersTable).set(user).where(eq(usersTable.email, partialUser.email)).execute();
}
