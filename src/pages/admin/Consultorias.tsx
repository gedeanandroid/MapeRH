import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import {
    Building, Search, Filter, MoreVertical, Eye, Ban,
    CheckCircle, AlertTriangle, Users, Briefcase, ChevronDown,
    X, Settings2, CreditCard
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface Consultoria {
    id: string;
    nome: string;
    nome_fantasia: string | null;
    status: string | null;
    perfil_completo: boolean;
    criado_em: string;
    usuarios: { id: string; nome: string; email: string }[];
    empresas_count: number;
    assinatura: {
        status: string;
        plano: { nome: string } | null;
    } | null;
}

export default function Consultorias() {
    const { userProfile } = useAuth();
    const [consultorias, setConsultorias] = useState<Consultoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('todos');
    const [selectedConsultoria, setSelectedConsultoria] = useState<Consultoria | null>(null);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchConsultorias();
    }, []);

    const fetchConsultorias = async () => {
        try {
            const { data, error } = await supabase
                .from('consultorias')
                .select(`
                    id, nome, nome_fantasia, status, perfil_completo, criado_em,
                    usuarios!usuarios_consultoria_id_fkey(id, nome, email),
                    assinaturas(status, plano:planos(nome))
                `)
                .order('criado_em', { ascending: false });

            if (error) throw error;

            // Fetch empresas count for each consultoria
            const consultoriasWithCount = await Promise.all(
                (data || []).map(async (c) => {
                    const { count } = await supabase
                        .from('empresas_clientes')
                        .select('id', { count: 'exact', head: true })
                        .eq('consultoria_id', c.id);

                    return {
                        ...c,
                        empresas_count: count || 0,
                        assinatura: c.assinaturas?.[0] || null,
                    };
                })
            );

            setConsultorias(consultoriasWithCount);
        } catch (error) {
            console.error('Error fetching consultorias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (consultoriaId: string) => {
        if (!suspendReason.trim()) return;
        setActionLoading(true);

        try {
            const { error } = await supabase
                .from('consultorias')
                .update({
                    status: 'suspenso',
                    suspenso_em: new Date().toISOString(),
                    suspenso_por: userProfile?.id,
                    motivo_suspensao: suspendReason,
                })
                .eq('id', consultoriaId);

            if (error) throw error;

            await fetchConsultorias();
            setShowSuspendModal(false);
            setSuspendReason('');
            setSelectedConsultoria(null);
        } catch (error) {
            console.error('Error suspending consultoria:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivate = async (consultoriaId: string) => {
        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('consultorias')
                .update({
                    status: 'ativo',
                    suspenso_em: null,
                    suspenso_por: null,
                    motivo_suspensao: null,
                })
                .eq('id', consultoriaId);

            if (error) throw error;
            await fetchConsultorias();
            setShowActionsMenu(null);
        } catch (error) {
            console.error('Error reactivating consultoria:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string | null) => {
        const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
            ativo: { color: 'bg-emerald-100 text-emerald-700', label: 'Ativo', icon: CheckCircle },
            trial: { color: 'bg-blue-100 text-blue-700', label: 'Trial', icon: AlertTriangle },
            suspenso: { color: 'bg-red-100 text-red-700', label: 'Suspenso', icon: Ban },
            cancelado: { color: 'bg-gray-100 text-gray-700', label: 'Cancelado', icon: X },
        };

        const config = statusConfig[status || 'ativo'] || statusConfig.ativo;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const filteredConsultorias = consultorias.filter(c => {
        const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.usuarios?.some(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'todos' ||
            (statusFilter === 'ativo' && (!c.status || c.status === 'ativo')) ||
            c.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Consultorias</h1>
                <p className="text-gray-500 mt-1">Gerencie todas as consultorias da plataforma</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                    >
                        <option value="todos">Todos os status</option>
                        <option value="ativo">Ativos</option>
                        <option value="trial">Em Trial</option>
                        <option value="suspenso">Suspensos</option>
                        <option value="cancelado">Cancelados</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{consultorias.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <p className="text-sm text-emerald-600">Ativas</p>
                    <p className="text-2xl font-bold text-emerald-700">
                        {consultorias.filter(c => !c.status || c.status === 'ativo').length}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-600">Em Trial</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {consultorias.filter(c => c.status === 'trial').length}
                    </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <p className="text-sm text-red-600">Suspensas</p>
                    <p className="text-2xl font-bold text-red-700">
                        {consultorias.filter(c => c.status === 'suspenso').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Consultoria</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Consultor</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Plano</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Empresas</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredConsultorias.map((consultoria) => (
                            <tr key={consultoria.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{consultoria.nome}</p>
                                        {consultoria.nome_fantasia && (
                                            <p className="text-sm text-gray-500">{consultoria.nome_fantasia}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {consultoria.usuarios?.[0] ? (
                                        <div>
                                            <p className="text-sm text-gray-900">{consultoria.usuarios[0].nome}</p>
                                            <p className="text-xs text-gray-500">{consultoria.usuarios[0].email}</p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {consultoria.assinatura?.plano?.nome ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                                            <CreditCard className="w-3 h-3" />
                                            {consultoria.assinatura.plano.nome}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Sem plano</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700">{consultoria.empresas_count}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(consultoria.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative inline-block">
                                        <button
                                            onClick={() => setShowActionsMenu(showActionsMenu === consultoria.id ? null : consultoria.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <AnimatePresence>
                                            {showActionsMenu === consultoria.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setSelectedConsultoria(consultoria);
                                                            setShowActionsMenu(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver Detalhes
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Settings2 className="w-4 h-4" />
                                                        Ajustar Limites
                                                    </button>
                                                    {(!consultoria.status || consultoria.status === 'ativo') ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedConsultoria(consultoria);
                                                                setShowSuspendModal(true);
                                                                setShowActionsMenu(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                            Suspender
                                                        </button>
                                                    ) : consultoria.status === 'suspenso' && (
                                                        <button
                                                            onClick={() => handleReactivate(consultoria.id)}
                                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Reativar
                                                        </button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredConsultorias.length === 0 && (
                    <div className="text-center py-12">
                        <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma consultoria encontrada</p>
                    </div>
                )}
            </div>

            {/* Suspend Modal */}
            <AnimatePresence>
                {showSuspendModal && selectedConsultoria && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowSuspendModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-md m-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Ban className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Suspender Consultoria</h3>
                                        <p className="text-sm text-gray-500">{selectedConsultoria.nome}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Motivo da Suspensão *
                                    </label>
                                    <textarea
                                        value={suspendReason}
                                        onChange={(e) => setSuspendReason(e.target.value)}
                                        placeholder="Descreva o motivo da suspensão..."
                                        rows={3}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    />
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-sm text-amber-800">
                                        ⚠️ A consultoria perderá acesso ao sistema até ser reativada.
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowSuspendModal(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => handleSuspend(selectedConsultoria.id)}
                                    disabled={!suspendReason.trim() || actionLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {actionLoading ? 'Suspendendo...' : 'Confirmar Suspensão'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
