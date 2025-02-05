/**
 * @group integration
 */
import * as helpers from '@/common/helpers';
import { UserDao } from '@/models/user.model';
import { connectDb, disconnectDb } from '@/tests/db/connect';
import { createUser, deleteAllUsers, getAllUsers } from '@/tests/db/queries';
import { fake, fakeAuthCode, fakeCreateUserCallback, fakeGetUserByEmailAndUpdateUserIfExistCallback, fakeUser } from '@/tests/fake';
import { login } from './login';

describe('login integration', () => {
  let user: UserDao;
  const email = fake.internet.email();
  const authCode = fakeAuthCode();
  let getUserByEmailAndUpdateUserIfExistCallback: jest.Mock;
  let createUserCallback: jest.Mock;
  let sendEmailWithVerificationCodeCallback: jest.Mock;

  beforeAll(async () => {
    await connectDb();
  });

  beforeEach(async () => {
    jest.spyOn(helpers, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
    user = fakeUser({ email, authCode });
    getUserByEmailAndUpdateUserIfExistCallback = jest.fn(() => Promise.resolve(user));
    createUserCallback = jest.fn();
    sendEmailWithVerificationCodeCallback = jest.fn();

    await deleteAllUsers();
  });

  afterAll(async () => {
    disconnectDb();
  });

  test('should not create user and send email with verification code when user already exists', async () => {
    // Given
    await createUser({
      email,
      authCode,
      authCodeExpirationDate: new Date().toISOString(),
    });

    // When
    await login(user.email, fakeGetUserByEmailAndUpdateUserIfExistCallback, createUserCallback, sendEmailWithVerificationCodeCallback);
    const users = await getAllUsers();

    // Then
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
    expect(users[0].authCode).toEqual(authCode);
    expect(createUserCallback).not.toHaveBeenCalled();
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalled();
  });

  test('should create user and send email with verification code when user first login', async () => {
    // Given
    getUserByEmailAndUpdateUserIfExistCallback = jest.fn(() => Promise.resolve(undefined));

    // When
    await login(user.email, getUserByEmailAndUpdateUserIfExistCallback, fakeCreateUserCallback, sendEmailWithVerificationCodeCallback);
    const users = await getAllUsers();

    // Then
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
    expect(users[0].authCode).toEqual(authCode);
    expect(getUserByEmailAndUpdateUserIfExistCallback).toHaveBeenCalled();
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalled();
  });
});
