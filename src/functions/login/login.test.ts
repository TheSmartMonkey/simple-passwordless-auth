/**
 * @group unit
 */
import * as userModel from '@/models/user.model';
import { OnlyAdditionalFieldsUser, UserDao } from '@/models/user.model';
import { fakeUser } from '@/tests/fake';
import { login } from './login';

describe('login unit', () => {
  let user: UserDao;
  let createUserCallback: jest.Mock;
  let sendEmailWithVerificationCodeCallback: jest.Mock;
  let doesUserByEmailExistCallback: jest.Mock;
  let updateUserWithUpdateUserObjectCallback: jest.Mock;

  beforeEach(() => {
    user = fakeUser();
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(user.authCode);
    jest.spyOn(userModel, 'generateAuthCodeExpirationDate').mockReturnValue(user.authCodeExpirationDate);
    createUserCallback = jest.fn();
    sendEmailWithVerificationCodeCallback = jest.fn();
    doesUserByEmailExistCallback = jest.fn(() => Promise.resolve(true));
    updateUserWithUpdateUserObjectCallback = jest.fn(() => Promise.resolve());
  });

  test('should login and send email with verification code when user first login', async () => {
    // Given
    doesUserByEmailExistCallback = jest.fn(() => Promise.resolve(false));

    // When
    await login(
      user.email,
      doesUserByEmailExistCallback,
      updateUserWithUpdateUserObjectCallback,
      createUserCallback,
      sendEmailWithVerificationCodeCallback,
    );

    // Then
    expect(doesUserByEmailExistCallback).toHaveBeenCalledWith(user.email);
    expect(updateUserWithUpdateUserObjectCallback).not.toHaveBeenCalled();
    expect(createUserCallback).toHaveBeenCalledWith(expect.objectContaining({ email: user.email, authCode: user.authCode }));
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalledWith(user.email, user.authCode);
  });

  test('should login and send email with verification code when user already exists', async () => {
    // Given
    // When
    await login(
      user.email,
      doesUserByEmailExistCallback,
      updateUserWithUpdateUserObjectCallback,
      createUserCallback,
      sendEmailWithVerificationCodeCallback,
    );

    // Then
    expect(doesUserByEmailExistCallback).toHaveBeenCalledWith(user.email);
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
    await expect(
      login(
        invalidEmail,
        doesUserByEmailExistCallback,
        updateUserWithUpdateUserObjectCallback,
        createUserCallback,
        sendEmailWithVerificationCodeCallback,
      ),
    ).rejects.toThrow('simple-passwordless-auth:INVALID_EMAIL_FORMAT');
  });

  test('should create user with additionnal fields', async () => {
    // Given
    const userAdditionnalFields = {
      name: 'John',
    };
    doesUserByEmailExistCallback = jest.fn(() => Promise.resolve(false));

    // When
    await login(
      user.email,
      doesUserByEmailExistCallback,
      updateUserWithUpdateUserObjectCallback,
      createUserCallback,
      sendEmailWithVerificationCodeCallback,
      { userAdditionnalFields: userAdditionnalFields as OnlyAdditionalFieldsUser<UserDao> },
    );

    // Then
    expect(doesUserByEmailExistCallback).toHaveBeenCalledWith(user.email);
    expect(updateUserWithUpdateUserObjectCallback).not.toHaveBeenCalled();
    expect(createUserCallback).toHaveBeenCalledWith(
      expect.objectContaining({ email: user.email, authCode: user.authCode, name: userAdditionnalFields.name }),
    );
    expect(sendEmailWithVerificationCodeCallback).toHaveBeenCalledWith(user.email, user.authCode);
  });
});
