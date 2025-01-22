import { getGoogleAuthUrl, handleGoogleCallback } from 'simple-passwordless-auth';

import { initGoogleOAuth2Client } from 'simple-passwordless-auth';

export function googleAuthUrl(_req: any, res: any) {
  const googleClient = initGoogleOAuth2Client(
    process.env.GOOGLE_CLIENT_ID ?? '',
    process.env.GOOGLE_CLIENT_SECRET ?? '',
    process.env.GOOGLE_REDIRECT_URL ?? '',
  );
  const googleAuthUrl = getGoogleAuthUrl(googleClient);
  res.redirect(googleAuthUrl);
}

export async function googleCallback(req: any, res: any) {
  try {
    const googleClient = initGoogleOAuth2Client(
      process.env.GOOGLE_CLIENT_ID ?? '',
      process.env.GOOGLE_CLIENT_SECRET ?? '',
      process.env.GOOGLE_REDIRECT_URL ?? '',
    );
    const { code } = req.query;
    if (!code) {
      res.status(400).send('Missing authorization code');
      return;
    }

    const userInfo = await handleGoogleCallback(googleClient, code as string);
    console.log({ userInfo });
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`);
  }
}
