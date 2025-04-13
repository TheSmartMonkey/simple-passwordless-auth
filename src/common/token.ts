import { TokenExpiration, UserToken } from '@/models/token.model';
import { UserDao } from '@/models/user.model';
import { sign } from 'jsonwebtoken';

export function getTokenFromJwtTokenSecret(
  user: UserDao,
  jwtTokenSecret: string,
  { tokenExpiresIn = '30d' }: { tokenExpiresIn?: TokenExpiration } = {},
): UserToken {
  const partialUser: Partial<UserDao> = {
    _id: user._id,
    email: user.email,
  };
  return encodeJwtToken(partialUser, jwtTokenSecret, { tokenExpiresIn });
}

function encodeJwtToken(
  user: Partial<UserDao>,
  jwtTokenSecret: string,
  { tokenExpiresIn = '30d' }: { tokenExpiresIn?: TokenExpiration } = {},
): UserToken {
  return sign(user, jwtTokenSecret, { expiresIn: tokenExpiresIn });
}
