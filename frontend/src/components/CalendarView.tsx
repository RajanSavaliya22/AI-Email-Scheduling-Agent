// frontend/src/components/CalendarView.tsx
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { CalendarSlot } from '../types';

function groupByDay(slots: CalendarSlot[]) {
  const groups: Record<string, CalendarSlot[]> = {};
  for (const slot of slots) {
    const key = new Date(slot.startTime).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(slot);
  }
  return groups;
}

export function CalendarView() {
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get<CalendarSlot[]>('/actions/pending-events');
      setSlots(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadSlots(); }, []);

  const handleConfirm = async (id: string) => {
    if (processingIds.has(id)) return;
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await api.post(`/actions/events/${id}/confirm`);
      loadSlots();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to confirm');
    } finally {
      setProcessingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleCancel = async (id: string) => {
    await api.post(`/actions/events/${id}/cancel`);
    loadSlots();
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>Loading calendar…</div>;

  if (slots.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#dadce0" strokeWidth="1"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>No proposed meetings.</p>
      </div>
    );
  }

  const groups = groupByDay(slots);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 32px' }}>
      {Object.entries(groups).map(([day, daySlots]) => (
        <div key={day} style={{ marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
            color: 'var(--color-blue)', marginBottom: 12, paddingBottom: 8,
            borderBottom: '1px solid var(--color-border)',
          }}>
            {new Date(day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          {daySlots.map((slot) => (
            <div key={slot.id} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid #f1f3f4' }}>
              <div style={{ width: 4, borderRadius: 2, background: 'var(--color-blue)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{slot.title}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {new Date(slot.startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  {' – '}
                  {new Date(slot.endTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => handleConfirm(slot.id)}
                  disabled={processingIds.has(slot.id)}
                  style={{
                    background: 'var(--color-blue)', color: 'white', padding: '6px 16px',
                    borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
                    opacity: processingIds.has(slot.id) ? 0.6 : 1,
                  }}
                >
                  {processingIds.has(slot.id) ? 'Confirming…' : 'Confirm'}
                </button>
                <button
                  onClick={() => handleCancel(slot.id)}
                  style={{ color: 'var(--color-text-secondary)', padding: '6px 12px', fontSize: 13 }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}