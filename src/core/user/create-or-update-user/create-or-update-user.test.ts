/**
 * @group unit
 */
import { AuthError } from '@/models/error.model';
import { fake, fakeUser } from '@/tests/fakes/fake';
import { createOrUpdateUser, CreateOrUpdateUserCallbacks } from './create-or-update-user';
import { createOrUpdateUserCallbacksMock } from './create-or-update-user.mock';

describe('createOrUpdateUser unit', () => {
  const email = fake.internet.email();
  let callbacks: jest.Mocked<CreateOrUpdateUserCallbacks>;

  beforeEach(() => {
    callbacks = createOrUpdateUserCallbacksMock();
  });

  describe('when user does not exist', () => {
    beforeEach(() => {
      callbacks.getUserByEmail.mockResolvedValue(undefined);
    });

    test('should create new user', async () => {
      // Given
      // When
      const result = await createOrUpdateUser(email, callbacks);

      // Then
      expect(callbacks.createUser).toHaveBeenCalledWith(
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
      expect(callbacks.updateUserWithUpdateUserObject).not.toHaveBeenCalled();
    });

    test('should create user with valid 6-digit auth code', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      const createdUser = callbacks.createUser.mock.calls[0][0];
      expect(createdUser.authCode.toString()).toMatch(/^\d{6}$/);
    });

    test('should set auth code expiration date for new user', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      const createdUser = callbacks.createUser.mock.calls[0][0];
      expect(createdUser.authCodeExpirationDate).toBeInstanceOf(Date);
      expect(createdUser.authCodeExpirationDate.getTime()).toBeGreaterThan(Date.now());
    });

    test('should handle database error during user creation', async () => {
      // Given
      const dbError = new AuthError('DATABASE_ERROR');
      callbacks.createUser.mockRejectedValue(dbError);

      // When
      // Then
      await expect(createOrUpdateUser(email, callbacks)).rejects.toThrow(dbError);
    });
  });

  describe('when user exists', () => {
    const existingUser = fakeUser();

    beforeEach(() => {
      callbacks.getUserByEmail.mockResolvedValue(existingUser);
    });

    test('should update user with only new verification code', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      expect(callbacks.updateUserWithUpdateUserObject).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          authCode: expect.any(Number),
        }),
      );
      expect(callbacks.createUser).not.toHaveBeenCalled();
    });

    test('should update with valid 6-digit auth code', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      const updateObject = callbacks.updateUserWithUpdateUserObject.mock.calls[0][0];
      expect(updateObject.authCode.toString()).toMatch(/^\d{6}$/);
    });

    test('should update auth code expiration date', async () => {
      // Given
      // When
      await createOrUpdateUser(email, callbacks);

      // Then
      const updateObject = callbacks.updateUserWithUpdateUserObject.mock.calls[0][0];
      expect(updateObject.authCodeExpirationDate).toBeInstanceOf(Date);
      expect(updateObject.authCodeExpirationDate.getTime()).toBeGreaterThan(Date.now());
    });

    test('should handle database error during user update', async () => {
      // Given
      const dbError = new AuthError('DATABASE_ERROR');
      callbacks.updateUserWithUpdateUserObject.mockRejectedValue(dbError);

      // When
      // Then
      await expect(createOrUpdateUser(email, callbacks)).rejects.toThrow(dbError);
    });
  });

  test('should handle database errors gracefully', async () => {
    // Given
    const authError = new AuthError('DATABASE_ERROR');
    callbacks.getUserByEmail.mockRejectedValue(authError);

    // When
    // Then
    await expect(createOrUpdateUser(email, callbacks)).rejects.toThrow(authError);
  });
});
