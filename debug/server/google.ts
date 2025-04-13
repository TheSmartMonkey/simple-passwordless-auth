import { getGoogleAuthUrl, GoogleOAuth2Config, handleGoogleCallback, UpdateUserObject, UserDao } from 'simple-passwordless-auth';

export function googleAuthUrl(_req: any, res: any) {
  const googleConfig: GoogleOAuth2Config = {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirectUrl: process.env.GOOGLE_REDIRECT_URL ?? '',
  };
  const googleAuthUrl = getGoogleAuthUrl(googleConfig);
  res.redirect(googleAuthUrl);
}

export async function googleCallback(req: any, res: any) {
  try {
    const { code } = req.query;
    if (!code) {
      res.status(400).send('Missing authorization code');
      return;
    }

    const googleConfig: GoogleOAuth2Config = {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirectUrl: process.env.GOOGLE_REDIRECT_URL ?? '',
    };
    const token = await handleGoogleCallback(process.env.JWT_SECRET ?? '', googleConfig, code as string, {
      getUserByEmail: (email: string) => {
        console.log('getUserByEmail');
        console.log({ email });
        return Promise.resolve(undefined);
      },
      updateUserWithUpdateUserObject: (updateUserObject: UpdateUserObject) => {
        console.log('updateUserWithUpdateUserObject');
        console.log({ updateUserObject });
        return Promise.resolve();
      },
      createUser: (user: UserDao) => {
        console.log('createUser');
        console.log({ user });
        return Promise.resolve();
      },
    });
    console.log({ token });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`);
  }
}
