// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface User {
  id: string;
  email: string;
  name: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const logout = async () => {
    window.location.href = 'http://localhost:3000/auth/logout';
  };

  return { user, loading, login, logout };
}