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
        user: AuditUser,
        context: AuditContext,
        dadosAnteriores?: any,
        dadosNovos?: any,
        camposAlterados?: string[]
    ) {
        const { error } = await supabase.from('audit_log').insert({
            acao: action,
            tabela,
            registro_id: registroId,
            user_id: user.id,
            user_type: user.type,
            user_name: user.name,
            user_email: user.email,
            consultoria_id: context.consultoriaId,
            empresa_cliente_id: context.empresaClienteId,
            dados_anteriores: dadosAnteriores,
            dados_novos: dadosNovos,
            campos_alterados: camposAlterados
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
