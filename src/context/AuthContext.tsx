import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../constants';
import { supabase, isConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (tab: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (sessionUser: any) => {
      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single();
        
        if (mounted) {
          if (profile) {
            setUser(profile);
          } else {
            // Fallback to auth user if profile not found
            setUser({
              id: sessionUser.id,
              name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
              login: sessionUser.email || '',
              role: 'Consultor',
              department: 'Comercial'
            });
          }
        }
      } catch (e) {
        console.error('Error fetching profile:', e);
        if (mounted) {
          // Still set a fallback user so the app doesn't hang
          setUser({
            id: sessionUser.id,
            name: sessionUser.email?.split('@')[0] || 'User',
            login: sessionUser.email || '',
            role: 'Consultor',
            department: 'Comercial'
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        if (mounted) setLoading(false);
      }
    }).catch(err => {
      console.error('Initial session check error:', err);
      if (mounted) setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          fetchProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (!isConfigured) {
      console.error('Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações.');
      return false;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass.trim(),
    });

    if (error) {
      console.error('Login error:', error.message);
      // Provide more specific feedback for common errors
      if (error.message.includes('Email not confirmed')) {
        alert('E-mail ainda não confirmado. Verifique sua caixa de entrada ou desabilite a confirmação no painel do Supabase.');
      }
      return false;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasPermission = (tab: string): boolean => {
    if (!user) return false;
    const role = user.role;

    switch (tab) {
      case 'Dashboard':
      case 'Leads':
      case 'Andamento':
      case 'Funil':
      case 'Ranking':
      case 'Agenda':
        return true; // Everyone has access to these basic ones (with data filtering)
      
      case 'Atribuição':
        return role === 'Administrador' || role === 'Supervisor' || role === 'Financeiro';
      
      case 'Meta':
        return true; // Everyone sees their own or team's goals
      
      case 'Equipe':
        return role === 'Administrador' || role === 'Supervisor' || role === 'Financeiro';
      
      case 'Contrato':
        return role === 'Administrador' || (role === 'Supervisor' && user.department === 'Comercial') || (role === 'Consultor' && user.department === 'Comercial');
      
      case 'Custos Fixos':
      case 'Financeiro':
        return role === 'Administrador' || role === 'Financeiro';
      
      case 'Ativos':
        return true;
      
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
