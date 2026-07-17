// frontend/src/components/CalendarSlots.tsx
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { CalendarSlot } from '../types';

export function CalendarSlots() {
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get<CalendarSlot[]>('/actions/pending-events');
      setSlots(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlots(); }, []);

  const handleConfirm = async (id: string) => {
        if (processingIds.has(id)) return; // block double-click
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await api.post(`/actions/events/${id}/confirm`);
      loadSlots();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to confirm');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleCancel = async (id: string) => {
    await api.post(`/actions/events/${id}/cancel`);
    loadSlots();
  };

  if (loading) return <p>Loading proposed meetings...</p>;
  if (slots.length === 0) return <p>No proposed meetings pending.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {slots.map((slot) => (
        <div key={slot.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
          <strong>{slot.title}</strong>
          <p>{new Date(slot.startTime).toLocaleString()} — {new Date(slot.endTime).toLocaleString()}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleConfirm(slot.id)}
              disabled={processingIds.has(slot.id)}>
              {processingIds.has(slot.id) ? 'Confirming...' : 'Confirm'}
            </button>
            <button onClick={() => handleCancel(slot.id)}>Cancel</button>
          </div>
        </div>
      ))}
    </div>
  );
}