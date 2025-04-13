import { AuthError } from '@/models/error.model';
import { randomUUID } from 'crypto';

export function uuid(): string {
  return randomUUID();
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw new AuthError('INVALID_EMAIL_FORMAT');
  }
}
