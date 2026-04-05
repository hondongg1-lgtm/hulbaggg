import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'advertiser';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string;
  role?: UserRole;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: any; data?: any }>;
  signInWithGoogle: (role?: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for userId:', userId);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle()
      ]);

      let finalRole: UserRole = 'user';
      let resolvedRoleData = roleResult.data;

      // Smart Role Discovery: If no role found by user_id, check by email
      if (!resolvedRoleData && user.email) {
        console.log('No role found by user_id, checking by email:', user.email);
        const { data: emailRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .maybeSingle();

        if (emailRole) {
          console.log('Role found by email, syncing user_id:', emailRole.role);
          // Sync user_id to the existing role record (important for manual Supabase edits)
          await supabase
            .from('user_roles')
            .update({ user_id: userId })
            .eq('id', emailRole.id);
          
          resolvedRoleData = emailRole;
        }
      }

      if (profileResult.data) {
        finalRole = (resolvedRoleData?.role as UserRole) || 'user';
        console.log('Profile found, resolved role:', finalRole);
        setUserRole(finalRole);
        setUserProfile({ ...profileResult.data, role: finalRole } as UserProfile);
      } else {
        console.log('No profile found in user_profiles');
        setUserRole(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }

      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      (async () => {
        setLoading(true);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('Logged in user:', session.user.email);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No session user found');
          setUserProfile(null);
          setUserRole(null);
        }

        setLoading(false);
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user) {
      fetchUserProfile(data.user.id);
    }

    return { error, data };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'user') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: role,
        },
      },
    });

    if (data.user) {
      // 1. Create profile
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        auth_provider: 'email',
        is_verified: true,
      });

      // 2. Create role if not a regular user
      if (role !== 'user') {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          email: email,
          role: role,
          is_active: true,
        });
      }
      
      await fetchUserProfile(data.user.id);
    }

    return { error, data };
  };

  const signInWithGoogle = async (role: UserRole = 'user') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_session');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setUserProfile(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      userRole,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
