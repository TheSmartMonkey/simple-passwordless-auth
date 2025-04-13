import { CreateOrUpdateUserCallbacks } from './create-or-update-user';

export function createOrUpdateUserCallbacksMock(): jest.Mocked<CreateOrUpdateUserCallbacks> {
  return {
    getUserByEmail: jest.fn().mockImplementation(() => Promise.resolve()),
    updateUserWithUpdateUserObject: jest.fn().mockImplementation(() => Promise.resolve()),
    createUser: jest.fn().mockImplementation(() => Promise.resolve()),
  };
}
