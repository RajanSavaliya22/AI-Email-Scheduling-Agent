// src/types/preferences.ts
export type TonePreference = 'professional' | 'casual' | 'concise';

export const isValidTone = (value: string): value is TonePreference =>
  ['professional', 'casual', 'concise'].includes(value);