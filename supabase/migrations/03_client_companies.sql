-- =====================================================
-- Migration: 03_client_companies
-- Description: Creates table for client companies managed by consultancies
-- =====================================================

-- Create empresas_clientes table
create table if not exists public.empresas_clientes (
    id uuid primary key default uuid_generate_v4(),
    consultoria_id uuid references public.consultorias(id) on delete cascade not null,
    nome text not null,
    nome_fantasia text,
    cnpj text,
    email_contato text,
    telefone text,
    segmento text,
    tamanho_estimado text check (tamanho_estimado in ('ate_20', '20_100', '100_mais') or tamanho_estimado is null),
    status text not null check (status in ('ativa', 'inativa')) default 'ativa',
    criado_em timestamp with time zone default now(),
    atualizado_em timestamp with time zone default now()
);

-- Enable RLS
alter table public.empresas_clientes enable row level security;

-- RLS Policies
create policy "Users can view their consultoria companies"
on public.empresas_clientes for select
using (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

create policy "Users can insert companies to their consultoria"
on public.empresas_clientes for insert
with check (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

create policy "Users can update their consultoria companies"
on public.empresas_clientes for update
using (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

create policy "Users can delete their consultoria companies"
on public.empresas_clientes for delete
using (
    consultoria_id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);
