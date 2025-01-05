import dotenv from 'dotenv';
import express from 'express';
import { getGoogleAuthUrl, handleGoogleCallback, initGoogleOAuth2Client } from 'simple-passwordless-auth';

dotenv.config();

const app = express();
const PORT = 3000;

app.get('/auth/google', (_req: any, res: any) => {
  const googleClient = initGoogleOAuth2Client(
    process.env.GOOGLE_CLIENT_ID ?? '',
    process.env.GOOGLE_CLIENT_SECRET ?? '',
    process.env.GOOGLE_REDIRECT_URL ?? '',
  );
  const googleAuthUrl = getGoogleAuthUrl(googleClient);
  res.redirect(googleAuthUrl);
});

app.get('/auth/google/callback', async (req: any, res: any) => {
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
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`);
  }
});

app.use((_req: any, res: any) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
