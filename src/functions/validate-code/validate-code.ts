import { getCurrentDate } from '@/common/date';
import { validateEmail } from '@/common/helpers';
import { getTokenFromJwtTokenSecret } from '@/common/token';
import { AuthError } from '@/models/error.model';
import { TokenExpiration } from '@/models/token.model';
import { UserDao } from '@/models/user.model';

export interface ValidateCodeCallbacks {
  getUserByEmail: (email: string) => Promise<UserDao | undefined>;
}

export type ValidateCodeConfig = {
  tokenExpiresIn?: TokenExpiration;
};

/**
 * Validate the code and return a JWT token
 * @param email - The email of the user
 * @param sixDigitCode - The six digit code to validate
 * @param getUserByEmail - Get the user by email in your database
 * @param tokenExpiresIn - Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d"
 * @returns The JWT token
 */
export async function validateCode(
  jwtTokenSecret: string,
  email: string,
  sixDigitCode: number,
  callbacks: ValidateCodeCallbacks,
  config: ValidateCodeConfig = {},
): Promise<string> {
  if (!jwtTokenSecret) throw new AuthError('MISSING_JWT_TOKEN_SECRET');
  validateEmail(email);

  const user = await callbacks.getUserByEmail(email);
  if (!user) throw new AuthError('USER_IS_NOT_REGISTERED');

  const today = getCurrentDate();
  if (user?.authCodeExpirationDate && today > user.authCodeExpirationDate) throw new AuthError('AUTH_CODE_EXPIRED');
  if (sixDigitCode !== user?.authCode) throw new AuthError('WRONG_AUTH_CODE');

  // TODO: block on certain number of tries (inc tries, calculate tries / date, connected update tries to 0 if > 1)
  // TODO: express-rate-limit by ip https://www.npmjs.com/package/express-rate-limit

  return getTokenFromJwtTokenSecret(user, jwtTokenSecret, { tokenExpiresIn: config.tokenExpiresIn });
}
