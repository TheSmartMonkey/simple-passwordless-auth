import { getCurrentDate } from '@/common/date';
import { uuid } from '@/common/helpers';
import { generateAuthCodeExpirationDate, generateEmailVerificationSixDigitCode, UserDao } from '@/models/user.model';

/**
 * Get a user object
 * @param email - The email of the user
 * @param userAdditionnalFields - The additionnal fields of the user
 * @returns The user object
 */
export function getUserObject(email: string, { authCode }: { authCode?: number } = {}): UserDao {
  const today = getCurrentDate();
  const user: UserDao = {
    _id: uuid(),
    email,
    authCode: authCode ?? generateEmailVerificationSixDigitCode(),
    authCodeExpirationDate: generateAuthCodeExpirationDate(),
    createdAt: today,
    updatedAt: today,
  } as UserDao;
  return user;
}
