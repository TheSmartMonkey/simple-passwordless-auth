import { UserDao } from '@/models/user.model';
import { ValidateCodeCallbacks } from './validate-code';

export function validateCodeCallbacksMock(user: UserDao): jest.Mocked<ValidateCodeCallbacks> {
  return {
    getUserByEmail: jest.fn().mockImplementation(() => Promise.resolve(user)),
  };
}
