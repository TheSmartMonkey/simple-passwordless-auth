import { uuid } from '@/libs/helpers';
import { UserDao } from '@/models/hello.model';
import { faker } from '@faker-js/faker';

export const fake = faker;

export function fakeUser(partialUser: Partial<UserDao>): UserDao {
  return {
    _id: uuid(),
    email: fake.internet.email(),
    authCode: 123456,
    authCodeExpirationDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partialUser,
  };
}

export function fakeAuthCode(): number {
  return fake.number.int({ min: 100000, max: 999999 });
}
