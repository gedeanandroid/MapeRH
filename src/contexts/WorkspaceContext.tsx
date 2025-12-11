import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface EmpresaCliente {
    id: string;
    consultoria_id: string;
    nome: string;
    nome_fantasia?: string;
    cnpj?: string;
    email_contato?: string;
    telefone?: string;
    segmento?: string;
    tamanho_estimado?: string;
    status: 'ativa' | 'inativa';
    criado_em: string;
    atualizado_em: string;
}

interface WorkspaceContextType {
    empresaAtiva: EmpresaCliente | null;
    setEmpresaAtiva: (empresa: EmpresaCliente | null) => void;
    clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'maperh_empresa_ativa';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [empresaAtiva, setEmpresaAtivaState] = useState<EmpresaCliente | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setEmpresaAtivaState(JSON.parse(stored));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    const setEmpresaAtiva = (empresa: EmpresaCliente | null) => {
        setEmpresaAtivaState(empresa);
        if (empresa) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(empresa));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const clearWorkspace = () => {
        setEmpresaAtivaState(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <WorkspaceContext.Provider value={{ empresaAtiva, setEmpresaAtiva, clearWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
