import type { ReactNode } from 'react';

interface SidebarProps {
  view: 'inbox' | 'calendar';
  onChangeView: (v: 'inbox' | 'calendar') => void;
}

export function Sidebar({ view, onChangeView }: SidebarProps) {
  const navItem = (id: 'inbox' | 'calendar', label: string, icon: ReactNode) => (
    <button
      onClick={() => onChangeView(id)}      
      style={{
        display: 'flex', alignItems: 'center', gap: 18,
        width: '100%', textAlign: 'left', padding: '0 24px',
        height: 32, borderRadius: '0 var(--radius-full) var(--radius-full) 0',
        background: view === id ? 'var(--color-selected)' : 'transparent',
        color: view === id ? 'var(--color-blue)' : 'var(--color-text-primary)',
        fontWeight: view === id ? 700 : 400,
        fontSize: 14,
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <nav style={{
      width: 256, flexShrink: 0, background: 'var(--color-bg)',
      paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ padding: '0 16px 16px' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#c2e7ff', borderRadius: 'var(--radius-full)',
          padding: '14px 24px 14px 16px', fontSize: 14, fontWeight: 500,
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round"/></svg>
          Refresh inbox
        </button>
      </div>

      {navItem('inbox', 'Inbox', (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8l9 6 9-6M4 6h16v12H4z"/>
        </svg>
      ))}
      {navItem('calendar', 'Calendar', (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
        </svg>
      ))}
    </nav>
  );
}