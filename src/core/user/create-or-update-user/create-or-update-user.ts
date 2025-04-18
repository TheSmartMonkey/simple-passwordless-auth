import { getUserObject } from '@/core/user/get-user-object/get-user-object';
import { generateAuthCodeExpirationDate, generateEmailVerificationSixDigitCode, UpdateUserObject, UserDao } from '@/models/user.model';

export interface CreateOrUpdateUserCallbacks {
  getUserByEmail: (email: string) => Promise<UserDao | undefined>;
  updateUserWithUpdateUserObject: (updateUserObject: UpdateUserObject) => Promise<void>;
  createUser: (user: UserDao) => Promise<void>;
}

export async function createOrUpdateUser(email: UserDao['email'], callbacks: CreateOrUpdateUserCallbacks): Promise<UserDao> {
  const user = await callbacks.getUserByEmail(email);
  const authCode = generateEmailVerificationSixDigitCode();

  if (user) {
    const userToUpdate: UpdateUserObject = {
      email,
      authCode,
      authCodeExpirationDate: generateAuthCodeExpirationDate(),
    };
    await callbacks.updateUserWithUpdateUserObject(userToUpdate);
    return user;
  }

  const userObject = getUserObject(email, { authCode });
  await callbacks.createUser(userObject);
  return userObject;
}
