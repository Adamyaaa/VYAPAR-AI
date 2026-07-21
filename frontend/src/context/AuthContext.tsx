import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { api } from '../utils/api';

interface Profile {
  business_name: string;
  phone_number: string | null;
}

interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, businessName: string, phoneNumber?: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    api.setAccessToken(session?.access_token ?? null);

    if (!session?.user) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    supabase
      .from('profiles')
      .select('business_name, phone_number')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load profile:', error.message);
          return;
        }
        setProfile(data);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const signUp = async (
    email: string,
    password: string,
    businessName: string,
    phoneNumber?: string
  ): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { business_name: businessName, phone_number: phoneNumber } },
    });
    return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session };
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
