# simple-passwordless-auth

A lightweight and simple library for passwordless authentication. Built to help you get things done quickly and securely

![code-example](https://github.com/TheSmartMonkey/simple-passwordless-auth/blob/main/debug/code-example.png)

## Installation

```sh
npm i simple-passwordless-auth
```

## Features

- [x] Google OAuth2
- [x] Passwordless authentication with a Drizzle ORM integration (you can also use your own database / ORM)

## Simple examples

### Passwordless authentication

```ts
import { login, validateCode } from 'simple-passwordless-auth';

// Login with email
let authCode;
await login(
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
    )

// Validate the auth code
const isValid = await validateCode(
      process.env.JWT_SECRET ?? '',
      email,
      authCode,
      () => {
        console.log('getUserByEmail');
        return Promise.resolve({} as UserDao);
      },
    );
```

### Google OAuth2

```ts
import { initGoogleOAuth2Client } from 'simple-passwordless-auth';

const googleClient = initGoogleOAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL);

// Redirect user to googleAuthUrl
const googleAuthUrl = getGoogleAuthUrl(googleClient);

// Handle the callback in a separate route
const userInfo = await handleGoogleCallback(googleClient, code);
```

#### Setup Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google OAuth2 API
4. Init a new OAuth consent screen
5. Create credentials for OAuth2 client ID and secret (copy the client ID and secret to `initGoogleOAuth2Client()`)
6. Set the redirect URL (example: `http://localhost:3000/auth/google/callback`)

## Rich example

See [debug/main.ts](debug/main.ts) for a complete example

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information
