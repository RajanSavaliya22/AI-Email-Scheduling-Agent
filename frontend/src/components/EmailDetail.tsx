// frontend/src/components/EmailDetail.tsx
import { useState } from 'react';
import { api } from '../api/client';
import type { EmailDraft } from '../types';

interface EmailDetailProps {
  email: EmailDraft;
  onBack: () => void;
  onActionComplete: () => void;
}

export function EmailDetail({ email, onBack, onActionComplete }: EmailDetailProps) {
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState(email.editedReply || email.suggestedReply || '');
  const [busy, setBusy] = useState(false);

  const handleSaveEdit = async () => {
    setBusy(true);
    try {
      await api.put(`/actions/drafts/${email.id}`, { editedReply: replyText });
      setEditing(false);
    } finally { setBusy(false); }
  };

  const handleApprove = async () => {
    setBusy(true);
    try {
      await api.post(`/actions/drafts/${email.id}/approve`);
      onActionComplete();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send');
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await api.post(`/actions/drafts/${email.id}/reject`);
      onActionComplete();
    } finally { setBusy(false); }
  };

  const initial = email.sender.replace(/<.*>/, '').trim()[0]?.toUpperCase() || '?';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 32px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: 'var(--color-text-secondary)', fontSize: 14 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to inbox
      </button>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, margin: '0 0 20px' }}>{email.subject}</h1>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: 'var(--color-blue)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{email.sender}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{new Date(email.receivedAt).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ background: '#f8f9fa', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6, letterSpacing: 0.5 }}>SUMMARY</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{email.summary}</p>
        {email.actionItems && email.actionItems.length > 0 && (
          <ul style={{ margin: '12px 0 0', paddingLeft: 20 }}>
            {email.actionItems.map((item, i) => <li key={i} style={{ fontSize: 14 }}>{item}</li>)}
          </ul>
        )}
      </div>

      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10, letterSpacing: 0.5 }}>
          SUGGESTED REPLY
        </div>
        {editing ? (
          <>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              style={{ width: '100%', padding: 10, border: '1px solid var(--color-border)', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 14, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <PrimaryButton onClick={handleSaveEdit} disabled={busy}>Save</PrimaryButton>
              <TextButton onClick={() => setEditing(false)}>Cancel</TextButton>
            </div>
          </>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{replyText}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <PrimaryButton onClick={handleApprove} disabled={busy}>Send</PrimaryButton>
              <TextButton onClick={() => setEditing(true)}>Edit</TextButton>
              <TextButton onClick={handleReject} danger>Discard</TextButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: 'var(--color-blue)', color: 'white', padding: '9px 24px',
      borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500, opacity: disabled ? 0.6 : 1,
    }}>
      {children}
    </button>
  );
}

function TextButton({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 16px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 500,
      color: danger ? 'var(--color-red)' : 'var(--color-text-primary)',
    }}>
      {children}
    </button>
  );
}