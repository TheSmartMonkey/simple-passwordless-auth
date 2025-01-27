import { throwError } from '@/libs/helpers';
import { GoogleOAuth2Config } from '@/models/google.model';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

export function initGoogleOAuth2Client(config: GoogleOAuth2Config): OAuth2Client {
  return new OAuth2Client(config.clientId, config.clientSecret, config.redirectUrl);
}

export function getGoogleAuthUrl(config: GoogleOAuth2Config): string {
  const googleClient = initGoogleOAuth2Client(config);
  return googleClient.generateAuthUrl({
    scope: ['email', 'profile'],
  });
}

export async function handleGoogleCallback(config: GoogleOAuth2Config, code: string): Promise<TokenPayload> {
  try {
    const googleClient = initGoogleOAuth2Client(config);
    const idToken = await getGoogleToken(googleClient, code);
    const payload = await verifyGoogleToken(googleClient, idToken);
    return payload;
  } catch (error) {
    throwError((error as Error).message);
  }
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
