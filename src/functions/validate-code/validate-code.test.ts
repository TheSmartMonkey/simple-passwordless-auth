/**
 * @group unit
 */
import { addDaysToDate, getCurrentDate, getDateFromJwtToken } from '@/common/date';
import { AuthError } from '@/models/error.model';
import * as userModel from '@/models/user.model';
import { UserDao } from '@/models/user.model';
import { fake, fakeAuthCode, fakeUser } from '@/tests/fakes/fake';
import { decode, JwtPayload } from 'jsonwebtoken';
import { validateCode, ValidateCodeCallbacks } from './validate-code';

describe('validateCode unit', () => {
  let user: UserDao;
  const authCode = fakeAuthCode();
  const email = fake.internet.email();
  let getUserByEmailCallback: jest.Mock;
  let callbacks: ValidateCodeCallbacks;
  const jwtTokenSecret = 'fakeJwtTokenSecret';

  beforeEach(() => {
    user = fakeUser({ email, authCode });
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
    getUserByEmailCallback = jest.fn(() => Promise.resolve(user));
    callbacks = {
      getUserByEmail: getUserByEmailCallback,
    };
  });

  test('should return a token when the auth code is valid', async () => {
    // Given
    // When
    const token = await validateCode(jwtTokenSecret, email, authCode, callbacks);

    // Then
    expect(getUserByEmailCallback).toHaveBeenCalledWith(email);
    expect(token).toBeDefined();
    expect(token).not.toEqual('');
  });

  test('should throw an error when the auth code is invalid', async () => {
    // Given
    const invalidAuthCode = 123456456;

    // When
    // Then
    await expect(validateCode(jwtTokenSecret, email, invalidAuthCode, callbacks)).rejects.toThrow(new AuthError('WRONG_AUTH_CODE'));
    expect(getUserByEmailCallback).toHaveBeenCalledWith(email);
  });

  test('should throw an error when the user does not exist', async () => {
    // Given
    getUserByEmailCallback = jest.fn(() => Promise.resolve(undefined));
    callbacks.getUserByEmail = getUserByEmailCallback;

    // When
    // Then
    await expect(validateCode(jwtTokenSecret, email, authCode, callbacks)).rejects.toThrow(new AuthError('USER_IS_NOT_REGISTERED'));
    expect(getUserByEmailCallback).toHaveBeenCalledWith(email);
  });

  test('should throw an error when the auth code is expired', async () => {
    // Given
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);
    user.authCodeExpirationDate = expiredDate;

    // When
    await expect(validateCode(jwtTokenSecret, email, authCode, callbacks)).rejects.toThrow(new AuthError('AUTH_CODE_EXPIRED'));
    expect(getUserByEmailCallback).toHaveBeenCalledWith(email);
  });

  test('should throw an error when the email format is invalid', async () => {
    // Given
    const invalidEmail = 'invalid-email-format';

    // When
    // Then
    await expect(validateCode(jwtTokenSecret, invalidEmail, authCode, callbacks)).rejects.toThrow(new AuthError('INVALID_EMAIL_FORMAT'));
  });

  test('should throw an error when the JWT token secret is missing', async () => {
    // Given
    const missingJwtTokenSecret = '';

    // When
    // Then
    await expect(validateCode(missingJwtTokenSecret, email, authCode, callbacks)).rejects.toThrow(
      new AuthError('MISSING_JWT_TOKEN_SECRET'),
    );
  });

  test('should return a token when the user is valid and auth code is not expired', async () => {
    // Given
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 1);
    user.authCodeExpirationDate = validDate;

    // When
    const token = await validateCode(jwtTokenSecret, email, authCode, callbacks);

    // Then
    expect(getUserByEmailCallback).toHaveBeenCalledWith(email);
    expect(token).toBeDefined();
    expect(token).not.toEqual('');
  });

  test('should return a token with expiration date of 30 days', async () => {
    // Given
    // When
    const token = await validateCode(jwtTokenSecret, email, authCode, callbacks);
    const decodedToken: JwtPayload = decode(token) as JwtPayload;
    const tokenExpirationDate = getDateFromJwtToken(decodedToken);
    const expectedExpirationDate = addDaysToDate(getCurrentDate(), 30);

    // Then
    expect(token).toBeDefined();
    expect(token).not.toEqual('');
    expect(tokenExpirationDate).toBeDefined();
    expect(tokenExpirationDate.getFullYear()).toEqual(expectedExpirationDate.getFullYear());
    expect(tokenExpirationDate.getMonth()).toEqual(expectedExpirationDate.getMonth());
    expect(tokenExpirationDate.getDate()).toEqual(expectedExpirationDate.getDate());
  });
});
