export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    public: {
        Tables: {
            assinaturas: {
                Row: {
                    atualizado_em: string | null
                    consultoria_id: string
                    criado_em: string | null
                    data_fim: string | null
                    data_inicio: string | null
                    data_proxima_cobranca: string | null
                    gateway: string | null
                    gateway_customer_id: string | null
                    gateway_subscription_id: string | null
                    id: string
                    moeda: string | null
                    plano_id: string | null
                    reembolsavel_ate: string | null
                    status: string
                    valor_cobranca_centavos: number | null
                }
                Insert: {
                    atualizado_em?: string | null
                    consultoria_id: string
                    criado_em?: string | null
                    data_fim?: string | null
                    data_inicio?: string | null
                    data_proxima_cobranca?: string | null
                    gateway?: string | null
                    gateway_customer_id?: string | null
                    gateway_subscription_id?: string | null
                    id?: string
                    moeda?: string | null
                    plano_id?: string | null
                    reembolsavel_ate?: string | null
                    status?: string
                    valor_cobranca_centavos?: number | null
                }
                Update: {
                    atualizado_em?: string | null
                    consultoria_id?: string
                    criado_em?: string | null
                    data_fim?: string | null
                    data_inicio?: string | null
                    data_proxima_cobranca?: string | null
                    gateway?: string | null
                    gateway_customer_id?: string | null
                    gateway_subscription_id?: string | null
                    id?: string
                    moeda?: string | null
                    plano_id?: string | null
                    reembolsavel_ate?: string | null
                    status?: string
                    valor_cobranca_centavos?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "assinaturas_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                ]
            }
            audit_impersonation: {
                Row: {
                    admin_user_id: string
                    criado_em: string | null
                    fim: string | null
                    id: string
                    inicio: string | null
                    justificativa: string
                    target_user_id: string
                    target_user_name: string
                    target_user_type: string
                }
                Insert: {
                    admin_user_id: string
                    criado_em?: string | null
                    fim?: string | null
                    id?: string
                    inicio?: string | null
                    justificativa: string
                    target_user_id: string
                    target_user_name: string
                    target_user_type: string
                }
                Update: {
                    admin_user_id?: string
                    criado_em?: string | null
                    fim?: string | null
                    id?: string
                    inicio?: string | null
                    justificativa?: string
                    target_user_id?: string
                    target_user_name?: string
                    target_user_type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "audit_impersonation_admin_user_id_fkey"
                        columns: ["admin_user_id"]
                        isOneToOne: false
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            audit_log: {
                Row: {
                    acao: string
                    campos_alterados: string[] | null
                    consultoria_id: string | null
                    criado_em: string | null
                    dados_anteriores: Json | null
                    dados_novos: Json | null
                    empresa_cliente_id: string | null
                    id: string
                    registro_id: string
                    tabela: string
                    user_email: string
                    user_id: string
                    user_name: string
                    user_type: string
                }
                Insert: {
                    acao: string
                    campos_alterados?: string[] | null
                    consultoria_id?: string | null
                    criado_em?: string | null
                    dados_anteriores?: Json | null
                    dados_novos?: Json | null
                    empresa_cliente_id?: string | null
                    id?: string
                    registro_id: string
                    tabela: string
                    user_email: string
                    user_id: string
                    user_name: string
                    user_type: string
                }
                Update: {
                    acao?: string
                    campos_alterados?: string[] | null
                    consultoria_id?: string | null
                    criado_em?: string | null
                    dados_anteriores?: Json | null
                    dados_novos?: Json | null
                    empresa_cliente_id?: string | null
                    id?: string
                    registro_id?: string
                    tabela?: string
                    user_email?: string
                    user_id?: string
                    user_name?: string
                    user_type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "audit_log_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "audit_log_empresa_cliente_id_fkey"
                        columns: ["empresa_cliente_id"]
                        isOneToOne: false
                        referencedRelation: "empresas_clientes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            cargos: {
                Row: {
                    ativo: boolean | null
                    cbo: string | null
                    consultoria_id: string
                    criado_em: string | null
                    descricao: string | null
                    id: string
                    missao: string | null
                    nivel_hierarquico: string | null
                    nome: string
                    requisitos: string[] | null
                }
                Insert: {
                    ativo?: boolean | null
                    cbo?: string | null
                    consultoria_id: string
                    criado_em?: string | null
                    descricao?: string | null
                    id?: string
                    missao?: string | null
                    nivel_hierarquico?: string | null
                    nome: string
                    requisitos?: string[] | null
                }
                Update: {
                    ativo?: boolean | null
                    cbo?: string | null
                    consultoria_id?: string
                    criado_em?: string | null
                    descricao?: string | null
                    id?: string
                    missao?: string | null
                    nivel_hierarquico?: string | null
                    nome?: string
                    requisitos?: string[] | null
                }
                Relationships: [
                    {
                        foreignKeyName: "cargos_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                ]
            }
            cargos_competencias: {
                Row: {
                    cargo_id: string
                    competencia_id: string
                    consultoria_id: string
                    criado_em: string | null
                    grau_exigido: string | null
                    id: string
                    peso: number | null
                }
                Insert: {
                    cargo_id: string
                    competencia_id: string
                    consultoria_id: string
                    criado_em?: string | null
                    grau_exigido?: string | null
                    id?: string
                    peso?: number | null
                }
                Update: {
                    cargo_id?: string
                    competencia_id?: string
                    consultoria_id?: string
                    criado_em?: string | null
                    grau_exigido?: string | null
                    id?: string
                    peso?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "cargos_competencias_cargo_id_fkey"
                        columns: ["cargo_id"]
                        isOneToOne: false
                        referencedRelation: "cargos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "cargos_competencias_competencia_id_fkey"
                        columns: ["competencia_id"]
                        isOneToOne: false
                        referencedRelation: "competencias_empresa"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "cargos_competencias_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                ]
            }
            colaboradores: {
                Row: {
                    ativo: boolean | null
                    cargo_atual_id: string | null
                    consultoria_id: string
                    cpf: string | null
                    criado_em: string | null
                    data_admissao: string | null
                    data_nascimento: string | null
                    departamento_id: string | null
                    email: string
                    empresa_cliente_id: string
                    gestor_id: string | null
                    id: string
                    matricula: string | null
                    nome: string
                    telefone: string | null
                    unidade_organizacional_id: string | null
                }
                Insert: {
                    ativo?: boolean | null
                    cargo_atual_id?: string | null
                    consultoria_id: string
                    cpf?: string | null
                    criado_em?: string | null
                    data_admissao?: string | null
                    data_nascimento?: string | null
                    departamento_id?: string | null
                    email: string
                    empresa_cliente_id: string
                    gestor_id?: string | null
                    id?: string
                    matricula?: string | null
                    nome: string
                    telefone?: string | null
                    unidade_organizacional_id?: string | null
                }
                Update: {
                    ativo?: boolean | null
                    cargo_atual_id?: string | null
                    consultoria_id?: string
                    cpf?: string | null
                    criado_em?: string | null
                    data_admissao?: string | null
                    data_nascimento?: string | null
                    departamento_id?: string | null
                    email?: string
                    empresa_cliente_id?: string
                    gestor_id?: string | null
                    id?: string
                    matricula?: string | null
                    nome?: string
                    telefone?: string | null
                    unidade_organizacional_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "colaboradores_cargo_atual_id_fkey"
                        columns: ["cargo_atual_id"]
                        isOneToOne: false
                        referencedRelation: "cargos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "colaboradores_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "colaboradores_departamento_id_fkey"
                        columns: ["departamento_id"]
                        isOneToOne: false
                        referencedRelation: "departamentos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "colaboradores_empresa_cliente_id_fkey"
                        columns: ["empresa_cliente_id"]
                        isOneToOne: false
                        referencedRelation: "empresas_clientes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "colaboradores_gestor_id_fkey"
                        columns: ["gestor_id"]
                        isOneToOne: false
                        referencedRelation: "colaboradores"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "colaboradores_unidade_organizacional_id_fkey"
                        columns: ["unidade_organizacional_id"]
                        isOneToOne: false
                        referencedRelation: "unidades_organizacionais"
                        referencedColumns: ["id"]
                    },
                ]
            }
            competencias_empresa: {
                Row: {
                    ativo: boolean | null
                    consultoria_id: string
                    criado_em: string | null
                    definicao: string
                    empresa_cliente_id: string | null
                    escala_comportamental: Json | null
                    id: string
                    indicadores: string[] | null
                    nome: string
                    tipo: string
                }
                Insert: {
                    ativo?: boolean | null
                    consultoria_id: string
                    criado_em?: string | null
                    definicao: string
                    empresa_cliente_id?: string | null
                    escala_comportamental?: Json | null
                    id?: string
                    indicadores?: string[] | null
                    nome: string
                    tipo: string
                }
                Update: {
                    ativo?: boolean | null
                    consultoria_id?: string
                    criado_em?: string | null
                    definicao?: string
                    empresa_cliente_id?: string | null
                    escala_comportamental?: Json | null
                    id?: string
                    indicadores?: string[] | null
                    nome?: string
                    tipo?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "competencias_empresa_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "competencias_empresa_empresa_cliente_id_fkey"
                        columns: ["empresa_cliente_id"]
                        isOneToOne: false
                        referencedRelation: "empresas_clientes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            consultorias: {
                Row: {
                    ativo: boolean | null
                    cnpj: string
                    configuracoes: Json | null
                    criado_em: string | null
                    email_contato: string
                    id: string
                    nome_comercial: string
                    razao_social: string
                    telefone_contato: string | null
                }
                Insert: {
                    ativo?: boolean | null
                    cnpj: string
                    configuracoes?: Json | null
                    criado_em?: string | null
                    email_contato: string
                    id?: string
                    nome_comercial: string
                    razao_social: string
                    telefone_contato?: string | null
                }
                Update: {
                    ativo?: boolean | null
                    cnpj?: string
                    configuracoes?: Json | null
                    criado_em?: string | null
                    email_contato?: string
                    id?: string
                    nome_comercial?: string
                    razao_social?: string
                    telefone_contato?: string | null
                }
                Relationships: []
            }
            departamentos: {
                Row: {
                    ativo: boolean | null
                    consultoria_id: string
                    criado_em: string | null
                    descricao: string | null
                    empresa_cliente_id: string
                    id: string
                    nome: string
                    responsavel_id: string | null
                }
                Insert: {
                    ativo?: boolean | null
                    consultoria_id: string
                    criado_em?: string | null
                    descricao?: string | null
                    empresa_cliente_id: string
                    id?: string
                    nome: string
                    responsavel_id?: string | null
                }
                Update: {
                    ativo?: boolean | null
                    consultoria_id?: string
                    criado_em?: string | null
                    descricao?: string | null
                    empresa_cliente_id?: string
                    id?: string
                    nome?: string
                    responsavel_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "departamentos_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "departamentos_empresa_cliente_id_fkey"
                        columns: ["empresa_cliente_id"]
                        isOneToOne: false
                        referencedRelation: "empresas_clientes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "departamentos_responsavel_id_fkey"
                        columns: ["responsavel_id"]
                        isOneToOne: false
                        referencedRelation: "colaboradores"
                        referencedColumns: ["id"]
                    },
                ]
            }
            empresas_clientes: {
                Row: {
                    ativo: boolean | null
                    cnpj: string
                    codigo_identificacao: string
                    consultoria_id: string
                    criado_em: string | null
                    id: string
                    logotipo_url: string | null
                    nome_fantasia: string
                    razao_social: string
                    setor: string | null
                    tamanho: string | null
                }
                Insert: {
                    ativo?: boolean | null
                    cnpj: string
                    codigo_identificacao: string
                    consultoria_id: string
                    criado_em?: string | null
                    id?: string
                    logotipo_url?: string | null
                    nome_fantasia: string
                    razao_social: string
                    setor?: string | null
                    tamanho?: string | null
                }
                Update: {
                    ativo?: boolean | null
                    cnpj?: string
                    codigo_identificacao?: string
                    consultoria_id?: string
                    criado_em?: string | null
                    id?: string
                    logotipo_url?: string | null
                    nome_fantasia?: string
                    razao_social?: string
                    setor?: string | null
                    tamanho?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "empresas_clientes_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                ]
            }
            identidades_empresariais: {
                Row: {
                    consultoria_id: string
                    criado_em: string
                    criado_por_usuario_id: string | null
                    empresa_cliente_id: string
                    evp: string | null
                    id: string
                    missao: string | null
                    notas_internas: string | null
                    principios_culturais: Json | null
                    proposito: string | null
                    valores: Json | null
                    versao: number
                    visao: string | null
                }
                Insert: {
                    consultoria_id: string
                    criado_em?: string
                    criado_por_usuario_id?: string | null
                    empresa_cliente_id: string
                    evp?: string | null
                    id?: string
                    missao?: string | null
                    notas_internas?: string | null
                    principios_culturais?: Json | null
                    proposito?: string | null
                    valores?: Json | null
                    versao?: number
                    visao?: string | null
                }
                Update: {
                    consultoria_id?: string
                    criado_em?: string
                    criado_por_usuario_id?: string | null
                    empresa_cliente_id?: string
                    evp?: string | null
                    id?: string
                    missao?: string | null
                    notas_internas?: string | null
                    principios_culturais?: Json | null
                    proposito?: string | null
                    valores?: Json | null
                    versao?: number
                    visao?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "identidades_empresariais_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "identidades_empresariais_criado_por_usuario_id_fkey"
                        columns: ["criado_por_usuario_id"]
                        isOneToOne: false
                        referencedRelation: "usuarios"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "identidades_empresariais_empresa_cliente_id_fkey"
                        columns: ["empresa_cliente_id"]
                        isOneToOne: false
                        referencedRelation: "empresas_clientes"
                        referencedColumns: ["id"]
                    },
                ]
            }
            pagamentos: {
                Row: {
                    assinatura_id: string | null
                    consultoria_id: string
                    criado_em: string | null
                    data_pagamento: string
                    gateway: string | null
                    gateway_transaction_id: string | null
                    id: string
                    metodo_pagamento: string | null
                    moeda: string | null
                    nota_fiscal_url: string | null
                    status: string
                    valor_centavos: number
                }
                Insert: {
                    assinatura_id?: string | null
                    consultoria_id: string
                    criado_em?: string | null
                    data_pagamento: string
                    gateway?: string | null
                    gateway_transaction_id?: string | null
                    id?: string
                    metodo_pagamento?: string | null
                    moeda?: string | null
                    nota_fiscal_url?: string | null
                    status: string
                    valor_centavos: number
                }
                Update: {
                    assinatura_id?: string | null
                    consultoria_id?: string
                    criado_em?: string | null
                    data_pagamento?: string
                    gateway?: string | null
                    gateway_transaction_id?: string | null
                    id?: string
                    metodo_pagamento?: string | null
                    moeda?: string | null
                    nota_fiscal_url?: string | null
                    status?: string
                    valor_centavos?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "pagamentos_assinatura_id_fkey"
                        columns: ["assinatura_id"]
                        isOneToOne: false
                        referencedRelation: "assinaturas"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "pagamentos_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                ]
            }
            planos: {
                Row: {
                    ativo: boolean | null
                    criado_em: string | null
                    descricao: string | null
                    funcionalidades: Json | null
                    id: string
                    intervalo: string | null
                    limite_empresas: number | null
                    limite_usuarios: number | null
                    nome: string
                    preco_centavos: number
                }
                Insert: {
                    ativo?: boolean | null
                    criado_em?: string | null
                    descricao?: string | null
                    funcionalidades?: Json | null
                    id?: string
                    intervalo?: string | null
                    limite_empresas?: number | null
                    limite_usuarios?: number | null
                    nome: string
                    preco_centavos: number
                }
                Update: {
                    ativo?: boolean | null
                    criado_em?: string | null
                    descricao?: string | null
                    funcionalidades?: Json | null
                    id?: string
                    intervalo?: string | null
                    limite_empresas?: number | null
                    limite_usuarios?: number | null
                    nome?: string
                    preco_centavos?: number
                }
                Relationships: []
            }
            unidades_organizacionais: {
                Row: {
                    ativo: boolean | null
                    consultoria_id: string
                    criado_em: string | null
                    descricao: string | null
                    empresa_cliente_id: string
                    id: string
                    nome: string
                    responsavel_id: string | null
                    tipo: string
                }
                Insert: {
                    ativo?: boolean | null
                    consultoria_id: string
                    criado_em?: string | null
                    descricao?: string | null
                    empresa_cliente_id: string
                    id?: string
                    nome: string
                    responsavel_id?: string | null
                    tipo: string
                }
                Update: {
                    ativo?: boolean | null
                    consultoria_id?: string
                    criado_em?: string | null
                    descricao?: string | null
                    empresa_cliente_id?: string
                    id?: string
                    nome?: string
                    responsavel_id?: string | null
                    tipo?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "unidades_organizacionais_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unidades_organizacionais_empresa_cliente_id_fkey"
                        columns: ["empresa_cliente_id"]
                        isOneToOne: false
                        referencedRelation: "empresas_clientes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unidades_organizacionais_responsavel_id_fkey"
                        columns: ["responsavel_id"]
                        isOneToOne: false
                        referencedRelation: "colaboradores"
                        referencedColumns: ["id"]
                    },
                ]
            }
            usuarios: {
                Row: {
                    ativo: boolean | null
                    auth_user_id: string
                    cargo: string | null
                    consultoria_id: string | null
                    criado_em: string | null
                    email: string
                    id: string
                    nome: string
                    role: string | null
                    role_plataforma: string | null
                    telefone: string | null
                    ultimo_acesso: string | null
                }
                Insert: {
                    ativo?: boolean | null
                    auth_user_id: string
                    cargo?: string | null
                    consultoria_id?: string | null
                    criado_em?: string | null
                    email: string
                    id?: string
                    nome: string
                    role?: string | null
                    role_plataforma?: string | null
                    telefone?: string | null
                    ultimo_acesso?: string | null
                }
                Update: {
                    ativo?: boolean | null
                    auth_user_id?: string
                    cargo?: string | null
                    consultoria_id?: string | null
                    criado_em?: string | null
                    email?: string
                    id?: string
                    nome?: string
                    role?: string | null
                    role_plataforma?: string | null
                    telefone?: string | null
                    ultimo_acesso?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "usuarios_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                ]
            }
            usuarios_empresa: {
                Row: {
                    ativo: boolean | null
                    atualizado_em: string | null
                    auth_user_id: string
                    consultoria_id: string
                    criado_em: string | null
                    email: string
                    empresa_cliente_id: string
                    id: string
                    nome: string
                    primeiro_login: boolean | null
                    role_empresa: string
                }
                Insert: {
                    ativo?: boolean | null
                    atualizado_em?: string | null
                    auth_user_id: string
                    consultoria_id: string
                    criado_em?: string | null
                    email: string
                    empresa_cliente_id: string
                    id?: string
                    nome: string
                    primeiro_login?: boolean | null
                    role_empresa?: string
                }
                Update: {
                    ativo?: boolean | null
                    atualizado_em?: string | null
                    auth_user_id?: string
                    consultoria_id?: string
                    criado_em?: string | null
                    email?: string
                    empresa_cliente_id?: string
                    id?: string
                    nome?: string
                    primeiro_login?: boolean | null
                    role_empresa?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "usuarios_empresa_consultoria_id_fkey"
                        columns: ["consultoria_id"]
                        isOneToOne: false
                        referencedRelation: "consultorias"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "usuarios_empresa_empresa_cliente_id_fkey"
                        columns: ["empresa_cliente_id"]
                        isOneToOne: false
                        referencedRelation: "empresas_clientes"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_current_user_info: {
                Args: Record<PropertyKey, never>
                Returns: {
                    user_id: string
                    user_type: string
                    user_name: string
                    user_email: string
                    consultoria_id: string
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
