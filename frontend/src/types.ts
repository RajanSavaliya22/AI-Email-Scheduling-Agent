export interface EmailDraft {
  id: string;
  sender: string;
  subject: string;
  summary: string | null;
  priority: 'urgent' | 'normal' | 'low' | null;
  actionItems: string[] | null;
  suggestedReply: string | null;
  editedReply: string | null;
  status: string;
  receivedAt: string;
}

export interface CalendarSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
}