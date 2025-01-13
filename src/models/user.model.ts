export type UserDao = {
  _id: string;
  email: string;
  authCode: number;
  authCodeExpirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type PartialUserWithRequiredEmail<TUser extends UserDao> = Partial<TUser> & {
  email: UserDao['email'];
};

// TODO: Handle custom fields
export type OnlyAdditionnalFieldsUser<TUser extends UserDao> = Omit<
  TUser,
  '_id' | 'email' | 'authCode' | 'authCodeExpirationDate' | 'createdAt' | 'updatedAt'
>;
