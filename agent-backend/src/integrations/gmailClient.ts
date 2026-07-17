// src/integrations/gmailClient.ts
import { google, gmail_v1 } from 'googleapis';
import { getAuthorizedClient } from '../services/googleAuthService';

export async function getGmailClient(userId: string): Promise<gmail_v1.Gmail> {
  const auth = await getAuthorizedClient(userId);
  return google.gmail({ version: 'v1', auth });
}

export async function fetchRecentMessages(userId: string, maxResults = 20) {
  const gmail = await getGmailClient(userId);

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'in:inbox -from:me -subject:"[AgentNotification]"',
  });
  const messages = listRes.data.messages || [];

  const fullMessages = await Promise.all(
    messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });
      return full.data;
    })
  );

  return fullMessages;
}