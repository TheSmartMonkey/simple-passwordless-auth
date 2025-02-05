import { UserDao, UserToken } from '@/models/user.model';
import { sign } from 'jsonwebtoken';

export function encodeJwtToken(
  user: Partial<UserDao>,
  jwtTokenSecret: string,
  { tokenExpiresIn = '30d' }: { tokenExpiresIn?: string } = {},
): UserToken {
  return sign(user, jwtTokenSecret, { expiresIn: tokenExpiresIn });
}

export function getTokenFromJwtTokenSecret(
  user: UserDao,
  jwtTokenSecret: string,
  { tokenExpiresIn }: { tokenExpiresIn?: string } = {},
): UserToken {
  const partialUser: Partial<UserDao> = {
    _id: user._id,
    email: user.email,
  };
  return encodeJwtToken(partialUser, jwtTokenSecret, { tokenExpiresIn });
}
