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
    throwError('INVALID_EMAIL_FORMAT');
  }
}

export function throwError(message: string): never {
  throw new Error('simple-passwordless-auth:' + message);
}
