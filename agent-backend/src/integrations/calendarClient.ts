// src/integrations/calendarClient.ts
import { google, calendar_v3 } from 'googleapis';
import { getAuthorizedClient } from '../services/googleAuthService';

export async function getCalendarClient(userId: string): Promise<calendar_v3.Calendar> {
  const auth = await getAuthorizedClient(userId);
  return google.calendar({ version: 'v3', auth });
}

export async function getBusyEvents(userId: string, timeMin: Date, timeMax: Date) {
  const calendar = await getCalendarClient(userId);

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: 'primary' }],
    },
  });

  const busy = res.data.calendars?.primary?.busy || [];
  return busy.map(b => ({
    start: new Date(b.start!),
    end: new Date(b.end!),
  }));
}


export async function createCalendarEvent(
  userId: string,
  event: { title: string; start: Date; end: Date; description?: string; attendeeEmails?: string[] }
) {
  const calendar = await getCalendarClient(userId);

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: event.title,
      description: event.description,
      start: { dateTime: event.start.toISOString() },
      end: { dateTime: event.end.toISOString() },
      attendees: event.attendeeEmails?.map(email => ({ email })),
    },
  });

  return res.data;
}