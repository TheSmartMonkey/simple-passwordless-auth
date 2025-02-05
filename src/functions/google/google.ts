import { throwError } from '@/common/helpers';
import { getTokenFromJwtTokenSecret } from '@/common/token';
import { createOrUpdateUser } from '@/core/user/create-or-update-user';
import { GoogleOAuth2Config } from '@/models/google.model';
import { UpdateUserObject, UserDao, UserToken } from '@/models/user.model';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

export function getGoogleAuthUrl(config: GoogleOAuth2Config): string {
  const googleClient = initGoogleOAuth2Client(config);
  return googleClient.generateAuthUrl({
    scope: ['email', 'profile'],
  });
}

export async function handleGoogleCallback(
  jwtTokenSecret: string,
  config: GoogleOAuth2Config,
  code: string,
  getUserByEmailCallback: (email: UserDao['email']) => Promise<UserDao | undefined>,
  updateUserWithUpdateUserObjectCallback: (updateUserObject: UpdateUserObject) => Promise<void>,
  createUserCallback: (user: UserDao) => Promise<void>,
  { tokenExpiresIn = '30d' }: { tokenExpiresIn?: string } = {},
): Promise<UserToken> {
  try {
    const googleClient = initGoogleOAuth2Client(config);
    const idToken = await getGoogleToken(googleClient, code);
    const payload = await verifyGoogleToken(googleClient, idToken);
    // TODO: How to know if user already logged in ? (get user by email)
    if (!payload?.email) throwError('FAILED_TO_GET_GOOGLE_EMAIL');

    const user = await createOrUpdateUser(
      payload.email,
      getUserByEmailCallback,
      updateUserWithUpdateUserObjectCallback,
      createUserCallback,
    );

    return getTokenFromJwtTokenSecret(user, jwtTokenSecret, { tokenExpiresIn });
  } catch (error) {
    throwError((error as Error).message);
  }
}

function initGoogleOAuth2Client(config: GoogleOAuth2Config): OAuth2Client {
  return new OAuth2Client(config.clientId, config.clientSecret, config.redirectUrl);
}

async function getGoogleToken(googleClient: OAuth2Client, googleAuthCode: string): Promise<string> {
  const { tokens } = await googleClient.getToken(googleAuthCode);
  const idToken = tokens?.id_token;
  if (!idToken) {
    throwError('FAILED_TO_GET_GOOGLE_ID_TOKEN');
  }
  return idToken;
}

async function verifyGoogleToken(googleClient: OAuth2Client, googleIdToken: string): Promise<TokenPayload> {
  const ticket = await googleClient.verifyIdToken({
    idToken: googleIdToken,
    audience: googleClient?._clientId,
  });
  const payload = ticket.getPayload();
  if (!payload) throwError('FAILED_TO_GET_GOOGLE_ID_TOKEN_PAYLOAD');
  if (!payload.email) throwError('FAILED_TO_GET_GOOGLE_ID_TOKEN_PAYLOAD_EMAIL');
  return payload;
}
