// src/services/calendarEventService.ts
import { prisma } from '../config/db';

export async function saveProposedEvent(userId: string, title: string, start: Date, end: Date) {
  return prisma.calendarEvent.create({
    data: { userId, title, startTime: start, endTime: end, status: 'proposed' },
  });
}

export async function confirmEvent(eventId: string) {
  return prisma.calendarEvent.update({
    where: { id: eventId },
    data: { status: 'confirmed' },
  });
}