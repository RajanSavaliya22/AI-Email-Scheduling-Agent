// src/scripts/testSummarization.ts
import dotenv from 'dotenv';
dotenv.config();

import { summarizeEmail } from '../services/summarizationService';

// Edit these test cases freely to probe different scenarios
const testEmails = [
  {
    label: 'Urgent client escalation',
    sender: 'angry.client@example.com',
    subject: 'URGENT: Production is down, need response by 3pm today',
    bodyRaw: `Hi team,

Our production environment has been down for the last 2 hours and we're losing revenue every minute. I need someone to respond by 3pm today with a fix or a clear timeline, or we'll need to escalate this to your management.

This is the third time this month. Please advise immediately.

Regards,
David`,
  },
  {
    label: 'Routine newsletter',
    sender: 'newsletter@techblog.com',
    subject: 'Your Weekly Tech Digest',
    bodyRaw: `Here are this week's top stories in tech: AI advancements continue, new frameworks released, and more. Click here to read the full digest. Unsubscribe anytime.`,
  },
  {
    label: 'Ambiguous casual email',
    sender: 'colleague@company.com',
    subject: 'quick thing',
    bodyRaw: `hey, did you get a chance to look at that doc I sent last week? no rush just checking in. also are we still on for lunch thursday?`,
  },
  {
    label: 'Meeting request with deadline',
    sender: 'manager@company.com',
    subject: 'Need your input on Q3 budget by Friday',
    bodyRaw: `Hi, can you review the attached Q3 budget proposal and send me your feedback by end of day Friday? We're finalizing numbers for the board meeting next Monday. Let me know if you want to hop on a call to discuss instead.`,
  },
];

async function runTests() {
  for (const testCase of testEmails) {
    console.log('\n' + '='.repeat(60));
    console.log(`TEST CASE: ${testCase.label}`);
    console.log('='.repeat(60));

    try {
      const result = await summarizeEmail({
        sender: testCase.sender,
        subject: testCase.subject,
        bodyRaw: testCase.bodyRaw,
      });

      console.log('Summary:', result.summary);
      console.log('Priority:', result.priority);
      console.log('Action Items:', result.actionItems);
      console.log('Suggested Reply:', result.suggestedReplyDraft);
    } catch (err) {
      console.error('FAILED:', err);
    }
  }
}

runTests();