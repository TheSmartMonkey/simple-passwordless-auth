import { UserDao } from '@/models/user.model';
import { createUser, getUserByEmail, updateUser } from '@/tests/db/queries';
import { selectDbUserToUserDao, userDaoToInsertUser } from '@/tests/db/schemas';

export async function fakeUpdateUserCallback(user: UserDao): Promise<void> {
  console.log('fakeUpdateUserCallback');
  await updateUser(user);
}

export async function fakeCreateUserCallback(user: UserDao): Promise<void> {
  console.log('fakeCreateUserCallback');
  const insertUser = userDaoToInsertUser(user);
  await createUser(insertUser);
}

export async function fakeGetUserByEmailCallback(email: UserDao['email']): Promise<UserDao | undefined> {
  const userDb = await getUserByEmail(email);
  if (!userDb) return undefined;
  return selectDbUserToUserDao(userDb);
}
