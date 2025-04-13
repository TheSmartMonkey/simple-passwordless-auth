import { uuid } from '@/common/helpers';
import { PartialUserWithRequiredEmail, UserDao } from '@/models/user.model';
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, SQLiteUpdateSetSource, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('usersTable', {
  _id: text('_id').primaryKey().unique().default(uuid()),
  email: text('email').unique().notNull(),
  authCode: integer('authCode').notNull(),
  authCodeExpirationDate: text('authCodeExpirationDate').notNull(),
  createdAt: text('createdAt')
    .default(sql`(CURRENT_DATE)`)
    .notNull(),
  updatedAt: text('updatedAt')
    .default(sql`(CURRENT_DATE)`)
    .notNull(),
});

export type InsertDbUser = typeof usersTable.$inferInsert;
export type SelectDbUser = typeof usersTable.$inferSelect;

export function userDaoToInsertUser(user: UserDao): InsertDbUser {
  return {
    email: user.email,
    authCode: user.authCode,
    authCodeExpirationDate: user.authCodeExpirationDate.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function selectDbUserToUserDao(user: SelectDbUser): UserDao {
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    authCodeExpirationDate: new Date(user.authCodeExpirationDate),
  };
}

export function partialUserToSQLiteUpdate(partialUser: PartialUserWithRequiredEmail): SQLiteUpdateSetSource<typeof usersTable> {
  return {
    ...partialUser,
    authCodeExpirationDate: partialUser.authCodeExpirationDate?.toISOString(),
    createdAt: partialUser.createdAt?.toISOString(),
    updatedAt: partialUser.updatedAt?.toISOString(),
  };
}
