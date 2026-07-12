// src/services/googleAuthService.ts
import { google } from 'googleapis';
import { prisma } from '../config/db';

export async function getAuthorizedClient(userId: string) {
  const tokenRecord = await prisma.oAuthToken.findUnique({ where: { userId } });
  if (!tokenRecord) throw new Error('No token found for user');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: tokenRecord.accessToken,
    refresh_token: tokenRecord.refreshToken,
    expiry_date: Number(tokenRecord.expiryDate),
  });

  // googleapis auto-refreshes if expired, but we persist the new token
  oauth2Client.on('tokens', async (tokens) => {
    await prisma.oAuthToken.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token || tokenRecord.accessToken,
        expiryDate: BigInt(tokens.expiry_date || Date.now() + 3600 * 1000),
      },
    });
  });

  return oauth2Client;
}