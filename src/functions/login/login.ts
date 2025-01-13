import { addHoursToCurrentDate, generateEmailVerificationSixDigitCode, getCurrentDate, uuid, validateEmail } from '@/libs/helpers';
import { OnlyAdditionnalFieldsUser, PartialUserWithRequiredEmail, UserDao } from '@/models/user.model';

/**
 * @param email - The email of the user to login
 * @param getUserByEmailAndUpdateUserIfExistCallback - Get the user by email and update the user if exist in your database
 * @param createUserCallback - Create a new user in your database
 * @param sendEmailWithVerificationCodeCallback - Send an email with the verification code
 * @param userAdditionnalFields - Additionnal fields to the user
 */
export async function login<TUser extends UserDao>(
  email: string,
  getUserByEmailAndUpdateUserIfExistCallback: (user: PartialUserWithRequiredEmail<TUser>) => Promise<TUser | undefined>,
  createUserCallback: (user: TUser) => Promise<void>,
  sendEmailWithVerificationCodeCallback: (email: string, verificationCode: number) => Promise<void>,
  { userAdditionnalFields = {} as OnlyAdditionnalFieldsUser<TUser> }: { userAdditionnalFields?: OnlyAdditionnalFieldsUser<TUser> } = {},
): Promise<void> {
  validateEmail(email);
  const authCode = generateEmailVerificationSixDigitCode();
  const today = getCurrentDate();
  const user: TUser = {
    _id: uuid(),
    email,
    authCode,
    authCodeExpirationDate: addHoursToCurrentDate(today),
    createdAt: today,
    updatedAt: today,
    ...userAdditionnalFields,
  } as TUser;

  await updateUserOrCreateNewUser<TUser>(user, getUserByEmailAndUpdateUserIfExistCallback, createUserCallback);
  await sendEmailWithVerificationCodeCallback(email, authCode);
}

async function updateUserOrCreateNewUser<TUser extends UserDao>(
  user: TUser,
  getUserByEmailAndUpdateUserIfExistCallback: (partialUser: PartialUserWithRequiredEmail<TUser>) => Promise<TUser | undefined>,
  createUserCallback: (user: TUser) => Promise<void>,
): Promise<void> {
  const foundUser = await getUserByEmailAndUpdateUserIfExistCallback(user);
  if (!foundUser) {
    await createUserCallback(user);
  }
}
