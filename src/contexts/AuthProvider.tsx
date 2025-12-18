import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'superadmin' | 'consultor' | 'admin_empresa' | null;

interface UserProfile {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
    consultoriaId: string | null;
    empresaClienteId: string | null;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    userProfile: UserProfile | null;
    userRole: UserRole;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    impersonateUser: (targetUserId: string, justification?: string) => Promise<void>;
    stopImpersonation: () => Promise<void>;
    isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    userProfile: null,
    userRole: null,
    signOut: async () => { },
    refreshProfile: async () => { },
    impersonateUser: async () => { },
    stopImpersonation: async () => { },
    isImpersonating: false,
});

export const useAuth = () => useContext(AuthContext);

// Helper: Promise with timeout
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    const timeout = new Promise<T>((resolve) => {
        setTimeout(() => resolve(fallback), ms);
    });
    return Promise.race([promise, timeout]);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [isImpersonating, setIsImpersonating] = useState(false);

    const initializationDone = useRef(false);

    // GUARANTEED timeout - loading MUST end after 8 seconds no matter what
    useEffect(() => {
        const maxTimeout = setTimeout(() => {
            if (loading) {
                console.warn('AuthProvider: Force ending loading state after timeout');
                setLoading(false);
            }
        }, 8000);

        return () => clearTimeout(maxTimeout);
    }, [loading]);

    // Auto-logout timer (5 minutes inactivity)
    useEffect(() => {
        if (!user) return;

        const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleActivity = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log('User inactive for 5 minutes. Signing out...');
                signOut();
            }, TIMEOUT_MS);
        };

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, handleActivity));
        handleActivity();

        return () => {
            events.forEach(event => document.removeEventListener(event, handleActivity));
            clearTimeout(timeoutId);
        };
    }, [user]);

    // Check impersonation state
    useEffect(() => {
        const adminBackup = sessionStorage.getItem('admin_backup_session');
        if (adminBackup) {
            setIsImpersonating(true);
        }
    }, []);

    const fetchUserProfile = useCallback(async (authUserId: string): Promise<boolean> => {
        try {
            // Check consultor/superadmin with 5s timeout
            const consultorPromise = supabase
                .from('usuarios')
                .select('id, nome, email, role, role_plataforma, consultoria_id')
                .eq('auth_user_id', authUserId)
                .maybeSingle();

            const { data: consultorData } = await withTimeout(consultorPromise, 5000, { data: null, error: null });

            if (consultorData) {
                const role: UserRole = consultorData.role_plataforma === 'superadmin'
                    ? 'superadmin'
                    : 'consultor';

                setUserRole(role);
                setUserProfile({
                    id: consultorData.id,
                    nome: consultorData.nome,
                    email: consultorData.email,
                    role,
                    consultoriaId: consultorData.consultoria_id,
                    empresaClienteId: null
                });
                return true;
            }

            // Check admin_empresa with 5s timeout
            const empresaPromise = supabase
                .from('usuarios_empresa')
                .select('id, nome, email, role_empresa, consultoria_id, empresa_cliente_id')
                .eq('auth_user_id', authUserId)
                .eq('ativo', true)
                .maybeSingle();

            const { data: empresaData } = await withTimeout(empresaPromise, 5000, { data: null, error: null });

            if (empresaData) {
                setUserRole('admin_empresa');
                setUserProfile({
                    id: empresaData.id,
                    nome: empresaData.nome,
                    email: empresaData.email,
                    role: 'admin_empresa',
                    consultoriaId: empresaData.consultoria_id,
                    empresaClienteId: empresaData.empresa_cliente_id
                });
                return true;
            }

            // No profile found
            console.warn('User authenticated but no profile found');
            setUserRole(null);
            setUserProfile(null);
            return false;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUserRole(null);
            setUserProfile(null);
            return false;
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchUserProfile(user.id);
        }
    }, [user, fetchUserProfile]);

    const signOut = useCallback(async () => {
        sessionStorage.removeItem('admin_backup_session');
        setIsImpersonating(false);
        setUserProfile(null);
        setUserRole(null);
        setUser(null);
        setSession(null);
        await supabase.auth.signOut();
    }, []);

    // Main auth initialization
    useEffect(() => {
        // Prevent double initialization in StrictMode
        if (initializationDone.current) return;
        initializationDone.current = true;

        const initAuth = async () => {
            try {
                // Get session with 5s timeout
                const sessionPromise = supabase.auth.getSession();
                const { data, error } = await withTimeout(
                    sessionPromise,
                    5000,
                    { data: { session: null }, error: new Error('Session timeout') }
                );

                if (error) {
                    console.error('Error getting session:', error);
                    setLoading(false);
                    return;
                }

                const currentSession = data.session;
                if (currentSession?.user) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                    await fetchUserProfile(currentSession.user.id);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth event:', event);

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setUserProfile(null);
                setUserRole(null);
                setLoading(false);
            } else if (event === 'SIGNED_IN' && newSession?.user) {
                setSession(newSession);
                setUser(newSession.user);
                await fetchUserProfile(newSession.user.id);
                setLoading(false);
            } else if (event === 'TOKEN_REFRESHED' && newSession) {
                setSession(newSession);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchUserProfile]);

    const impersonateUser = useCallback(async (targetUserId: string, justification?: string) => {
        if (!session) return;

        try {
            const { data: linkData, error } = await supabase.functions.invoke('impersonate-user', {
                body: { target_user_id: targetUserId, justificativa: justification }
            });

            if (error) throw new Error(error.message || 'Error calling impersonation function');
            if (linkData.error) throw new Error(linkData.error);

            sessionStorage.setItem('admin_backup_session', JSON.stringify(session));
            await supabase.auth.signOut();

            if (linkData.action_link) {
                window.location.href = linkData.action_link;
            } else {
                throw new Error('Link generation failed');
            }
        } catch (error: any) {
            console.error('Impersonation error:', error);
            throw new Error(error.message || 'Falha ao iniciar impersonation');
        }
    }, [session]);

    const stopImpersonation = useCallback(async () => {
        const backupSessionStr = sessionStorage.getItem('admin_backup_session');
        if (!backupSessionStr) return;

        try {
            const backupSession = JSON.parse(backupSessionStr);
            await supabase.auth.signOut();

            const { error } = await supabase.auth.setSession({
                access_token: backupSession.access_token,
                refresh_token: backupSession.refresh_token
            });

            if (error) throw error;

            sessionStorage.removeItem('admin_backup_session');
            setIsImpersonating(false);
            window.location.href = '/admin';
        } catch (error) {
            console.error('Stop impersonation error:', error);
            signOut();
        }
    }, [signOut]);

    const value = {
        session,
        user,
        loading,
        userProfile,
        userRole,
        signOut,
        refreshProfile,
        impersonateUser,
        stopImpersonation,
        isImpersonating
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
