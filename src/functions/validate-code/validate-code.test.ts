/**
 * @group unit
 */
import * as helpers from '@/libs/helpers';
import { UserDao } from '@/models/user.model';
import { fake, fakeAuthCode, fakeUser } from '@/tests/fake';
import { describe, expect, test } from '@jest/globals';
import { validateCode } from './validate-code';

describe('validateCode unit', () => {
  let user: UserDao;
  const authCode = fakeAuthCode();
  const email = fake.internet.email();
  let getUserByEmail: jest.Mock;
  const jwtTokenSecret = 'fakeJwtTokenSecret';

  beforeEach(() => {
    jest.spyOn(helpers, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
    user = fakeUser({ email, authCode });
    getUserByEmail = jest.fn(() => Promise.resolve(user));
  });

  test('should return a token when the auth code is valid', async () => {
    // Given
    // When
    const token = await validateCode(jwtTokenSecret, email, authCode, getUserByEmail);

    // Then
    expect(getUserByEmail).toHaveBeenCalledWith(email);
    expect(token).toBeDefined();
    expect(token).not.toEqual('');
  });

  test('should throw an error when the auth code is invalid', async () => {
    // Given
    const invalidAuthCode = 123456456;

    // When
    // Then
    await expect(validateCode(jwtTokenSecret, email, invalidAuthCode, getUserByEmail)).rejects.toThrow(
      'simple-passwordless-auth:WRONG_AUTH_CODE',
    );
    expect(getUserByEmail).toHaveBeenCalledWith(email);
  });

  test('should throw an error when the user does not exist', async () => {
    // Given
    getUserByEmail = jest.fn(() => Promise.resolve(undefined));

    // When
    // Then
    await expect(validateCode(jwtTokenSecret, email, authCode, getUserByEmail)).rejects.toThrow(
      'simple-passwordless-auth:USER_IS_NOT_REGISTERED',
    );
    expect(getUserByEmail).toHaveBeenCalledWith(email);
  });

  test('should throw an error when the auth code is expired', async () => {
    // Given
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);
    user.authCodeExpirationDate = expiredDate;

    // When
    await expect(validateCode(jwtTokenSecret, email, authCode, getUserByEmail)).rejects.toThrow(
      'simple-passwordless-auth:AUTH_CODE_EXPIRED',
    );
    expect(getUserByEmail).toHaveBeenCalledWith(email);
  });

  test('should throw an error when the email format is invalid', async () => {
    // Given
    const invalidEmail = 'invalid-email-format';

    // When
    // Then
    await expect(validateCode(jwtTokenSecret, invalidEmail, authCode, getUserByEmail)).rejects.toThrow(
      'simple-passwordless-auth:INVALID_EMAIL_FORMAT',
    );
  });

  test('should throw an error when the JWT token secret is missing', async () => {
    // Given
    const missingJwtTokenSecret = '';

    // When
    // Then
    await expect(validateCode(missingJwtTokenSecret, email, authCode, getUserByEmail)).rejects.toThrow(
      'simple-passwordless-auth:MISSING_JWT_TOKEN_SECRET',
    );
  });

  test('should return a token when the user is valid and auth code is not expired', async () => {
    // Given
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 1);
    user.authCodeExpirationDate = validDate;

    // When
    const token = await validateCode(jwtTokenSecret, email, authCode, getUserByEmail);

    // Then
    expect(getUserByEmail).toHaveBeenCalledWith(email);
    expect(token).toBeDefined();
    expect(token).not.toEqual('');
  });
});
