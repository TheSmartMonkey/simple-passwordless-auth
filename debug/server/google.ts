import { getGoogleAuthUrl, handleGoogleCallback } from 'simple-passwordless-auth';

import { GoogleOAuth2Config } from 'simple-passwordless-auth/models/google.model';

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
    const userInfo = await handleGoogleCallback(googleConfig, code as string);
    console.log({ userInfo });
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`);
  }
}
