import { validateEmail } from '@/common/helpers';
import { createOrUpdateUser } from '@/core/user/create-or-update-user';
import { UpdateUserObject, UserDao } from '@/models/user.model';

/**
 * @param email - The email of the user to login
 * @param doesUserByEmailExistCallback - Check if the user exists in your database
 * @param updateUserWithUpdateUserObjectCallback - Update the user in your database
 * @param createUserCallback - Create a new user in your database
 * @param sendEmailWithVerificationCodeCallback - Send an email with the verification code
 */
export async function login(
  email: UserDao['email'],
  getUserByEmailCallback: (email: UserDao['email']) => Promise<UserDao | undefined>,
  updateUserWithUpdateUserObjectCallback: (updateUserObject: UpdateUserObject) => Promise<void>,
  createUserCallback: (user: UserDao) => Promise<void>,
  sendEmailWithVerificationCodeCallback: (email: string, verificationCode: number) => Promise<void>,
): Promise<void> {
  validateEmail(email);
  const user = await createOrUpdateUser(email, getUserByEmailCallback, updateUserWithUpdateUserObjectCallback, createUserCallback);
  await sendEmailWithVerificationCodeCallback(email, user.authCode);
}
