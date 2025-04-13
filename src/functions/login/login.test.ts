/**
 * @group unit
 */
import { AuthError } from '@/models/error.model';
import * as userModel from '@/models/user.model';
import { UserDao } from '@/models/user.model';
import { fakeUser } from '@/tests/fakes/fake';
import { login, LoginCallbacks } from './login';

describe('login unit', () => {
  let user: UserDao;
  let getUserByEmailCallback: jest.Mock;
  let updateUserWithUpdateUserObjectCallback: jest.Mock;
  let createUserCallback: jest.Mock;
  let sendEmailWithVerificationCodeCallback: jest.Mock;
  let callbacks: LoginCallbacks;

  beforeEach(() => {
    user = fakeUser();
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(user.authCode);
    jest.spyOn(userModel, 'generateAuthCodeExpirationDate').mockReturnValue(user.authCodeExpirationDate);
    getUserByEmailCallback = jest.fn(() => Promise.resolve(user));
    updateUserWithUpdateUserObjectCallback = jest.fn(() => Promise.resolve());
    createUserCallback = jest.fn();
    sendEmailWithVerificationCodeCallback = jest.fn();
    callbacks = {
      getUserByEmail: getUserByEmailCallback,
      updateUserWithUpdateUserObject: updateUserWithUpdateUserObjectCallback,
      createUser: createUserCallback,
      sendEmailWithVerificationCode: sendEmailWithVerificationCodeCallback,
    };
  });

  test('should login and send email with verification code when user first login', async () => {
    // Given
    getUserByEmailCallback = jest.fn(() => Promise.resolve(undefined));
    callbacks.getUserByEmail = getUserByEmailCallback;

    // When
    await login(user.email, callbacks);

    // Then
    expect(getUserByEmailCallback).toHaveBeenCalledWith(user.email);
    expect(updateUserWithUpdateUserObjectCallback).not.toHaveBeenCalled();
    expect(createUserCallback).toHaveBeenCalledWith(expect.objectContaining({ email: user.email, authCode: user.authCode }));
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalledWith(user.email, user.authCode);
  });

  test('should login and send email with verification code when user already exists', async () => {
    // Given
    // When
    await login(user.email, callbacks);

    // Then
    expect(getUserByEmailCallback).toHaveBeenCalledWith(user.email);
    expect(updateUserWithUpdateUserObjectCallback).toHaveBeenCalledWith(
      expect.objectContaining({ email: user.email, authCode: user.authCode, authCodeExpirationDate: user.authCodeExpirationDate }),
    );
    expect(createUserCallback).not.toHaveBeenCalled();
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalledWith(user.email, user.authCode);
  });

  test('should throw error when invalid email format', async () => {
    // Given
    const invalidEmail = 'invalid-email-format';

    // When
    // Then
    await expect(login(invalidEmail, callbacks)).rejects.toThrow(new AuthError('INVALID_EMAIL_FORMAT'));
  });
});
