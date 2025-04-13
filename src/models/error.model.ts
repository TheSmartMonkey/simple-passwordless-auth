export class AuthError extends Error {
  constructor(message: Uppercase<string>) {
    super(message);
  }
}
