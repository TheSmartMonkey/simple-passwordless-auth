export class AuthError extends Error {
  constructor(message: Uppercase<string>) {
    super(message);
    this.message = message + '_AUTH_ERROR';
  }
}
