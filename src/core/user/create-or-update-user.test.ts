/**
 * @group unit
 */
import { AuthError } from '@/models/error.model';
import { fake, fakeUser } from '@/tests/fakes/fake';
import { createOrUpdateUser, CreateOrUpdateUserCallbacks } from './create-or-update-user';

describe('createOrUpdateUser', () => {
  const email = fake.internet.email();
  let getUserByEmailCallbackMock: jest.Mock;
  let updateUserWithUpdateUserObjectCallbackMock: jest.Mock;
  let createUserCallbackMock: jest.Mock;
  let callbacks: CreateOrUpdateUserCallbacks;

  beforeEach(() => {
    getUserByEmailCallbackMock = jest.fn();
    updateUserWithUpdateUserObjectCallbackMock = jest.fn();
    createUserCallbackMock = jest.fn();
    callbacks = {
      getUserByEmail: getUserByEmailCallbackMock,
      updateUserWithUpdateUserObject: updateUserWithUpdateUserObjectCallbackMock,
      createUser: createUserCallbackMock,
    };
  });

  describe('when user does not exist', () => {
    beforeEach(() => {
      getUserByEmailCallbackMock.mockResolvedValue(undefined);
    });

    test('should create new user', async () => {
      // Given
      // When
      const result = await createOrUpdateUser(email, callbacks);

      // Then
      expect(createUserCallbackMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          authCode: expect.any(Number),
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          email,
          authCode: expect.any(Number),
        }),
      );
      expect(updateUserWithUpdateUserObjectCallbackMock).not.toHaveBeenCalled();
    });

    test('should create user with valid 6-digit auth code', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      const createdUser = createUserCallbackMock.mock.calls[0][0];
      expect(createdUser.authCode.toString()).toMatch(/^\d{6}$/);
    });

    test('should set auth code expiration date for new user', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      const createdUser = createUserCallbackMock.mock.calls[0][0];
      expect(createdUser.authCodeExpirationDate).toBeInstanceOf(Date);
      expect(createdUser.authCodeExpirationDate.getTime()).toBeGreaterThan(Date.now());
    });

    test('should handle database error during user creation', async () => {
      // Given
      const dbError = new AuthError('DATABASE_ERROR');
      createUserCallbackMock.mockRejectedValue(dbError);

      // When
      // Then
      await expect(createOrUpdateUser(email, callbacks)).rejects.toThrow(dbError);
    });
  });

  describe('when user exists', () => {
    const existingUser = fakeUser();

    beforeEach(() => {
      getUserByEmailCallbackMock.mockResolvedValue(existingUser);
    });

    test('should update user with only new verification code', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      expect(updateUserWithUpdateUserObjectCallbackMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          authCode: expect.any(Number),
        }),
      );
      expect(createUserCallbackMock).not.toHaveBeenCalled();
    });

    test('should update with valid 6-digit auth code', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      const updateObject = updateUserWithUpdateUserObjectCallbackMock.mock.calls[0][0];
      expect(updateObject.authCode.toString()).toMatch(/^\d{6}$/);
    });

    test('should update auth code expiration date', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      const updateObject = updateUserWithUpdateUserObjectCallbackMock.mock.calls[0][0];
      expect(updateObject.authCodeExpirationDate).toBeInstanceOf(Date);
      expect(updateObject.authCodeExpirationDate.getTime()).toBeGreaterThan(Date.now());
    });

    test('should handle database error during user update', async () => {
      // Given
      const dbError = new AuthError('DATABASE_ERROR');
      updateUserWithUpdateUserObjectCallbackMock.mockRejectedValue(dbError);

      // When
      // Then
      await expect(createOrUpdateUser(email, callbacks)).rejects.toThrow(dbError);
    });
  });

  test('should handle database errors gracefully', async () => {
    // Given
    const authError = new AuthError('DATABASE_ERROR');
    getUserByEmailCallbackMock.mockRejectedValue(authError);

    // When
    // Then
    await expect(createOrUpdateUser(email, callbacks)).rejects.toThrow(authError);
  });
});
