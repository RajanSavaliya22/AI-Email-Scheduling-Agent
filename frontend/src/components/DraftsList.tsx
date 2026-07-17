// frontend/src/components/DraftsList.tsx
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { EmailDraft } from '../types';

const priorityColor: Record<string, string> = {
  urgent: '#dc2626',
  normal: '#2563eb',
  low: '#6b7280',
};

export function DraftsList() {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
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

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleApprove = async (id: string) => {
    await api.post(`/actions/drafts/${id}/approve`);
    loadDrafts();
  };

  const handleReject = async (id: string) => {
    await api.post(`/actions/drafts/${id}/reject`);
    loadDrafts();
  };

  const handleSaveEdit = async (id: string) => {
    await api.put(`/actions/drafts/${id}`, { editedReply: editText });
    setEditingId(null);
    loadDrafts();
  };

  if (loading) return <p>Loading drafts...</p>;
  if (drafts.length === 0) return <p>No pending drafts. You're all caught up.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {drafts.map((email) => (
        <div key={email.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{email.subject}</strong>
            <span style={{ color: priorityColor[email.priority || 'normal'], fontWeight: 600 }}>
              {email.priority?.toUpperCase()}
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>From: {email.sender}</p>
          <p>{email.summary}</p>

          {email.actionItems && email.actionItems.length > 0 && (
            <ul>
              {email.actionItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          )}

          {editingId === email.id ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                style={{ width: '100%' }}
              />
              <button onClick={() => handleSaveEdit(email.id)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: 6 }}>
              <p style={{ margin: 0 }}>{email.editedReply || email.suggestedReply}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button onClick={() => handleApprove(email.id)}>Approve & Send</button>
            <button onClick={() => {
              setEditingId(email.id);
              setEditText(email.editedReply || email.suggestedReply || '');
            }}>Edit</button>
            <button onClick={() => handleReject(email.id)}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}