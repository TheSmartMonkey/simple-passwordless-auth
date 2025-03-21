/**
 * @group integration
 */
import * as userModel from '@/models/user.model';
import { connectDb, disconnectDb } from '@/tests/db/connect';
import { createUser, deleteAllUsers } from '@/tests/db/queries';
import { fake, fakeAuthCode } from '@/tests/fakes/fake';
import { fakeGetUserByEmailCallback } from '@/tests/fakes/fake-callback';
import { validateCode } from './validate-code';

describe('validateCode integration', () => {
  const email = fake.internet.email();
  const authCode = fakeAuthCode();
  const jwtTokenSecret = 'test-jwt-token-secret';

  beforeAll(async () => {
    await connectDb();
  });

  beforeEach(async () => {
    jest.spyOn(userModel, 'generateEmailVerificationSixDigitCode').mockReturnValue(authCode);
    await deleteAllUsers();
  });

  afterAll(async () => {
    disconnectDb();
  });

  test('should return a JWT token when the user exists', async () => {
    // Given
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + 1);
    await createUser({
      email,
      authCode,
      authCodeExpirationDate: expiredDate.toISOString(),
    });

    // When
    const token = await validateCode(jwtTokenSecret, email, authCode, fakeGetUserByEmailCallback);

    // Then
    expect(token).toBeDefined();
  });

  test('should throw an error when the user does not exist', async () => {
    // Given
    // When
    // Then
    await expect(validateCode(jwtTokenSecret, email, authCode, fakeGetUserByEmailCallback)).rejects.toThrow(
      'simple-passwordless-auth:USER_IS_NOT_REGISTERED',
    );
  });
});
