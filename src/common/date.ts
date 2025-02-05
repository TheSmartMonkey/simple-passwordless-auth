import { JwtPayload } from 'jsonwebtoken';
import { throwError } from './helpers';

export function getCurrentDate(): Date {
  return new Date();
}

export function addDaysToDate(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function getDateFromJwtToken(token: JwtPayload): Date {
  if (!token?.exp) throwError('MISSING_JWT_TOKEN_EXPIRATION_DATE');
  return new Date(token?.exp * 1000);
}

export function addHoursToCurrentDate(date: Date, hours = 1): Date {
  date.setHours(date.getHours() + hours);
  return date;
}
