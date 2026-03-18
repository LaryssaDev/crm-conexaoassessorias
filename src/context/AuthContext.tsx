import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../constants';
import { supabase } from '../lib/supabase';

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
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch user profile from our 'users' table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUser(profile);
          } else {
            // Fallback to auth user if profile not found
            setUser({
              id: session.user.id,
              name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
              login: session.user.email || '',
              role: 'Consultor',
              department: 'Comercial'
            });
          }
        }
      } catch (e) {
        console.error('Auth session error:', e);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        } else {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            login: session.user.email || '',
            role: 'Consultor',
            department: 'Comercial'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      console.error('Login error:', error.message);
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
