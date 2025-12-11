import { supabase } from '../lib/supabaseClient';
import { Database } from '../lib/database.types';

type UsuarioEmpresa = Database['public']['Tables']['usuarios_empresa']['Row'];
type UsuarioEmpresaInsert = Database['public']['Tables']['usuarios_empresa']['Insert'];
type UsuarioEmpresaUpdate = Database['public']['Tables']['usuarios_empresa']['Update'];

export const userService = {
    async listUsuariosEmpresa(empresaId: string) {
        const { data, error } = await supabase
            .from('usuarios_empresa')
            .select('*')
            .eq('empresa_cliente_id', empresaId)
            .order('nome');

        if (error) throw error;
        return data;
    },

    async getUsuarioEmpresa(id: string) {
        const { data, error } = await supabase
            .from('usuarios_empresa')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createUsuarioEmpresa(usuario: UsuarioEmpresaInsert) {
        // Here we would ideally trigger a cloud function to invite the user via email
        // For now, we just insert the record.
        // Note: auth_user_id is required, so in a real flow we need to create the auth user first.
        // Since we can't create auth users from client side without being admin, 
        // we might need a stored procedure or edge function.
        // FOR NOW: We assume the auth user might already exist or handled separately.
        // Actually, without an edge function, we can't create a new Auth user easily from here.
        // We will assume for this step that we are just managing the metadata, 
        // or the user should exist. 
        // But for a realistic flow, we likely need to use an invite function.

        const { data, error } = await supabase
            .from('usuarios_empresa')
            .insert(usuario)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateUsuarioEmpresa(id: string, updates: UsuarioEmpresaUpdate) {
        const { data, error } = await supabase
            .from('usuarios_empresa')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async toggleAtivo(id: string, ativo: boolean) {
        const { data, error } = await supabase
            .from('usuarios_empresa')
            .update({ ativo })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
