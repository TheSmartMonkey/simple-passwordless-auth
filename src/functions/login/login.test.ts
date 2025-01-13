/**
 * @group unit
 */
import * as helpers from '@/libs/helpers';
import { UserDao } from '@/models/user.model';
import { fake, fakeAuthCode, fakeUser } from '@/tests/fake';
import { describe, expect, test } from '@jest/globals';
import { login } from './login';

describe('login unit', () => {
  let user: UserDao;
  const authCode = fakeAuthCode();
  const email = fake.internet.email();
  let getUserByEmailAndUpdateUserIfExistCallback: jest.Mock;
  let createUserCallback: jest.Mock;
  let sendEmailWithVerificationCodeCallback: jest.Mock;

  beforeEach(() => {
    jest.spyOn(helpers, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
    user = fakeUser({ email, authCode });
    getUserByEmailAndUpdateUserIfExistCallback = jest.fn(() => Promise.resolve(user));
    createUserCallback = jest.fn();
    sendEmailWithVerificationCodeCallback = jest.fn();
  });

  test('should login and send email with verification code when user first login', async () => {
    // Given
    getUserByEmailAndUpdateUserIfExistCallback = jest.fn(() => Promise.resolve(undefined));

    // When
    await login(email, getUserByEmailAndUpdateUserIfExistCallback, createUserCallback, sendEmailWithVerificationCodeCallback);

    // Then
    expect(getUserByEmailAndUpdateUserIfExistCallback).toHaveBeenCalledWith(expect.objectContaining({ email, authCode }));
    expect(createUserCallback).toHaveBeenCalledWith(expect.objectContaining({ email, authCode }));
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalledWith(user.email, user.authCode);
  });

  test('should login and send email with verification code when user already exists', async () => {
    // Given
    // When
    await login(email, getUserByEmailAndUpdateUserIfExistCallback, createUserCallback, sendEmailWithVerificationCodeCallback);

    // Then
    expect(getUserByEmailAndUpdateUserIfExistCallback).toHaveBeenCalledWith(expect.objectContaining({ email, authCode }));
    expect(createUserCallback).not.toHaveBeenCalled();
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalledWith(user.email, user.authCode);
  });

  test('should throw error when invalid email format', async () => {
    // Given
    const invalidEmail = 'invalid-email-format';

    // When
    // Then
    await expect(
      login(invalidEmail, getUserByEmailAndUpdateUserIfExistCallback, createUserCallback, sendEmailWithVerificationCodeCallback),
    ).rejects.toThrow('simple-passwordless-auth:INVALID_EMAIL_FORMAT');
  });

  test('should create user with additionnal fields', async () => {
    // Given
    const userAdditionnalFields = {
      name: 'John',
    };
    // When
    await login(user.email, getUserByEmailAndUpdateUserIfExistCallback, createUserCallback, sendEmailWithVerificationCodeCallback, {
      userAdditionnalFields,
    });

    // Then
    expect(getUserByEmailAndUpdateUserIfExistCallback).toHaveBeenCalledWith(
      expect.objectContaining({ email, authCode, name: userAdditionnalFields.name }),
    );
    expect(createUserCallback).not.toHaveBeenCalled();
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalledWith(user.email, user.authCode);
  });
});
