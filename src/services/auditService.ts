import { supabase } from '../lib/supabaseClient';
import { Database } from '../lib/database.types';

type AuditLog = Database['public']['Tables']['audit_log']['Row'];

interface AuditUser {
    id: string;
    type: string;
    name: string;
    email: string;
}

interface AuditContext {
    consultoriaId: string;
    empresaClienteId: string;
}

export const auditService = {
    async getAuditLogs(empresaId?: string, consultoriaId?: string, limit = 50) {
        let query = supabase
            .from('audit_log')
            .select('*')
            .order('criado_em', { ascending: false })
            .limit(limit);

        if (empresaId) {
            query = query.eq('empresa_cliente_id', empresaId);
        }

        if (consultoriaId && !empresaId) {
            query = query.eq('consultoria_id', consultoriaId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async logAction(
        action: 'INSERT' | 'UPDATE' | 'DELETE',
        tabela: string,
        registroId: string,
        _user: AuditUser, // No longer used - fetched server-side
        context: AuditContext,
        dadosAnteriores?: any,
        dadosNovos?: any,
        camposAlterados?: string[]
    ) {
        // Use secure RPC function instead of direct INSERT
        const { error } = await supabase.rpc('insert_audit_log', {
            p_tabela: tabela,
            p_registro_id: registroId,
            p_acao: action,
            p_empresa_cliente_id: context.empresaClienteId || null,
            p_dados_anteriores: dadosAnteriores || null,
            p_dados_novos: dadosNovos || null,
            p_campos_alterados: camposAlterados || null
        });

        if (error) console.error('Error logging audit:', error);
        return error;
    },

    async logInsert(user: AuditUser, context: AuditContext, tabela: string, registroId: string, dadosNovos: any) {
        return this.logAction('INSERT', tabela, registroId, user, context, null, dadosNovos);
    },

    async logUpdate(user: AuditUser, context: AuditContext, tabela: string, registroId: string, dadosAnteriores: any, dadosNovos: any) {
        // Calculate changed fields
        const camposAlterados = Object.keys(dadosNovos).filter(key =>
            JSON.stringify(dadosAnteriores[key]) !== JSON.stringify(dadosNovos[key])
        );

        if (camposAlterados.length === 0) return;

        return this.logAction('UPDATE', tabela, registroId, user, context, dadosAnteriores, dadosNovos, camposAlterados);
    },

    async logDelete(user: AuditUser, context: AuditContext, tabela: string, registroId: string, dadosAnteriores: any) {
        return this.logAction('DELETE', tabela, registroId, user, context, dadosAnteriores, null);
    }
};
