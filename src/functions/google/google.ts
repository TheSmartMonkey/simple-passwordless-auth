import { throwError } from '@/libs/helpers';
import { OAuth2Client } from 'google-auth-library';

export function initGoogleOAuth2Client(googleClientId: string, googleClientSecret: string, googleRedirectUrl: string): OAuth2Client {
  return new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUrl);
}

export function getGoogleAuthUrl(googleClient: OAuth2Client): string {
  return googleClient.generateAuthUrl({
    scope: ['email'],
  });
}

export async function handleGoogleCallback(googleClient: OAuth2Client, code: string): Promise<{ email: string }> {
  try {
    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken(code);
    if (!tokens.id_token) {
      throwError('FAILED_TO_GET_GOOGLE_ID_TOKEN');
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClient?._clientId,
    });
    const payload = ticket.getPayload();
    if (!payload) throwError('FAILED_TO_GET_GOOGLE_ID_TOKEN_PAYLOAD');
    if (!payload.email) throwError('FAILED_TO_GET_GOOGLE_ID_TOKEN_PAYLOAD_EMAIL');

    return { email: payload.email };
  } catch (error) {
    throwError((error as Error).message);
  }
}
