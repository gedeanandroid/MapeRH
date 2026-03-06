// ===========================================================
// Shared workspace interfaces — single source of truth
// Used across Employees, Positions, Competencies,
// OrganizationalStructure, and CompanyIdentity pages.
// ===========================================================

/** Represents an organizational unit (branch/office). */
export interface Unidade {
    id: string;
    nome: string;
    tipo?: string | null;
    cidade?: string | null;
    estado?: string | null;
    status?: string;
}

/** Represents a department within an organizational unit. */
export interface Departamento {
    id: string;
    nome: string;
    unidade_id: string;
    departamento_pai_id?: string | null;
    status?: string;
    unidade?: { nome: string };
    subdepartamentos?: Departamento[];
}

/** Represents a job position. */
export interface Cargo {
    id: string;
    nome: string;
    codigo?: string | null;
    nivel_organizacional?: string | null;
    nivel_senioridade?: string | null;
    missao?: string | null;
    responsabilidades?: string[];
    atividades?: string[];
    escolaridade_minima?: string | null;
    experiencia_minima?: string | null;
    idiomas?: string | null;
    conhecimentos_tecnicos?: string | null;
    outros_requisitos?: string | null;
    departamento_id?: string;
    unidade_id?: string | null;
    cargo_superior_id?: string | null;
    status?: string;
    departamento?: { nome: string; unidade?: { nome: string } };
    cargo_superior?: { nome: string };
}

/** Represents an employee / collaborator. */
export interface Colaborador {
    id: string;
    nome_completo: string;
    email?: string | null;
    telefone?: string | null;
    cpf?: string | null;
    data_nascimento?: string | null;
    unidade_id?: string | null;
    departamento_id: string;
    cargo_id: string;
    gestor_id?: string | null;
    local_trabalho?: string | null;
    data_admissao: string;
    tipo_vinculo: string;
    matricula?: string | null;
    jornada_padrao?: string | null;
    status: 'ativo' | 'desligado' | 'afastado';
    data_desligamento?: string | null;
    unidade?: { nome: string };
    departamento?: { nome: string };
    cargo?: { nome: string };
    gestor?: { nome_completo: string };
}

/** Competency entity. */
export interface Competencia {
    id: string;
    nome: string;
    tipo: 'tecnica' | 'comportamental' | 'organizacional';
    eixo_cha: 'C' | 'H' | 'A';
    descricao?: string | null;
    status?: string;
    niveis?: Nivel[];
}

/** Proficiency level for a competency. */
export interface Nivel {
    id?: string;
    nivel: number;
    nome: string;
    descricao: string;
}

/** Junction between Cargo and Competencia. */
export interface CargoCompetencia {
    id: string;
    cargo_id: string;
    competencia_empresa_id: string;
    nivel_desejado: number;
    obrigatoria?: boolean;
    competencia?: Competencia;
}
