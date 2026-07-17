// frontend/src/App.tsx
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { EmailList } from './components/EmailList';
import { CalendarView } from './components/CalendarView';
import './index.css';

type View = 'inbox' | 'calendar';

function App() {
  const { user, loading, login, logout } = useAuth();
  const [view, setView] = useState<View>('inbox');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', gap: 24, fontFamily: 'var(--font-display)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="36" height="36" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 2L2 8v8l10 6 10-6V8L12 2z"/></svg>
          <span style={{ fontSize: 24, fontWeight: 500 }}>Mailmind</span>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', maxWidth: 320, textAlign: 'center' }}>
          Your AI assistant for email and scheduling.
        </p>
        <button
          onClick={login}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)',
            fontSize: 14, fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
            <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--font-body)' }}>
      <TopBar user={user} onLogout={logout} view={view} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar view={view} onChangeView={setView} />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}>
          {view === 'inbox' ? <EmailList /> : <CalendarView />}
        </main>
      </div>
    </div>
  );
}

export default App;