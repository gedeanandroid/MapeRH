-- =====================================================
-- Migration: 02_plans_subscriptions
-- Description: Creates tables for plans, subscriptions, and payments
-- =====================================================

-- Create Planos Table
create table if not exists public.planos (
    id uuid primary key default uuid_generate_v4(),
    nome text not null,
    descricao text,
    preco_mensal_centavos integer not null,
    moeda text default 'BRL',
    limites jsonb default '{"max_empresas": 5, "max_usuarios_cliente": 20}',
    recursos jsonb default '[]',
    recomendado boolean default false,
    ativo boolean default true,
    criado_em timestamp with time zone default now(),
    atualizado_em timestamp with time zone default now()
);

-- Create Assinaturas Table
create table if not exists public.assinaturas (
    id uuid primary key default uuid_generate_v4(),
    consultoria_id uuid references public.consultorias(id) on delete cascade not null,
    plano_id uuid references public.planos(id) on delete set null,
    status text not null check (status in ('ativa', 'pendente_pagamento', 'cancelada', 'expirada')) default 'pendente_pagamento',
    data_inicio timestamp with time zone,
    data_fim timestamp with time zone,
    data_proxima_cobranca timestamp with time zone,
    reembolsavel_ate timestamp with time zone,
    valor_cobranca_centavos integer,
    moeda text default 'BRL',
    gateway text,
    gateway_customer_id text,
    gateway_subscription_id text,
    criado_em timestamp with time zone default now(),
    atualizado_em timestamp with time zone default now(),
    unique(consultoria_id) -- One active subscription per consultoria
);

-- Create Pagamentos Table
create table if not exists public.pagamentos (
    id uuid primary key default uuid_generate_v4(),
    assinatura_id uuid references public.assinaturas(id) on delete cascade not null,
    consultoria_id uuid references public.consultorias(id) on delete cascade not null,
    status text not null check (status in ('aprovado', 'pendente', 'falhou', 'reembolsado', 'parcialmente_reembolsado')) default 'pendente',
    valor_centavos integer not null,
    moeda text default 'BRL',
    tipo text not null check (tipo in ('primeiro_pagamento', 'renovacao')) default 'primeiro_pagamento',
    data_pagamento timestamp with time zone,
    gateway text,
    gateway_payment_id text,
    reembolsado_centavos integer default 0,
    data_reembolso timestamp with time zone,
    criado_em timestamp with time zone default now(),
    atualizado_em timestamp with time zone default now()
);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS
alter table public.planos enable row level security;
alter table public.assinaturas enable row level security;
alter table public.pagamentos enable row level security;

-- Planos: Everyone can read active plans
create policy "Anyone can view active plans"
on public.planos for select
using (ativo = true);

-- Assinaturas: Users can only view/update their own subscription
create policy "Users can view their own subscription"
on public.assinaturas for select
using (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

create policy "Users can insert their own subscription"
on public.assinaturas for insert
with check (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

create policy "Users can update their own subscription"
on public.assinaturas for update
using (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

-- Pagamentos: Users can only view/insert their own payments
create policy "Users can view their own payments"
on public.pagamentos for select
using (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

create policy "Users can insert their own payments"
on public.pagamentos for insert
with check (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

create policy "Users can update their own payments"
on public.pagamentos for update
using (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

-- =====================================================
-- Seed Initial Plans
-- =====================================================

insert into public.planos (nome, descricao, preco_mensal_centavos, limites, recursos, recomendado) values
(
    'Starter',
    'Ideal para consultores iniciantes',
    9900,
    '{"max_empresas": 5, "max_usuarios_cliente": 20}',
    '["Gestão de até 5 empresas", "20 usuários por empresa", "Suporte por email", "Relatórios básicos"]',
    false
),
(
    'Profissional',
    'Para consultorias em crescimento',
    19900,
    '{"max_empresas": 15, "max_usuarios_cliente": 50}',
    '["Gestão de até 15 empresas", "50 usuários por empresa", "Suporte prioritário", "Relatórios avançados", "Integrações básicas", "API de acesso"]',
    true
),
(
    'Enterprise',
    'Para grandes consultorias',
    49900,
    '{"max_empresas": -1, "max_usuarios_cliente": -1}',
    '["Empresas ilimitadas", "Usuários ilimitados", "Suporte dedicado 24/7", "Relatórios personalizados", "Todas as integrações", "API completa", "Treinamento incluído"]',
    false
);
