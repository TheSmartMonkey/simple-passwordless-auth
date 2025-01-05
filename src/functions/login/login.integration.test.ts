/**
 * @group integration
 */
import * as helpers from '@/libs/helpers';
import { UserDao } from '@/models/user.model';
import { connectDb, disconnectDb } from '@/tests/db/connect';
import { createUser, deleteAllUsers, getAllUsers } from '@/tests/db/queries';
import { fake, fakeAuthCode, fakeCreateUserCallback, fakeGetUserByEmailAndUpdateUserIfExistCallback, fakeUser } from '@/tests/fake';
import { describe, expect, test } from '@jest/globals';
import { login } from './login';

describe('login integration', () => {
  let user: UserDao;
  const email = fake.internet.email();
  const authCode = fakeAuthCode();
  let sendEmailWithVerificationCodeCallback: jest.Mock;

  beforeAll(async () => {
    await connectDb();
    await createUser({
      email,
      authCode,
      authCodeExpirationDate: new Date().toISOString(),
    });
  });

  beforeEach(async () => {
    jest.spyOn(helpers, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
    user = fakeUser({ email, authCode });
    sendEmailWithVerificationCodeCallback = jest.fn();

    await deleteAllUsers();
  });

  afterAll(async () => {
    disconnectDb();
  });

  test('should login create user and send email with verification code when user first login', async () => {
    // Given
    // When
    await login(user.email, fakeGetUserByEmailAndUpdateUserIfExistCallback, fakeCreateUserCallback, sendEmailWithVerificationCodeCallback);
    const users = await getAllUsers();

    // Then
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
    expect(users[0].authCode).toEqual(authCode);
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalled();
  });
});
