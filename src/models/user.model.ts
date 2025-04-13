import { addHoursToCurrentDate, getCurrentDate } from '@/common/date';
import { randomInt } from 'crypto';

export type UserDao = {
  _id: string;
  // TODO: add an orgId
  email: string;
  authCode: number;
  authCodeExpirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type PartialUserWithRequiredEmail = Partial<UserDao> & {
  email: UserDao['email'];
};

// TODO: Implement additional fields
// export type OnlyAdditionalFieldsUser<TUser> = keyof TUser & keyof UserDao extends never ? TUser : never;

export type UpdateUserObject = {
  email: UserDao['email'];
  authCode: UserDao['authCode'];
  authCodeExpirationDate: UserDao['authCodeExpirationDate'];
};

export function generateEmailVerificationSixDigitCode(): number {
  return randomInt(100000, 999999);
}

export function generateAuthCodeExpirationDate(): Date {
  return addHoursToCurrentDate(getCurrentDate(), 1);
}
