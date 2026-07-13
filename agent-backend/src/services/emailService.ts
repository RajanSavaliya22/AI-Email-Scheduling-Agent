// Example usage: src/services/emailService.ts
import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export async function getUnprocessedEmails(userId: string) {
  return prisma.email.findMany({
    where: { userId, status: 'unread' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function saveParsedEmail(userId: string, parsed: {
  gmailId: string;
  threadId: string;
  sender: string;
  subject: string;
  bodyRaw: string;
  receivedAt: Date;
}) {
  try {
    return await prisma.email.create({
      data: {
        userId,
        ...parsed,
      },
    });
  } catch (err) {
    // P2002 = unique constraint violation → email already ingested, skip silently
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return null;
    }
    throw err;
  }
}