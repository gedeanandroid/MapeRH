-- =====================================================
-- Migration: 08_superadmin_schema
-- Description: Creates tables for Superadmin console functionality
-- =====================================================

-- =====================================================
-- 1. ROLES INTERNOS (Support/Ops/Financial roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.roles_internos (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    nome text NOT NULL UNIQUE,
    descricao text,
    permissoes jsonb DEFAULT '{}',
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- Seed initial internal roles
INSERT INTO public.roles_internos (nome, descricao, permissoes) VALUES
('superadmin', 'Acesso total à plataforma', '{"full_access": true}'),
('suporte_n1', 'Suporte nível 1 - apenas visualização', '{"read_consultorias": true, "read_empresas": true, "read_usuarios": true}'),
('suporte_n2', 'Suporte nível 2 - visualização + ações básicas', '{"read_consultorias": true, "read_empresas": true, "read_usuarios": true, "impersonate": true, "edit_basic": true}'),
('financeiro', 'Acesso ao painel financeiro', '{"read_financeiro": true, "manage_billing": true}'),
('ops', 'Operações - gerenciamento técnico', '{"read_all": true, "manage_configs": true}')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 2. USUARIOS INTERNOS (Support team users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usuarios_internos (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nome text NOT NULL,
    email text NOT NULL UNIQUE,
    role_interno_id uuid REFERENCES public.roles_internos(id),
    ativo boolean DEFAULT true,
    mfa_obrigatorio boolean DEFAULT true,
    ultimo_acesso timestamptz,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- =====================================================
-- 3. OPERACOES FINANCEIRAS (Manual financial operations)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.operacoes_financeiras (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    consultoria_id uuid REFERENCES public.consultorias(id) ON DELETE CASCADE NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('credito', 'desconto', 'cancelamento', 'pagamento_manual', 'ajuste')),
    valor_centavos integer DEFAULT 0,
    justificativa text NOT NULL,
    executado_por uuid NOT NULL, -- Can be usuario or usuario_interno
    executado_por_tipo text NOT NULL CHECK (executado_por_tipo IN ('superadmin', 'interno')),
    criado_em timestamptz DEFAULT now()
);

-- =====================================================
-- 4. CONFIGURACOES GLOBAIS (Platform settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.configuracoes_globais (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    chave text NOT NULL UNIQUE,
    valor jsonb NOT NULL,
    descricao text,
    atualizado_por uuid,
    atualizado_em timestamptz DEFAULT now()
);

-- Seed initial global configurations
INSERT INTO public.configuracoes_globais (chave, valor, descricao) VALUES
('limites_plano_default', '{"max_empresas": 5, "max_usuarios_cliente": 20}', 'Limites padrão para novos planos'),
('seguranca_login', '{"max_tentativas": 5, "bloqueio_minutos": 15, "mfa_obrigatorio_admin": true}', 'Configurações de segurança de login'),
('impersonation', '{"tempo_limite_minutos": 30, "justificativa_obrigatoria": true}', 'Configurações de impersonation'),
('email_provider', '{"provider": "supabase", "from_email": "noreply@maperh.com"}', 'Provedor de email'),
('gateway_pagamento', '{"provider": "stripe", "modo": "test"}', 'Gateway de pagamento')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================
-- 5. FEATURE FLAGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    nome text NOT NULL UNIQUE,
    ativo boolean DEFAULT false,
    descricao text,
    consultoria_ids uuid[] DEFAULT '{}', -- Empty = all, filled = specific consultorias
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- Seed initial feature flags
INSERT INTO public.feature_flags (nome, ativo, descricao) VALUES
('modulo_avaliacao', true, 'Módulo de avaliação de desempenho'),
('modulo_pdi', true, 'Módulo de PDI (Plano de Desenvolvimento Individual)'),
('modulo_nine_box', false, 'Módulo Nine Box (em desenvolvimento)'),
('modulo_succession', false, 'Módulo de Sucessão (em desenvolvimento)'),
('integracao_whatsapp', false, 'Integração com WhatsApp')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 6. ADD COLUMNS TO CONSULTORIAS (Status tracking)
-- =====================================================
DO $$
BEGIN
    -- Status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'consultorias' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.consultorias ADD COLUMN status text DEFAULT 'ativo' 
            CHECK (status IN ('ativo', 'trial', 'suspenso', 'cancelado'));
    END IF;

    -- Suspension tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'consultorias' 
                   AND column_name = 'suspenso_em') THEN
        ALTER TABLE public.consultorias ADD COLUMN suspenso_em timestamptz;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'consultorias' 
                   AND column_name = 'suspenso_por') THEN
        ALTER TABLE public.consultorias ADD COLUMN suspenso_por uuid;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'consultorias' 
                   AND column_name = 'motivo_suspensao') THEN
        ALTER TABLE public.consultorias ADD COLUMN motivo_suspensao text;
    END IF;

    -- Trial period
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'consultorias' 
                   AND column_name = 'trial_inicio') THEN
        ALTER TABLE public.consultorias ADD COLUMN trial_inicio timestamptz;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'consultorias' 
                   AND column_name = 'trial_fim') THEN
        ALTER TABLE public.consultorias ADD COLUMN trial_fim timestamptz;
    END IF;
END $$;

-- =====================================================
-- 7. LOGS DE AUTENTICACAO (Login tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.logs_autenticacao (
    id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_email text NOT NULL,
    auth_user_id uuid,
    tipo text NOT NULL CHECK (tipo IN ('login_sucesso', 'login_falha', 'logout', 'mfa_sucesso', 'mfa_falha')),
    ip_address text,
    user_agent text,
    detalhes jsonb DEFAULT '{}',
    criado_em timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_logs_autenticacao_email ON public.logs_autenticacao(user_email);
CREATE INDEX IF NOT EXISTS idx_logs_autenticacao_criado ON public.logs_autenticacao(criado_em DESC);

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.roles_internos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_internos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_globais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_autenticacao ENABLE ROW LEVEL SECURITY;

-- Superadmin can access all tables
-- Using a function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE auth_user_id = auth.uid()
        AND role_plataforma = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Roles internos: only superadmin can read/write
CREATE POLICY "Superadmin can manage roles_internos"
ON public.roles_internos FOR ALL
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

-- Usuarios internos: only superadmin can manage
CREATE POLICY "Superadmin can manage usuarios_internos"
ON public.usuarios_internos FOR ALL
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

-- Operacoes financeiras: only superadmin can manage
CREATE POLICY "Superadmin can manage operacoes_financeiras"
ON public.operacoes_financeiras FOR ALL
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

-- Configuracoes globais: only superadmin can manage
CREATE POLICY "Superadmin can manage configuracoes_globais"
ON public.configuracoes_globais FOR ALL
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

-- Feature flags: superadmin can manage, all authenticated can read
CREATE POLICY "Superadmin can manage feature_flags"
ON public.feature_flags FOR ALL
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

CREATE POLICY "Authenticated users can read feature_flags"
ON public.feature_flags FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Logs autenticacao: only superadmin can read
CREATE POLICY "Superadmin can read logs_autenticacao"
ON public.logs_autenticacao FOR SELECT
USING (public.is_superadmin());

-- Allow insert for auth system (via trigger or service role)
CREATE POLICY "System can insert logs_autenticacao"
ON public.logs_autenticacao FOR INSERT
WITH CHECK (true);
