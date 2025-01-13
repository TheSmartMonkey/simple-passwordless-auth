import { uuid } from '@/libs/helpers';
import { PartialUserWithRequiredEmail, UserDao } from '@/models/user.model';
import { faker } from '@faker-js/faker';
import { createUser, getUserByEmail, getUserByEmailAndUpdateUserIfExist } from './db/queries';
import { InsertDbUser, selectDbUserToUserDao, userDaoToInsertUser } from './db/schemas';

export const fake = faker;

export function fakeUser(partialUser: Partial<UserDao> = {}): UserDao {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + 1);
  return {
    _id: uuid(),
    email: fake.internet.email(),
    authCode: 123456,
    authCodeExpirationDate: expiredDate,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partialUser,
  };
}

export function fakeDbUser(partialUser: Partial<InsertDbUser> = {}): InsertDbUser {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + 1);
  return {
    _id: uuid(),
    email: fake.internet.email(),
    authCode: 123456,
    authCodeExpirationDate: expiredDate.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partialUser,
  };
}

export async function createFakeUser(): Promise<void> {
  const user = fakeDbUser();
  await createUser(user);
}

export function fakeAuthCode(): number {
  return fake.number.int({ min: 100000, max: 999999 });
}

export async function fakeGetUserByEmailAndUpdateUserIfExistCallback(
  user: PartialUserWithRequiredEmail<UserDao>,
): Promise<UserDao | undefined> {
  console.log('fakeGetUserByEmailAndUpdateUserIfExistCallback');
  const userDb = await getUserByEmailAndUpdateUserIfExist(user);
  if (!userDb) return undefined;
  return selectDbUserToUserDao(userDb);
}

export async function fakeCreateUserCallback<TUser extends UserDao>(user: TUser): Promise<void> {
  console.log('fakeCreateUserCallback');
  const insertUser = userDaoToInsertUser(user);
  await createUser(insertUser);
}

export async function fakeGetUserByEmailCallback(email: string): Promise<UserDao | undefined> {
  const userDb = await getUserByEmail(email);
  if (!userDb) return undefined;
  return selectDbUserToUserDao(userDb);
}
