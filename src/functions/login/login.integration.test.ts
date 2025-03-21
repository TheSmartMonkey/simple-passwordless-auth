/**
 * @group integration
 */
import * as userModel from '@/models/user.model';
import { UserDao } from '@/models/user.model';
import { connectDb, disconnectDb } from '@/tests/db/connect';
import { createUser, deleteAllUsers, getAllUsers } from '@/tests/db/queries';
import { fake, fakeAuthCode, fakeUser } from '@/tests/fakes/fake';
import { fakeCreateUserCallback, fakeGetUserByEmailCallback } from '@/tests/fakes/fake-callback';
import { login } from './login';

describe('login integration', () => {
  let user: UserDao;
  const email = fake.internet.email();
  const authCode = fakeAuthCode();
  let getUserByEmailCallbackMock: jest.Mock;
  let updateUserWithUpdateUserObjectCallback: jest.Mock;
  let createUserCallback: jest.Mock;
  let sendEmailWithVerificationCodeCallback: jest.Mock;

  beforeAll(async () => {
    await connectDb();
  });

  beforeEach(async () => {
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
    user = fakeUser({ email, authCode });
    getUserByEmailCallbackMock = jest.fn(() => Promise.resolve(user));
    updateUserWithUpdateUserObjectCallback = jest.fn();
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
    await login(
      user.email,
      fakeGetUserByEmailCallback,
      updateUserWithUpdateUserObjectCallback,
      createUserCallback,
      sendEmailWithVerificationCodeCallback,
    );
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
    getUserByEmailCallbackMock = jest.fn(() => Promise.resolve(undefined));

    // When
    await login(
      user.email,
      getUserByEmailCallbackMock,
      updateUserWithUpdateUserObjectCallback,
      fakeCreateUserCallback,
      sendEmailWithVerificationCodeCallback,
    );
    const users = await getAllUsers();

    // Then
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
    expect(users[0].authCode).toEqual(authCode);
    expect(getUserByEmailCallbackMock).toHaveBeenCalled();
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalled();
  });
});
