// src/services/schedulingService.ts
import { addMinutes, isBefore, isAfter, setHours, setMinutes, addDays, startOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { getBusyEvents } from '../integrations/calendarClient';
import { getOrCreatePreferences } from './preferenceService';

interface TimeSlot {
  start: Date;
  end: Date;
}

interface ProposeSlotsOptions {
  durationMins?: number;
  daysToSearch?: number; // how many days ahead to look
  maxSlotsToReturn?: number;
}

export async function proposeAvailableSlots(
  userId: string,
  options: ProposeSlotsOptions = {}
): Promise<TimeSlot[]> {
  const prefs = await getOrCreatePreferences(userId);
  const duration = options.durationMins || prefs.defaultMeetingMins;
  const daysToSearch = options.daysToSearch || 7;
  const maxSlots = options.maxSlotsToReturn || 3;
  const buffer = prefs.meetingBufferMins;
  const timezone = prefs.timezone;

  const now = new Date();
  const searchStart = now;
  const searchEnd = addDays(now, daysToSearch);

  // Fetch busy blocks for the whole search window in one call
  const busyBlocks = await getBusyEvents(userId, searchStart, searchEnd);

  const proposedSlots: TimeSlot[] = [];

  // Walk day by day
  for (let dayOffset = 0; dayOffset < daysToSearch && proposedSlots.length < maxSlots; dayOffset++) {
    const day = addDays(startOfDay(now), dayOffset);

    // Build working-hours window for this day, in the user's timezone
    const dayInTz = toZonedTime(day, timezone);
    let workStart = fromZonedTime(setMinutes(setHours(dayInTz, prefs.workingHoursStart), 0), timezone);
    let workEnd = fromZonedTime(setMinutes(setHours(dayInTz, prefs.workingHoursEnd), 0), timezone);

    // Skip if this working window is entirely in the past (e.g., today, but already past 5pm)
    if (isBefore(workEnd, now)) continue;
    // If today, don't propose times before "now"
    if (isBefore(workStart, now)) workStart = now;

    // Walk in duration+buffer increments through the working day
    let cursor = workStart;
    while (isBefore(addMinutes(cursor, duration), workEnd) && proposedSlots.length < maxSlots) {
      const candidateEnd = addMinutes(cursor, duration);

      const conflicts = busyBlocks.some(
        (b) => isBefore(cursor, b.end) && isAfter(candidateEnd, b.start)
      );

      if (!conflicts) {
        proposedSlots.push({ start: cursor, end: candidateEnd });
        cursor = addMinutes(candidateEnd, buffer); // skip past this slot + buffer
      } else {
        cursor = addMinutes(cursor, 15); // nudge forward and retry
      }
    }
  }

  return proposedSlots.slice(0, maxSlots);
}


export async function checkConflict(
  userId: string,
  proposedStart: Date,
  proposedEnd: Date
): Promise<{ hasConflict: boolean; conflictingEvents: TimeSlot[] }> {
  const busyBlocks = await getBusyEvents(userId, proposedStart, proposedEnd);

  const conflicts = busyBlocks.filter(
    (b) => isBefore(proposedStart, b.end) && isAfter(proposedEnd, b.start)
  );

  return {
    hasConflict: conflicts.length > 0,
    conflictingEvents: conflicts,
  };
}