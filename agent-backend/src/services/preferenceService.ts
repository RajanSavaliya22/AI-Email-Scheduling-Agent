// src/services/preferenceService.ts
import { prisma } from '../config/db';


export async function getOrCreatePreferences(userId: string) {
  let prefs = await prisma.preference.findUnique({
    where: { userId },
    include: { vipContacts: true },
  });

  if (!prefs) {
    prefs = await prisma.preference.create({
      data: { userId },
      include: { vipContacts: true },
    });
  }

  return prefs;
}

export async function updatePreferences(
  userId: string,
  updates: Partial<{
    workingHoursStart: number;
    workingHoursEnd: number;
    meetingBufferMins: number;
    defaultMeetingMins: number;
    timezone: string;
    tonePreference: string;
  }>
) {
  return prisma.preference.update({
    where: { userId },
    data: updates,
  });
}

export async function addVipContact(userId: string, email: string, label?: string) {
  const prefs = await getOrCreatePreferences(userId);
  return prisma.vipContact.create({
    data: { preferenceId: prefs.id, email, label },
  });
}

export async function removeVipContact(userId: string, email: string) {
  const prefs = await getOrCreatePreferences(userId);
  return prisma.vipContact.deleteMany({
    where: { preferenceId: prefs.id, email },
  });
}

export async function isVip(userId: string, senderEmail: string): Promise<boolean> {
  const prefs = await getOrCreatePreferences(userId);
  const senderLower = senderEmail.toLowerCase();
  return prefs.vipContacts.some(v => senderLower.includes(v.email.toLowerCase()));
}