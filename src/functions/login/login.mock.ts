import { UserDao } from '@/models/user.model';
import { LoginCallbacks } from './login';

export function loginCallbacksMock(user: UserDao): jest.Mocked<LoginCallbacks> {
  return {
    getUserByEmail: jest.fn().mockImplementation(() => Promise.resolve(user)),
    updateUserWithUpdateUserObject: jest.fn().mockImplementation(() => Promise.resolve()),
    createUser: jest.fn().mockImplementation(() => Promise.resolve()),
    sendEmailWithVerificationCode: jest.fn().mockImplementation(() => Promise.resolve()),
  };
}
