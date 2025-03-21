import { uuid } from '@/common/helpers';
import { createUser } from '@/tests/db/queries';
import { InsertDbUser } from '@/tests/db/schemas';
import { fake } from './fake';

export function fakeDbUser(partialUser: Partial<InsertDbUser> = {}): InsertDbUser {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() + 1);
  return {
    _id: uuid(),
    email: fake.internet.email(),
    authCode: 123456,
    authCodeExpirationDate: expiredDate.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partialUser,
  };
}

export async function createFakeUser(): Promise<void> {
  const user = fakeDbUser();
  await createUser(user);
}
