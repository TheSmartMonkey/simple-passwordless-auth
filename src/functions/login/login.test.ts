/**
 * @group unit
 */
import { AuthError } from '@/models/error.model';
import * as userModel from '@/models/user.model';
import { UserDao } from '@/models/user.model';
import { fakeUser } from '@/tests/fakes/fake';
import { LoginCallbacks, login } from './login';
import { loginCallbacksMock } from './login.mock';

describe('login unit', () => {
  let user: UserDao;
  let callbacks: jest.Mocked<LoginCallbacks>;

  beforeEach(() => {
    user = fakeUser();
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(user.authCode);
    jest.spyOn(userModel, 'generateAuthCodeExpirationDate').mockReturnValue(user.authCodeExpirationDate);
    callbacks = loginCallbacksMock(user);
  });

  test('should login and send email with verification code when user first login', async () => {
    // Given
    callbacks.getUserByEmail = jest.fn().mockImplementation(() => Promise.resolve(undefined));

    // When
    await login(user.email, callbacks);

    // Then
    expect(callbacks.getUserByEmail).toHaveBeenCalledWith(user.email);
    expect(callbacks.updateUserWithUpdateUserObject).not.toHaveBeenCalled();
    expect(callbacks.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: user.email, authCode: user.authCode }));
    expect(callbacks.sendEmailWithVerificationCode).toHaveBeenCalledWith(user.email, user.authCode);
  });

  test('should login and send email with verification code when user already exists', async () => {
    // Given
    // When
    await login(user.email, callbacks);

    // Then
    expect(callbacks.getUserByEmail).toHaveBeenCalledWith(user.email);
    expect(callbacks.updateUserWithUpdateUserObject).toHaveBeenCalledWith(
      expect.objectContaining({ email: user.email, authCode: user.authCode, authCodeExpirationDate: user.authCodeExpirationDate }),
    );
    expect(callbacks.createUser).not.toHaveBeenCalled();
    expect(callbacks.sendEmailWithVerificationCode).toHaveBeenCalledWith(user.email, user.authCode);
  });

  test('should throw error when invalid email format', async () => {
    // Given
    const invalidEmail = 'invalid-email-format';

    // When
    // Then
    await expect(login(invalidEmail, callbacks)).rejects.toThrow(new AuthError('INVALID_EMAIL_FORMAT'));
  });
});
