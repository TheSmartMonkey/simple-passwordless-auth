import { addHoursToCurrentDate, generateEmailVerificationSixDigitCode, getCurrentDate, uuid, validateEmail } from '@/libs/helpers';
import { PartialUserWithRequiredEmail, UserDao } from '@/models/user.model';

/**
 * @param email - The email of the user to login
 * @param getUserByEmailAndUpdateUserIfExistCallback - Get the user by email and update the user if exist in your database
 * @param createUserCallback - Create a new user in your database
 * @param sendEmailWithVerificationCodeCallback - Send an email with the verification code
 */
export async function login(
  email: string,
  getUserByEmailAndUpdateUserIfExistCallback: (user: PartialUserWithRequiredEmail) => Promise<UserDao>,
  createUserCallback: (user: UserDao) => Promise<void>,
  sendEmailWithVerificationCodeCallback: (email: string, verificationCode: number) => Promise<void>,
): Promise<void> {
  validateEmail(email);
  const authCode = generateEmailVerificationSixDigitCode();
  const today = getCurrentDate();
  const user: UserDao = {
    _id: uuid(),
    email,
    authCode,
    authCodeExpirationDate: addHoursToCurrentDate(today),
    createdAt: today,
    updatedAt: today,
  };

  await updateUserOrCreateNewUser(user, getUserByEmailAndUpdateUserIfExistCallback, createUserCallback);
  await sendEmailWithVerificationCodeCallback(email, authCode);
}

async function updateUserOrCreateNewUser(
  user: UserDao,
  getUserByEmailAndUpdateUserIfExistCallback: (partialUser: PartialUserWithRequiredEmail) => Promise<UserDao | undefined>,
  createUserCallback: (user: UserDao) => Promise<void>,
): Promise<void> {
  const partialUser: PartialUserWithRequiredEmail = {
    email: user.email,
    authCode: user.authCode,
    authCodeExpirationDate: user.authCodeExpirationDate,
  };
  const foundUser = await getUserByEmailAndUpdateUserIfExistCallback(partialUser);
  if (!foundUser) {
    await createUserCallback(user);
  }
}
