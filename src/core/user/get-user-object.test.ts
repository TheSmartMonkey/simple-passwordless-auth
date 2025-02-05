/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @group unit
 */
import * as userModel from '@/models/user.model';
import { fake, fakeAuthCode } from '@/tests/fake';
import { getUserObject } from './get-user-object';

describe('get-user-object unit', () => {
  const email = fake.internet.email();
  const authCode = fakeAuthCode();

  beforeEach(() => {
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
  });

  test('should return a user object when no userAdditionnalFields are provided', () => {
    // Given
    // When
    const user = getUserObject(email);

    // Then
    expect(user.email).toEqual(email);
    expect(user.authCode).toEqual(authCode);
  });

  test('should return a user object when userAdditionnalFields are provided', () => {
    // Given
    const userAdditionnalFields = { firstname: fake.person.firstName(), lastname: fake.person.lastName() };

    // When
    const user = getUserObject(email, { userAdditionnalFields });

    // Then
    expect(user.email).toEqual(email);
    expect(user.authCode).toEqual(authCode);
    expect(user.firstname).toEqual(userAdditionnalFields.firstname);
    expect(user.lastname).toEqual(userAdditionnalFields.lastname);
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
