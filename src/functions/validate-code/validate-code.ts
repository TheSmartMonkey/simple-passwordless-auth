import { getCurrentDate, throwError, validateEmail } from '@/libs/helpers';
import { encodeJwtToken } from '@/libs/token';
import { UserDao } from '@/models/user.model';

/**
 * Validate the code and return a JWT token
 * @param email - The email of the user
 * @param sixDigitCode - The six digit code to validate
 * @param getUserByEmail - Get the user by email in your database
 * @param tokenExpiresIn - Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d"
 * @returns The JWT token
 */
export async function validateCode<TUser extends UserDao>(
  jwtTokenSecret: string,
  email: string,
  sixDigitCode: number,
  getUserByEmail: (email: string) => Promise<TUser | undefined>,
  { tokenExpiresIn = '30d' }: { tokenExpiresIn?: string } = {},
): Promise<string> {
  if (!jwtTokenSecret) throwError('MISSING_JWT_TOKEN_SECRET');
  validateEmail(email);

  const user = await getUserByEmail(email);
  if (!user) throwError('USER_IS_NOT_REGISTERED');

  const today = getCurrentDate();
  if (user?.authCodeExpirationDate && today > user.authCodeExpirationDate) throwError('AUTH_CODE_EXPIRED');
  if (sixDigitCode !== user?.authCode) throwError('WRONG_AUTH_CODE');

  // TODO: block on certain number of tries (inc tries, calculate tries / date, connected update tries to 0 if > 1)
  // TODO: express-rate-limit by ip https://www.npmjs.com/package/express-rate-limit

  return getTokenFromJwtTokenSecret(user, jwtTokenSecret, { tokenExpiresIn });
}

function getTokenFromJwtTokenSecret(user: UserDao, jwtTokenSecret: string, { tokenExpiresIn }: { tokenExpiresIn?: string } = {}): string {
  const partialUser: Partial<UserDao> = {
    _id: user._id,
    email: user.email,
  };
  return encodeJwtToken(jwtTokenSecret, partialUser, { tokenExpiresIn });
}
