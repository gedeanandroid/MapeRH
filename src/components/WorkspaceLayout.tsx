import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
    Building2, Home, Users, Briefcase, Target, Award, BarChart3,
    Settings, LogOut, ChevronDown, ArrowLeft, UserCog
} from 'lucide-react';

interface WorkspaceLayoutProps {
    children: ReactNode;
}

const menuItems = [
    { icon: Home, label: 'Visão Geral', path: '' },
    { icon: Building2, label: 'Identidade Empresarial', path: 'identidade' },
    { icon: Users, label: 'Estrutura Organizacional', path: 'estrutura' },
    { icon: Briefcase, label: 'Cargos', path: 'cargos' },
    { icon: Target, label: 'Competências', path: 'competencias' },
    { icon: UserCog, label: 'Colaboradores', path: 'colaboradores' },
    { icon: Award, label: 'Avaliação de Desempenho', path: 'avaliacao', disabled: true },
    { icon: BarChart3, label: 'Relatórios', path: 'relatorios', disabled: true },
];

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
    const { signOut } = useAuth();
    const { empresaAtiva, clearWorkspace } = useWorkspace();
    const navigate = useNavigate();

    const handleBackToDashboard = () => {
        clearWorkspace();
        navigate('/dashboard');
    };

    if (!empresaAtiva) {
        navigate('/dashboard');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
                {/* Logo */}
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={handleBackToDashboard}
                        className="flex items-center gap-2 text-sm text-neutral-gray600 hover:text-primary-main transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao painel
                    </button>
                </div>

                {/* Company Indicator */}
                <div className="p-4 border-b border-gray-100">
                    <div className="bg-primary-main/5 rounded-xl p-3">
                        <p className="text-xs text-neutral-gray500 mb-1">Empresa ativa</p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-main rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-neutral-gray900 truncate">
                                    {empresaAtiva.nome}
                                </p>
                                {empresaAtiva.segmento && (
                                    <p className="text-xs text-neutral-gray500 truncate">
                                        {empresaAtiva.segmento}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === `/workspace/${empresaAtiva.id}/${item.path}` ||
                                (item.path === '' && location.pathname === `/workspace/${empresaAtiva.id}`);

                            return (
                                <li key={item.path}>
                                    {item.disabled ? (
                                        <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-gray400 cursor-not-allowed">
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm">{item.label}</span>
                                            <span className="ml-auto text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">Em breve</span>
                                        </span>
                                    ) : (
                                        <Link
                                            to={`/workspace/${empresaAtiva.id}/${item.path}`}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                                ? 'bg-primary-main text-white'
                                                : 'text-neutral-gray700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 px-3 py-2.5 text-neutral-gray600 hover:text-red-600 transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
}
