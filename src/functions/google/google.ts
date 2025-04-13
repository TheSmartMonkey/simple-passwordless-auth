import { getTokenFromJwtTokenSecret } from '@/common/token';
import { createOrUpdateUser } from '@/core/user/create-or-update-user/create-or-update-user';
import { AuthError } from '@/models/error.model';
import { GoogleOAuth2Config } from '@/models/google.model';
import { TokenExpiration, UserToken } from '@/models/token.model';
import { UpdateUserObject, UserDao } from '@/models/user.model';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

export interface HandleGoogleCallbackCallbacks {
  getUserByEmail: (email: string) => Promise<UserDao | undefined>;
  updateUserWithUpdateUserObject: (updateUserObject: UpdateUserObject) => Promise<void>;
  createUser: (user: UserDao) => Promise<void>;
}

export type HandleGoogleCallbackConfig = {
  tokenExpiresIn?: TokenExpiration;
};

/**
 * Get Google auth url
 * @param config Google OAuth2 config
 * @returns Google auth url
 */
export function getGoogleAuthUrl(config: GoogleOAuth2Config): string {
  const googleClient = initGoogleOAuth2Client(config);
  return googleClient.generateAuthUrl({
    scope: ['email', 'profile'],
  });
}

/**
 * Handle Google callback
 * @param jwtTokenSecret JWT token secret
 * @param googleConfig Google OAuth2 config
 * @param code Google auth code
 * @param callbacks Custom callbacks to get user by email, update user with update user object and create user
 * @param tokenExpiresIn Token expires in
 * @returns User token string
 */
export async function handleGoogleCallback(
  jwtTokenSecret: string,
  googleConfig: GoogleOAuth2Config,
  code: string,
  callbacks: HandleGoogleCallbackCallbacks,
  config: HandleGoogleCallbackConfig = {},
): Promise<UserToken> {
  try {
    const googleClient = initGoogleOAuth2Client(googleConfig);
    const idToken = await getGoogleToken(googleClient, code);
    const payload = await verifyGoogleToken(googleClient, idToken);
    // TODO: How to know if user already logged in ? (get user by email)
    if (!payload?.email) throw new AuthError('FAILED_TO_GET_GOOGLE_EMAIL');

    const user = await createOrUpdateUser(payload.email, callbacks);

    return getTokenFromJwtTokenSecret(user, jwtTokenSecret, { tokenExpiresIn: config.tokenExpiresIn });
  } catch (error) {
    throw new AuthError((error as Error).message as Uppercase<string>);
  }
}

function initGoogleOAuth2Client(config: GoogleOAuth2Config): OAuth2Client {
  return new OAuth2Client(config.clientId, config.clientSecret, config.redirectUrl);
}

async function getGoogleToken(googleClient: OAuth2Client, googleAuthCode: string): Promise<string> {
  const { tokens } = await googleClient.getToken(googleAuthCode);
  const idToken = tokens?.id_token;
  if (!idToken) {
    throw new AuthError('FAILED_TO_GET_GOOGLE_ID_TOKEN');
  }
  return idToken;
}

async function verifyGoogleToken(googleClient: OAuth2Client, googleIdToken: string): Promise<TokenPayload> {
  const ticket = await googleClient.verifyIdToken({
    idToken: googleIdToken,
    audience: googleClient?._clientId,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new AuthError('FAILED_TO_GET_GOOGLE_ID_TOKEN_PAYLOAD');
  if (!payload.email) throw new AuthError('FAILED_TO_GET_GOOGLE_ID_TOKEN_PAYLOAD_EMAIL');
  return payload;
}
