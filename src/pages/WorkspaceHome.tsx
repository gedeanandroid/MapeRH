import React from 'react';
import { motion } from 'framer-motion';
import { useWorkspace } from '../contexts/WorkspaceContext';
import WorkspaceLayout from '../components/WorkspaceLayout';
import { Building2, Target, Users, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function WorkspaceHome() {
    const { empresaAtiva } = useWorkspace();

    if (!empresaAtiva) return null;

    const quickActions = [
        {
            icon: Building2,
            title: 'Identidade Empresarial',
            description: 'Configure missão, visão e valores da empresa',
            color: 'bg-blue-500',
            disabled: true,
        },
        {
            icon: Users,
            title: 'Estrutura Organizacional',
            description: 'Defina departamentos e hierarquia',
            color: 'bg-purple-500',
            disabled: true,
        },
        {
            icon: Briefcase,
            title: 'Cargos e Funções',
            description: 'Cadastre cargos e descrições de funções',
            color: 'bg-green-500',
            disabled: true,
        },
        {
            icon: Target,
            title: 'Competências',
            description: 'Mapeie competências técnicas e comportamentais',
            color: 'bg-orange-500',
            disabled: true,
        },
    ];

    const getTamanhoLabel = (tamanho?: string) => {
        switch (tamanho) {
            case 'ate_20': return 'Até 20 colaboradores';
            case '20_100': return '20 a 100 colaboradores';
            case '100_mais': return 'Mais de 100 colaboradores';
            default: return 'Não informado';
        }
    };

    return (
        <WorkspaceLayout>
            <div className="p-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 text-sm text-neutral-gray500 mb-2">
                        <Sparkles className="w-4 h-4" />
                        Workspace
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-gray900 mb-2">
                        {empresaAtiva.nome}
                    </h1>
                    <p className="text-neutral-gray600">
                        Gerencie todos os aspectos de RH desta empresa em um só lugar.
                    </p>
                </motion.div>

                {/* Company Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8"
                >
                    <h2 className="text-lg font-semibold text-neutral-gray900 mb-4">Informações da Empresa</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-neutral-gray500 mb-1">Nome fantasia</p>
                            <p className="font-medium text-neutral-gray900">
                                {empresaAtiva.nome_fantasia || empresaAtiva.nome}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-neutral-gray500 mb-1">Segmento</p>
                            <p className="font-medium text-neutral-gray900">
                                {empresaAtiva.segmento || 'Não informado'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-neutral-gray500 mb-1">Tamanho</p>
                            <p className="font-medium text-neutral-gray900">
                                {getTamanhoLabel(empresaAtiva.tamanho_estimado)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-neutral-gray500 mb-1">CNPJ</p>
                            <p className="font-medium text-neutral-gray900">
                                {empresaAtiva.cnpj || 'Não informado'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold text-neutral-gray900 mb-4">Módulos de RH</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <motion.div
                                    key={action.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 ${action.disabled ? 'opacity-60' : 'hover:shadow-md transition-shadow cursor-pointer'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-neutral-gray900">{action.title}</h3>
                                                {action.disabled && (
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                        Em breve
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-neutral-gray600">{action.description}</p>
                                        </div>
                                        {!action.disabled && (
                                            <ArrowRight className="w-5 h-5 text-neutral-gray400" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Welcome Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-gradient-to-br from-primary-main to-primary-dark rounded-2xl p-6 text-white"
                >
                    <h3 className="text-xl font-bold mb-2">Bem-vindo ao Workspace! 🎉</h3>
                    <p className="text-blue-100 mb-4">
                        Este é o espaço dedicado para gerenciar todos os aspectos de RH de {empresaAtiva.nome}.
                        Os módulos adicionais serão disponibilizados em breve.
                    </p>
                    <Button
                        variant="secondary"
                        className="!bg-white !text-primary-main hover:!bg-gray-100"
                    >
                        Saiba mais sobre os módulos
                    </Button>
                </motion.div>
            </div>
        </WorkspaceLayout>
    );
}
