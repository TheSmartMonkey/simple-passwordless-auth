/**
 * @group unit
 */
import { AuthError } from '@/models/error.model';
import { fake } from '@/tests/fakes/fake';
import { validateEmail } from './helpers';

describe('helpers unit', () => {
  describe('validateEmail', () => {
    test('should throw an error when the email format is invalid', async () => {
      // Given
      const email = 'invalid-email-format';

      // When
      // Then
      expect(() => validateEmail(email)).toThrow(new AuthError('INVALID_EMAIL_FORMAT'));
    });

    test('should not throw an error when the email format is valid', async () => {
      // Given
      const email = fake.internet.email();

      // When
      // Then
      expect(() => validateEmail(email)).not.toThrow();
    });

    test('should throw an error when the email is missing', async () => {
      // Given
      const email = '';

      // When
      // Then
      expect(() => validateEmail(email)).toThrow(new AuthError('INVALID_EMAIL_FORMAT'));
    });
  });
});
