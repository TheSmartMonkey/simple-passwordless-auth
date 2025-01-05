export type UserDao = {
  _id: string;
  email: string;
  authCode: number;
  authCodeExpirationDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type GetUserByEmailAndUpdateUserIfExist = Partial<UserDao> & {
  email: UserDao['email'];
};

export type ValidateCodeDto = {
  email: string;
  code: string;
};
