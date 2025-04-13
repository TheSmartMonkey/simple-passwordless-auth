/**
 * @group unit
 */
import * as userModel from '@/models/user.model';
import { fake, fakeAuthCode } from '@/tests/fakes/fake';
import { getUserObject } from './get-user-object';

describe('get-user-object unit', () => {
  const email = fake.internet.email();
  const authCode = fakeAuthCode();

  beforeEach(() => {
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
  });

  test('should return a user object when only email is provided', () => {
    // Given
    // When
    const user = getUserObject(email);

    // Then
    expect(user.email).toEqual(email);
    expect(user.authCode).toEqual(authCode);
  });

  test('should return a user object and not regenerate authCode when authCode is provided', () => {
    // Given
    const authCode = fakeAuthCode();

    // When
    const user = getUserObject(email, { authCode });

    // Then
    expect(user.email).toEqual(email);
    expect(user.authCode).toEqual(authCode);
  });
});
