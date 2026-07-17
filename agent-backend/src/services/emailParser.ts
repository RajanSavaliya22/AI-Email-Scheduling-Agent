// src/services/emailParser.ts
import { gmail_v1 } from 'googleapis';
import libmime from 'libmime';

interface ParsedEmail {
  gmailId: string;
  threadId: string;
  sender: string;
  subject: string;
  bodyRaw: string;
  receivedAt: Date;
}

function decodeBase64(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

function extractBody(payload: gmail_v1.Schema$MessagePart): string {
  // Simple case: body directly on payload
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  // Multipart case: recurse through parts, prefer text/plain
  if (payload.parts) {
    const plainPart = payload.parts.find(p => p.mimeType === 'text/plain');
    if (plainPart?.body?.data) {
      return decodeBase64(plainPart.body.data);
    }

    const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
    if (htmlPart?.body?.data) {
      // crude HTML strip — swap for a proper library like `html-to-text` if needed
      return decodeBase64(htmlPart.body.data).replace(/<[^>]+>/g, ' ');
    }

    // Recurse into nested multiparts
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }

  return '';
}


function getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string): string {
  const raw = headers?.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
  return libmime.decodeWords(raw);
}

export function parseGmailMessage(message: gmail_v1.Schema$Message): ParsedEmail {
  const headers = message.payload?.headers;

  return {
    gmailId: message.id!,
    threadId: message.threadId!,
    sender: getHeader(headers, 'From'),
    subject: getHeader(headers, 'Subject'),
    bodyRaw: extractBody(message.payload!).trim(),
    receivedAt: new Date(Number(message.internalDate)),
  };
}