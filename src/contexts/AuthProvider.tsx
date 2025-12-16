import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'superadmin' | 'consultor' | 'admin_empresa' | null;

interface UserProfile {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
    consultoriaId: string | null;
    empresaClienteId: string | null; // Only for admin_empresa
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);

    const [isImpersonating, setIsImpersonating] = useState(false);

    // Auto-logout timer
    useEffect(() => {
        if (!user) return;

        const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
        let timeoutId: NodeJS.Timeout;

        const handleActivity = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log('User inactive for 5 minutes. Signing out...');
                signOut();
            }, TIMEOUT_MS);
        };

        // Events to track activity
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, handleActivity));

        // Initial timer start
        handleActivity();

        return () => {
            events.forEach(event => document.removeEventListener(event, handleActivity));
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [user]);

    useEffect(() => {
        // Check if we are in impersonation mode on load
        const adminBackup = sessionStorage.getItem('admin_backup_session');
        if (adminBackup) {
            setIsImpersonating(true);
        }
    }, [session]);

    const fetchUserProfile = async (authUserId: string) => {
        try {
            // First check if user is a consultor/superadmin
            const { data: consultorData, error: consultorError } = await supabase
                .from('usuarios')
                .select('id, nome, email, role, role_plataforma, consultoria_id')
                .eq('auth_user_id', authUserId)
                .maybeSingle(); // Use maybeSingle to avoid throwing on not found

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
                return;
            }

            // Check if user is admin_empresa
            const { data: empresaData } = await supabase
                .from('usuarios_empresa')
                .select('id, nome, email, role_empresa, consultoria_id, empresa_cliente_id')
                .eq('auth_user_id', authUserId)
                .eq('ativo', true)
                .maybeSingle();

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
                return;
            }

            // No profile found
            console.warn('User authenticated but no profile found in usuarios or usuarios_empresa');
            setUserRole(null);
            setUserProfile(null);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUserRole(null);
            setUserProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchUserProfile(user.id);
        }
    };

    const initializeAuth = async () => {
        try {
            // 1. Get Session
            const { data: { session: initialSession } } = await supabase.auth.getSession();

            setSession(initialSession);
            setUser(initialSession?.user ?? null);

            if (initialSession?.user) {
                await fetchUserProfile(initialSession.user.id);
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load
        initializeAuth();

        // Subscription for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            // console.log('Auth state change:', event);

            // Should not trigger full reload on INITIAL_SESSION as we handle it manually above
            // but helpful to keep sync

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setUserProfile(null);
                setUserRole(null);
                setLoading(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                if (newSession?.user) {
                    await fetchUserProfile(newSession.user.id);
                }
                setLoading(false);
            }
        });

        // Safety timeout: if loading takes too long (e.g. 5s), force it to stop
        // This prevents infinite loading screens if something hangs
        const safetyTimeout = setTimeout(() => {
            setLoading((prev) => {
                if (prev) {
                    console.warn("Auth loading timed out, forcing render.");
                    return false;
                }
                return prev;
            });
        }, 5000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const signOut = async () => {
        // Clear impersonation state if exists
        sessionStorage.removeItem('admin_backup_session');
        setIsImpersonating(false);

        setUserProfile(null);
        setUserRole(null);
        await supabase.auth.signOut();
    };

    const impersonateUser = async (targetUserId: string, justification?: string) => {
        if (!session) return;

        try {
            // 1. Get Magic Link from Edge Function
            const { data: linkData, error } = await supabase.functions.invoke('impersonate-user', {
                body: { target_user_id: targetUserId, justificativa: justification }
            });

            if (error) throw new Error(error.message || 'Error calling impersonation function');
            if (linkData.error) throw new Error(linkData.error);

            // 2. Store current admin session
            sessionStorage.setItem('admin_backup_session', JSON.stringify(session));

            // 3. Sign out admin
            await supabase.auth.signOut();

            // 4. Redirect to magic link (which logs in as target)
            if (linkData.action_link) {
                window.location.href = linkData.action_link;
            } else {
                throw new Error('Link generation failed');
            }

        } catch (error: any) {
            console.error('Impersonation error:', error);
            throw new Error(error.message || 'Falha ao iniciar impersonation');
        }
    };

    const stopImpersonation = async () => {
        const backupSessionStr = sessionStorage.getItem('admin_backup_session');
        if (!backupSessionStr) return;

        try {
            const backupSession = JSON.parse(backupSessionStr);

            // 1. Sign out of target user
            await supabase.auth.signOut();

            // 2. Restore admin session
            const { error } = await supabase.auth.setSession({
                access_token: backupSession.access_token,
                refresh_token: backupSession.refresh_token
            });

            if (error) throw error;

            // 3. Clear backup
            sessionStorage.removeItem('admin_backup_session');
            setIsImpersonating(false);

            // 4. Force reload or re-fetch profile to ensure admin state
            window.location.href = '/admin'; // Redirect back to admin console

        } catch (error) {
            console.error('Stop impersonation error:', error);
            // If restoration fails, force full logout
            signOut();
        }
    };

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
