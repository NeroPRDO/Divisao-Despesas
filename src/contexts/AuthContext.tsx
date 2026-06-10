import type { Session, User } from '@supabase/supabase-js';
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase';
import type { Profile } from '../types/models';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isMissingSessionError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.message.toLowerCase().includes('auth session missing');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Erro ao carregar perfil:', error.message);
      setProfile(null);
      return;
    }

    setProfile(data as Profile);
  }

  async function refreshProfile() {
    const currentUser = session?.user;
    if (!currentUser) return;
    await loadProfile(currentUser.id);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);

      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }

      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  async function signUp(name: string, email: string, password: string) {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOut() {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error && !isMissingSessionError(error)) {
        throw error;
      }

      setSession(null);
      setProfile(null);
    } finally {
      setAuthLoading(false);
    }
  }

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    authLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }), [session, profile, loading, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
