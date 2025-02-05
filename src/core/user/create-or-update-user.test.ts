/**
 * @group unit
 */
import { fake, fakeUser } from '@/tests/fake';
import { createOrUpdateUser } from './create-or-update-user';

describe('createOrUpdateUser', () => {
  const email = fake.internet.email();
  let getUserByEmailCallbackMock: jest.Mock;
  let updateUserWithUpdateUserObjectCallbackMock: jest.Mock;
  let createUserCallbackMock: jest.Mock;

  beforeEach(() => {
    getUserByEmailCallbackMock = jest.fn();
    updateUserWithUpdateUserObjectCallbackMock = jest.fn();
    createUserCallbackMock = jest.fn();
  });

  describe('when user does not exist', () => {
    beforeEach(() => {
      getUserByEmailCallbackMock.mockResolvedValue(undefined);
    });

    test('should create new user without additional fields', async () => {
      // When
      await createOrUpdateUser(email, getUserByEmailCallbackMock, updateUserWithUpdateUserObjectCallbackMock, createUserCallbackMock);

      // Then
      expect(createUserCallbackMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          authCode: expect.any(Number),
        }),
      );
      expect(updateUserWithUpdateUserObjectCallbackMock).not.toHaveBeenCalled();
    });
  });

  describe('when user exists', () => {
    beforeEach(() => {
      getUserByEmailCallbackMock.mockResolvedValue(fakeUser());
    });

    test('should update user with only new verification code when no additional fields', async () => {
      // When
      await createOrUpdateUser(email, getUserByEmailCallbackMock, updateUserWithUpdateUserObjectCallbackMock, createUserCallbackMock);

      // Then
      expect(updateUserWithUpdateUserObjectCallbackMock).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          authCode: expect.any(Number),
        }),
      );
      expect(createUserCallbackMock).not.toHaveBeenCalled();
    });
  });

  test('should handle database errors gracefully', async () => {
    // Given
    getUserByEmailCallbackMock.mockRejectedValue(new Error('Database error'));

    // When/Then
    await expect(
      createOrUpdateUser(email, getUserByEmailCallbackMock, updateUserWithUpdateUserObjectCallbackMock, createUserCallbackMock),
    ).rejects.toThrow('Database error');
  });
});
