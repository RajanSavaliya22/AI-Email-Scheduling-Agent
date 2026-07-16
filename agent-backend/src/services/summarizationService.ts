// src/services/summarizationService.ts
import { groq } from '../integrations/groqClient';
import { isVip } from './preferenceService';
import { getOrCreatePreferences } from './preferenceService';
import { TonePreference } from '../types/preferences';

interface SummaryResult {
  summary: string;
  priority: 'urgent' | 'normal' | 'low';
  actionItems: string[];
  suggestedReplyDraft: string | null;
}

const SYSTEM_PROMPT = `You are an email triage assistant. Given an email's sender, subject, and body, respond with ONLY a valid JSON object (no markdown, no preamble, no code fences) matching this exact structure:

{
  "summary": "2-3 sentence summary of the email's content",
  "priority": "urgent" | "normal" | "low",
  "actionItems": ["short action item 1", "short action item 2"],
  "suggestedReplyDraft": "a short draft reply if the email needs a response, or null if no reply is needed"
}

Rules:
- priority is "urgent" only if there's a clear deadline, escalation, or time-sensitive request
- actionItems should be empty array if no actions are needed
- Keep summary concise and factual, no speculation
- suggestedReplyDraft should be null for newsletters, notifications, or no-reply-needed emails`;

export async function summarizeEmail(
  userId: string,
  email: { sender: string; subject: string; bodyRaw: string }
): Promise<SummaryResult> {
  const prefs = await getOrCreatePreferences(userId);
  const senderIsVip = await isVip(userId, email.sender);

  const toneMap: Record<TonePreference, string> = {
    professional: 'Keep the suggested reply polished and professional.',
    casual: 'Keep the suggested reply warm and conversational.',
    concise: 'Keep the suggested reply extremely brief — 1-2 sentences max.',
  };

  // Cast, since Prisma's `tonePreference` field is just `string` at the DB level
  const tone = (prefs.tonePreference as TonePreference) in toneMap
    ? (prefs.tonePreference as TonePreference)
    : 'professional';

  const toneInstruction = toneMap[tone];

  const systemPrompt = `You are an email triage assistant. Given an email's sender, subject, and body, respond with ONLY a valid JSON object (no markdown, no preamble, no code fences) matching this exact structure:

{
  "summary": "2-3 sentence summary of the email's content",
  "priority": "urgent" | "normal" | "low",
  "actionItems": ["short action item 1", "short action item 2"],
  "suggestedReplyDraft": "a short draft reply if the email needs a response, or null if no reply is needed"
}

Rules:
- priority is "urgent" only if there's a clear deadline, escalation, or time-sensitive request
- ${senderIsVip ? 'This sender is marked as a VIP contact — treat requests from them with elevated priority unless clearly non-urgent (e.g. FYI-only).' : ''}
- actionItems should be empty array if no actions are needed
- Keep summary concise and factual, no speculation
- suggestedReplyDraft should be null for newsletters, notifications, or no-reply-needed emails
- ${toneInstruction}`;

  const userContent = `From: ${email.sender}\nSubject: ${email.subject}\nBody: ${email.bodyRaw.slice(0, 6000)}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from Groq');

  try {
    return JSON.parse(raw) as SummaryResult;
  } catch (err) {
    throw new Error(`Failed to parse Groq JSON response: ${raw}`);
  }
}