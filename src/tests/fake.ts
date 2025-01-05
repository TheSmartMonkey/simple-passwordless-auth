import { uuid } from '@/libs/helpers';
import { UserDao } from '@/models/user.model';
import { faker } from '@faker-js/faker';

export const fake = faker;

export function fakeUser(partialUser: Partial<UserDao>): UserDao {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + 1);
  return {
    _id: uuid(),
    email: fake.internet.email(),
    authCode: 123456,
    authCodeExpirationDate: expiredDate,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partialUser,
  };
}

export function fakeAuthCode(): number {
  return fake.number.int({ min: 100000, max: 999999 });
}
