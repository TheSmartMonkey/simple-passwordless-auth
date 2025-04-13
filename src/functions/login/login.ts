import { validateEmail } from '@/common/helpers';
import { createOrUpdateUser } from '@/core/user/create-or-update-user/create-or-update-user';
import { UpdateUserObject, UserDao } from '@/models/user.model';

export interface LoginCallbacks {
  getUserByEmail: (email: string) => Promise<UserDao | undefined>;
  updateUserWithUpdateUserObject: (updateUserObject: UpdateUserObject) => Promise<void>;
  createUser: (user: UserDao) => Promise<void>;
  sendEmailWithVerificationCode: (email: string, verificationCode: number) => Promise<void>;
}

/**
 * @param email - The email of the user to login
 * @param doesUserByEmailExistCallback - Check if the user exists in your database
 * @param updateUserWithUpdateUserObjectCallback - Update the user in your database
 * @param createUserCallback - Create a new user in your database
 * @param sendEmailWithVerificationCodeCallback - Send an email with the verification code
 */
export async function login(email: UserDao['email'], callbacks: LoginCallbacks): Promise<void> {
  validateEmail(email);
  const user = await createOrUpdateUser(email, callbacks);
  await callbacks.sendEmailWithVerificationCode(email, user.authCode);
}
