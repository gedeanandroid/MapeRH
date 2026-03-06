import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';

/**
 * Custom hook to fetch the current user's `consultoria_id` and `usuario_id`.
 *
 * Replaces the duplicated pattern that was copy-pasted across every
 * workspace page (Employees, Positions, Competencies, etc.).
 */
export function useConsultoria() {
    const { user } = useAuth();
    const [consultoriaId, setConsultoriaId] = useState<string | null>(null);
    const [usuarioId, setUsuarioId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchConsultoria() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await supabase
                    .from('usuarios')
                    .select('id, consultoria_id')
                    .eq('auth_user_id', user.id)
                    .single();

                if (data) {
                    setConsultoriaId(data.consultoria_id);
                    setUsuarioId(data.id);
                }
            } catch (error) {
                console.error('useConsultoria: Error fetching consultoria data', error);
            } finally {
                setLoading(false);
            }
        }

        fetchConsultoria();
    }, [user]);

    return { consultoriaId, usuarioId, loading: loading };
}
