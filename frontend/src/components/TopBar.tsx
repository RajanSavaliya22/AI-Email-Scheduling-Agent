// frontend/src/components/TopBar.tsx
interface TopBarProps {
  user: { email: string; name: string | null };
  onLogout: () => void;
  view: 'inbox' | 'calendar';
}

export function TopBar({ user, onLogout, view }: TopBarProps) {
  const initial = (user.name || user.email)[0].toUpperCase();

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 24,
      height: 64, padding: '0 16px', borderBottom: '1px solid var(--color-border)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 180 }}>
        <svg width="28" height="28" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 2L2 8v8l10 6 10-6V8L12 2z"/></svg>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-secondary)' }}>Mailmind</span>
      </div>

      <div style={{
        flex: 1, maxWidth: 600, display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--color-sidebar-bg)', borderRadius: 'var(--radius-full)',
        padding: '0 16px', height: 44,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" stroke="var(--color-text-secondary)" fill="none" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
          {view === 'inbox' ? 'Search mail' : 'Search events'}
        </span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          title={user.email}
          style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--color-blue)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}
          onClick={onLogout}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}