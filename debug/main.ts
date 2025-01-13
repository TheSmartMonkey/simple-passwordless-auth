import dotenv from 'dotenv';
import express from 'express';
import { getGoogleAuthUrl, handleGoogleCallback, initGoogleOAuth2Client, login, UserDao, validateCode } from 'simple-passwordless-auth';
const cors = require('cors');
dotenv.config();

const app = express();
const PORT = 3000;
app.use(cors());

app.use(express.json()); // Middleware to parse JSON bodies

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
    console.log({ userInfo });
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`);
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).send('Email is required');
      return;
    }

    let authCode: number | undefined;
    login(
      email,
      (user) => {
        console.log('getUserByEmailAndUpdateUserIfExist');
        authCode = user.authCode;
        console.log({ authCode });
        return Promise.resolve({} as UserDao);
      },
      () => {
        console.log('createUser');
        return Promise.resolve();
      },
      () => {
        console.log('sendEmailWithVerificationCode');
        return Promise.resolve();
      },
    );

    res.status(200).send('Login initiated, check your email for the verification code.');
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`);
  }
});

app.post('/auth/validate-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).send('Email and code are required');
      return;
    }

    const isValid = await validateCode(
      process.env.JWT_SECRET ?? '',
      email,
      code,
      () => {
        console.log('getUserByEmail');
        return Promise.resolve({} as UserDao);
      },
      {
        tokenExpiresIn: '1m',
      },
    );
    if (isValid) {
      res.status(200).send('Code validated successfully');
    } else {
      res.status(400).send('Invalid code');
    }
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
