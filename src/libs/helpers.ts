import { randomInt, randomUUID } from 'crypto';

export function generateEmailVerificationSixDigitCode(): number {
  return randomInt(100000, 999999);
}

export function uuid(): string {
  return randomUUID();
}

export function getCurrentDate(): Date {
  return new Date();
}

export function addHoursToCurrentDate(date: Date, hours = 1): Date {
  date.setHours(date.getHours() + hours);
  return date;
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
