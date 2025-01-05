import { addHoursToCurrentDate, generateEmailVerificationSixDigitCode, getCurrentDate, isValidEmail, uuid } from '@/libs/helpers';
import { GetUserByEmailAndUpdateUserIfExist, UserDao } from '@/models/hello.model';

/**
 * @param email - The email of the user to login
 * @param getUserByEmailAndUpdateUserIfExistCallback - Get the user by email and update the user if exist in your database
 * @param createUserCallback - Create a new user in your database
 * @param sendEmailWithVerificationCodeCallback - Send an email with the verification code
 */
export async function login(
  email: string,
  getUserByEmailAndUpdateUserIfExistCallback: (user: GetUserByEmailAndUpdateUserIfExist) => Promise<UserDao>,
  createUserCallback: (user: UserDao) => Promise<void>,
  sendEmailWithVerificationCodeCallback: (email: string, verificationCode: number) => Promise<void>,
): Promise<void> {
  const decodedEmail = decodeURIComponent(email);
  if (!isValidEmail(decodedEmail)) {
    throw new Error('INVALID_EMAIL_FORMAT');
  }
  const authCode = generateEmailVerificationSixDigitCode();
  const currentDate = getCurrentDate();
  const date = addHoursToCurrentDate(currentDate);
  const user: UserDao = {
    _id: uuid(),
    email: decodedEmail,
    authCode,
    authCodeExpirationDate: date,
    createdAt: currentDate,
    updatedAt: currentDate,
  };

  await updateUserOrCreateNewUser(user, getUserByEmailAndUpdateUserIfExistCallback, createUserCallback);
  await sendEmailWithVerificationCodeCallback(decodedEmail, authCode);
}

async function updateUserOrCreateNewUser(
  user: UserDao,
  getUserByEmailAndUpdateUserIfExistCallback: (user: GetUserByEmailAndUpdateUserIfExist) => Promise<UserDao | undefined>,
  createUserCallback: (user: UserDao) => Promise<void>,
): Promise<void> {
  const partialUser: GetUserByEmailAndUpdateUserIfExist = {
    email: user.email,
    authCode: user.authCode,
    authCodeExpirationDate: user.authCodeExpirationDate,
  };
  const foundUser = await getUserByEmailAndUpdateUserIfExistCallback(partialUser);
  if (!foundUser) {
    await createUserCallback(user);
  }
}
