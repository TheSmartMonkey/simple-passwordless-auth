import { UserDao } from '@/models/user.model';
import { sign } from 'jsonwebtoken';

export function encodeJwtToken(
  jwtTokenSecret: string,
  user: Partial<UserDao>,
  { tokenExpiresIn = '30d' }: { tokenExpiresIn?: string } = {},
): string {
  return sign(user, jwtTokenSecret, { expiresIn: tokenExpiresIn });
}
