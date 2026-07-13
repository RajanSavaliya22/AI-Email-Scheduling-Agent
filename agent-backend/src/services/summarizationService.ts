// src/services/summarizationService.ts
import { groq } from '../integrations/groqClient';

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

export async function summarizeEmail(email: {
  sender: string;
  subject: string;
  bodyRaw: string;
}): Promise<SummaryResult> {
  const userContent = `From: ${email.sender}
Subject: ${email.subject}
Body: ${email.bodyRaw.slice(0, 6000)}`; // truncate very long emails to control token usage

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    temperature: 0.3, // lower temp for more consistent structured output
    response_format: { type: 'json_object' }, // Groq supports forced JSON mode
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from Groq');

  try {
    return JSON.parse(raw) as SummaryResult;
  } catch (err) {
    throw new Error(`Failed to parse Groq JSON response: ${raw}`);
  }
}