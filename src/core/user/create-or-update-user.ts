import { generateAuthCodeExpirationDate, generateEmailVerificationSixDigitCode } from '@/models/user.model';

import { UserDao } from '@/models/user.model';

import { UpdateUserObject } from '@/models/user.model';
import { getUserObject } from './get-user-object';

// TODO: CURRENT Test this function and add it in login / google
export async function createOrUpdateUser(
  email: UserDao['email'],
  getUserByEmailCallback: (email: UserDao['email']) => Promise<UserDao | undefined>,
  updateUserWithUpdateUserObjectCallback: (updateUserObject: UpdateUserObject) => Promise<void>,
  createUserCallback: (user: UserDao) => Promise<void>,
): Promise<UserDao> {
  const user = await getUserByEmailCallback(email);
  const authCode = generateEmailVerificationSixDigitCode();

  if (user) {
    const userToUpdate: UpdateUserObject = {
      email,
      authCode,
      authCodeExpirationDate: generateAuthCodeExpirationDate(),
    };
    await updateUserWithUpdateUserObjectCallback(userToUpdate);
    return user;
  }

  const userObject = getUserObject(email, { authCode });
  await createUserCallback(userObject);
  return userObject;
}
