
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset inactivity timer when auth state changes
        if (session?.user) {
          setTimeout(() => {
            resetInactivityTimer();
          }, 0);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        resetInactivityTimer();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-logout after 1 hour of inactivity
  let inactivityTimer: NodeJS.Timeout;
  const INACTIVITY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    if (user) {
      inactivityTimer = setTimeout(() => {
        signOut();
        alert('You have been logged out due to inactivity.');
      }, INACTIVITY_TIME);
    }
  };

  // Reset timer on user activity
  useEffect(() => {
    if (user) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      const resetTimer = () => resetInactivityTimer();
      
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true);
        });
        if (inactivityTimer) clearTimeout(inactivityTimer);
      };
    }
  }, [user]);

  const signOut = async () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
