// src/services/calendarActionService.ts
import { prisma } from '../config/db';
import { createCalendarEvent } from '../integrations/calendarClient';
import { checkConflict } from './schedulingService';

export async function confirmProposedEvent(userId: string, eventId: string) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.userId !== userId) throw new Error('Unauthorized');

  if (event.status === 'confirmed') {
    throw new Error('This event has already been confirmed.');
  }
  if (event.status === 'cancelled') {
    throw new Error('This event was cancelled and cannot be confirmed.');
  }

  const { hasConflict } = await checkConflict(userId, event.startTime, event.endTime);
  if (hasConflict) {
    throw new Error('This slot now conflicts with another event. Please choose a different time.');
  }

  const googleEvent = await createCalendarEvent(userId, {
    title: event.title,
    start: event.startTime,
    end: event.endTime,
  });

  return prisma.calendarEvent.update({
    where: { id: eventId },
    data: { status: 'confirmed', googleEventId: googleEvent.id },
  });
}

export async function cancelProposedEvent(userId: string, eventId: string) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.userId !== userId) throw new Error('Unauthorized');

  return prisma.calendarEvent.update({
    where: { id: eventId },
    data: { status: 'cancelled' },
  });
}