// src/services/preferenceService.ts
import { prisma } from '../config/db';

export async function getOrCreatePreferences(userId: string) {
  let prefs = await prisma.preference.findUnique({ where: { userId } });

  if (!prefs) {
    prefs = await prisma.preference.create({
      data: { userId }, // uses schema defaults
    });
  }

  return prefs;
}