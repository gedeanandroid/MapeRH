-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Consultorias Table
create table if not exists public.consultorias (
    id uuid primary key default uuid_generate_v4(),
    nome text not null,
    nome_fantasia text,
    cnpj text,
    telefone text,
    site text,
    instagram text,
    qtd_clientes_estimado text,
    logo_url text,
    perfil_completo boolean default false,
    criado_em timestamp with time zone default now(),
    atualizado_em timestamp with time zone default now()
);

-- Create Usuarios Table
create table if not exists public.usuarios (
    id uuid primary key default uuid_generate_v4(),
    auth_user_id uuid references auth.users(id) on delete cascade not null,
    consultoria_id uuid references public.consultorias(id) on delete cascade not null,
    nome text not null,
    email text not null,
    role text not null check (role in ('owner', 'consultor', 'admin_interno')),
    ativo boolean default true,
    primeiro_login_concluido boolean default false,
    criado_em timestamp with time zone default now(),
    atualizado_em timestamp with time zone default now(),
    unique(auth_user_id)
);

-- RLS Policies

-- Enable RLS
alter table public.consultorias enable row level security;
alter table public.usuarios enable row level security;

-- Consultorias Policies
create policy "Users can view their own consultoria"
on public.consultorias for select
using (
    id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
    )
);

create policy "Owners can update their own consultoria"
on public.consultorias for update
using (
    id in (
        select consultoria_id from public.usuarios
        where auth_user_id = auth.uid()
        and role = 'owner'
    )
);

-- Usuarios Policies
create policy "Users can view their own profile"
on public.usuarios for select
using (auth_user_id = auth.uid());

create policy "Users can update their own profile"
on public.usuarios for update
using (auth_user_id = auth.uid());


-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
    new_consultoria_id uuid;
begin
    -- Create a new consultoria for the new user
    insert into public.consultorias (nome)
    values (new.raw_user_meta_data->>'full_name')
    returning id into new_consultoria_id;

    -- Create a new usuario linked to the auth user and the new consultoria
    insert into public.usuarios (auth_user_id, consultoria_id, nome, email, role)
    values (
        new.id,
        new_consultoria_id,
        coalesce(new.raw_user_meta_data->>'full_name', 'Usuário'),
        new.email,
        'owner'
    );

    return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
