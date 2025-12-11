-- =====================================================
-- Migration 07: Roles, Permissions & Audit System
-- =====================================================

-- 1. Add role_plataforma to usuarios table
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS role_plataforma text 
CHECK (role_plataforma IN ('superadmin') OR role_plataforma IS NULL);

-- 2. Create usuarios_empresa table (Admin RH and company users)
CREATE TABLE IF NOT EXISTS public.usuarios_empresa (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consultoria_id uuid REFERENCES public.consultorias(id) ON DELETE CASCADE NOT NULL,
    empresa_cliente_id uuid REFERENCES public.empresas_clientes(id) ON DELETE CASCADE NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    role_empresa text NOT NULL DEFAULT 'admin_empresa' 
        CHECK (role_empresa IN ('admin_empresa', 'gestor', 'visualizador')),
    ativo boolean DEFAULT true,
    primeiro_login boolean DEFAULT true,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now(),
    UNIQUE(auth_user_id, empresa_cliente_id)
);

-- 3. Create audit_log table for ALL modifications tracking
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Who made the change
    user_id uuid NOT NULL,
    user_type text NOT NULL CHECK (user_type IN ('superadmin', 'consultor', 'admin_empresa')),
    user_name text NOT NULL,
    user_email text NOT NULL,
    -- Context
    consultoria_id uuid REFERENCES public.consultorias(id) ON DELETE SET NULL,
    empresa_cliente_id uuid REFERENCES public.empresas_clientes(id) ON DELETE SET NULL,
    -- What changed
    tabela text NOT NULL,
    registro_id uuid NOT NULL,
    acao text NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE')),
    dados_anteriores jsonb,
    dados_novos jsonb,
    campos_alterados text[],
    -- When
    criado_em timestamptz DEFAULT now()
);

-- 4. Create audit_impersonation table for Super Admin (future use)
CREATE TABLE IF NOT EXISTS public.audit_impersonation (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id uuid REFERENCES public.usuarios(id) NOT NULL,
    target_user_id uuid NOT NULL,
    target_user_type text NOT NULL CHECK (target_user_type IN ('consultor', 'admin_empresa')),
    target_user_name text NOT NULL,
    justificativa text NOT NULL,
    inicio timestamptz DEFAULT now(),
    fim timestamptz,
    criado_em timestamptz DEFAULT now()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_auth_user ON public.usuarios_empresa(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_empresa ON public.usuarios_empresa(empresa_cliente_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_consultoria ON public.usuarios_empresa(consultoria_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabela ON public.audit_log(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_log_registro ON public.audit_log(registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_empresa ON public.audit_log(empresa_cliente_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_data ON public.audit_log(criado_em DESC);

-- 6. Enable RLS
ALTER TABLE public.usuarios_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_impersonation ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for usuarios_empresa

-- Consultores can view users from their consultoria
CREATE POLICY "Consultores can view usuarios_empresa"
ON public.usuarios_empresa FOR SELECT
USING (
    consultoria_id IN (
        SELECT consultoria_id FROM public.usuarios
        WHERE auth_user_id = auth.uid()
    )
);

-- Admin RH can view only their own record
CREATE POLICY "Admin RH can view own record"
ON public.usuarios_empresa FOR SELECT
USING (auth_user_id = auth.uid());

-- Consultores can insert usuarios_empresa for their companies
CREATE POLICY "Consultores can insert usuarios_empresa"
ON public.usuarios_empresa FOR INSERT
WITH CHECK (
    consultoria_id IN (
        SELECT consultoria_id FROM public.usuarios
        WHERE auth_user_id = auth.uid()
    )
    AND
    empresa_cliente_id IN (
        SELECT id FROM public.empresas_clientes
        WHERE consultoria_id IN (
            SELECT consultoria_id FROM public.usuarios
            WHERE auth_user_id = auth.uid()
        )
    )
);

-- Consultores can update usuarios_empresa from their consultoria
CREATE POLICY "Consultores can update usuarios_empresa"
ON public.usuarios_empresa FOR UPDATE
USING (
    consultoria_id IN (
        SELECT consultoria_id FROM public.usuarios
        WHERE auth_user_id = auth.uid()
    )
);

-- 8. RLS Policies for audit_log

-- Users can view audit logs for their context
CREATE POLICY "Users can view relevant audit_log"
ON public.audit_log FOR SELECT
USING (
    -- Consultor sees logs from their consultoria
    consultoria_id IN (
        SELECT consultoria_id FROM public.usuarios
        WHERE auth_user_id = auth.uid()
    )
    OR
    -- Admin RH sees logs from their empresa
    empresa_cliente_id IN (
        SELECT empresa_cliente_id FROM public.usuarios_empresa
        WHERE auth_user_id = auth.uid()
    )
);

-- Anyone authenticated can insert audit logs
CREATE POLICY "Authenticated users can insert audit_log"
ON public.audit_log FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 9. RLS Policies for audit_impersonation (Super Admin only - future)
CREATE POLICY "Only superadmin can view impersonation logs"
ON public.audit_impersonation FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE auth_user_id = auth.uid()
        AND role_plataforma = 'superadmin'
    )
);

CREATE POLICY "Only superadmin can insert impersonation logs"
ON public.audit_impersonation FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE auth_user_id = auth.uid()
        AND role_plataforma = 'superadmin'
    )
);

-- 10. Function to get current user info for audit
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE (
    user_id uuid,
    user_type text,
    user_name text,
    user_email text,
    consultoria_id uuid
) AS $$
BEGIN
    -- First check if user is a consultor
    RETURN QUERY
    SELECT 
        u.id,
        CASE 
            WHEN u.role_plataforma = 'superadmin' THEN 'superadmin'::text
            ELSE 'consultor'::text
        END,
        u.nome,
        u.email,
        u.consultoria_id
    FROM public.usuarios u
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- Check if user is admin_empresa
        RETURN QUERY
        SELECT 
            ue.id,
            'admin_empresa'::text,
            ue.nome,
            ue.email,
            ue.consultoria_id
        FROM public.usuarios_empresa ue
        WHERE ue.auth_user_id = auth.uid()
        AND ue.ativo = true
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
