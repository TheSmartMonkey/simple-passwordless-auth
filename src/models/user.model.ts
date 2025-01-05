export type UserDao = {
  _id: string;
  email: string;
  authCode: number;
  authCodeExpirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type PartialUserWithRequiredEmail = Partial<UserDao> & {
  email: UserDao['email'];
};
