// frontend/src/components/EmailList.tsx
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { EmailDraft } from '../types';
import { EmailDetail } from './EmailDetail';

const priorityStyle: Record<string, { bg: string; color: string; label: string }> = {
  urgent: { bg: 'var(--color-red-bg)', color: 'var(--color-red)', label: 'Urgent' },
  normal: { bg: 'var(--color-yellow-bg)', color: '#b06000', label: 'Normal' },
  low: { bg: '#f1f3f4', color: 'var(--color-text-secondary)', label: 'Low' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function EmailList() {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const res = await api.get<EmailDraft[]>('/actions/pending-drafts');
      setDrafts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDrafts(); }, []);

  const selected = drafts.find(d => d.id === selectedId);

  if (selected) {
    return (
      <EmailDetail
        email={selected}
        onBack={() => setSelectedId(null)}
        onActionComplete={() => { setSelectedId(null); loadDrafts(); }}
      />
    );
  }

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>Loading inbox…</div>;
  }

  if (drafts.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#dadce0" strokeWidth="1"><path d="M3 8l9 6 9-6M4 6h16v12H4z"/></svg>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>You're all caught up.</p>
      </div>
    );
  }

  return (
    <div>
      {drafts.map((email) => {
        const p = priorityStyle[email.priority || 'normal'];
        return (
          <div
            key={email.id}
            onClick={() => setSelectedId(email.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '0 16px', height: 48, borderBottom: '1px solid #f1f3f4',
              cursor: 'pointer', fontSize: 14,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              width: 68, flexShrink: 0, fontSize: 11, fontWeight: 600, textAlign: 'center',
              padding: '3px 0', borderRadius: 4, background: p.bg, color: p.color,
            }}>
              {p.label.toUpperCase()}
            </span>
            <span style={{ width: 200, flexShrink: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email.sender.replace(/<.*>/, '').trim()}
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-text-primary)' }}>{email.subject}</span>
              {' — '}{email.summary}
            </span>
            <span style={{ flexShrink: 0, fontSize: 12, color: 'var(--color-text-secondary)', width: 60, textAlign: 'right' }}>
              {timeAgo(email.receivedAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}