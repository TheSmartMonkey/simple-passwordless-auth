/**
 * @group integration
 */
import * as userModel from '@/models/user.model';
import { UserDao } from '@/models/user.model';
import { connectDb, disconnectDb } from '@/tests/db/connect';
import { createUser, deleteAllUsers, getAllUsers } from '@/tests/db/queries';
import { fake, fakeAuthCode, fakeUser } from '@/tests/fakes/fake';
import { fakeCreateUserCallback, fakeGetUserByEmailCallback } from '@/tests/fakes/fake-callback';
import { login, LoginCallbacks } from './login';
import { loginCallbacksMock } from './login.mock';

describe('login integration', () => {
  let user: UserDao;
  const email = fake.internet.email();
  const authCode = fakeAuthCode();
  let callbacks: jest.Mocked<LoginCallbacks>;

  beforeAll(async () => {
    await connectDb();
  });

  beforeEach(async () => {
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
    user = fakeUser({ email, authCode });
    callbacks = loginCallbacksMock(user);

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
    callbacks.getUserByEmail = fakeGetUserByEmailCallback as jest.Mock;

    // When
    await login(user.email, callbacks);
    const users = await getAllUsers();

    // Then
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
    expect(users[0].authCode).toEqual(authCode);
    expect(callbacks.createUser).not.toHaveBeenCalled();
    expect(callbacks.sendEmailWithVerificationCode).toHaveBeenCalled();
  });

  test('should create user and send email with verification code when user first login', async () => {
    // Given
    callbacks.getUserByEmail = jest.fn().mockImplementation(() => Promise.resolve(undefined));
    callbacks.createUser = fakeCreateUserCallback as jest.Mock;

    // When
    await login(user.email, callbacks);
    const users = await getAllUsers();

    // Then
    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual(email);
    expect(users[0].authCode).toEqual(authCode);
    expect(callbacks.getUserByEmail).toHaveBeenCalled();
    expect(callbacks.sendEmailWithVerificationCode).toHaveBeenCalled();
  });
});
