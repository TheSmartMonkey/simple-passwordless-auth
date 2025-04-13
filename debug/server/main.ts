import dotenv from 'dotenv';
import express from 'express';
import { login, UpdateUserObject, UserDao, validateCode } from 'simple-passwordless-auth';
import { fakeUser } from '../../src/tests/fakes/fake';
import { googleAuthUrl, googleCallback } from './google';
const cors = require('cors');

// Config
dotenv.config();
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// Google Auth
app.get('/auth/google', googleAuthUrl);
app.get('/auth/google/callback', googleCallback);

// Passwordless Auth
app.post('/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).send('Email is required');
      return;
    }

    let authCode: number | undefined;
    login(email, {
      getUserByEmail: (email: string) => {
        console.log('doesUserByEmailExist');
        console.log({ email });
        return Promise.resolve(undefined);
      },
      updateUserWithUpdateUserObject: (updateUserObject: UpdateUserObject) => {
        console.log('updateUserWithUpdateUserObject');
        authCode = updateUserObject.authCode;
        console.log({ authCode });
        return Promise.resolve();
      },
      createUser: (user: UserDao) => {
        console.log('createUser');
        console.log({ user });
        return Promise.resolve();
      },
      sendEmailWithVerificationCode: () => {
        console.log('sendEmailWithVerificationCode');
        return Promise.resolve();
      },
    });

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
      {
        getUserByEmail: (email: string) => {
          console.log('getUserByEmail');
          return Promise.resolve(fakeUser({ email, authCode: code }));
        },
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
