import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import {
    CreditCard, TrendingUp, TrendingDown, DollarSign,
    AlertCircle, CheckCircle, Clock, ChevronDown, Plus,
    X, Search
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface ConsultoriaBilling {
    id: string;
    nome: string;
    assinatura: {
        id: string;
        status: string;
        valor_cobranca_centavos: number;
        ciclo: string;
        proxima_cobranca: string | null;
        plano: { nome: string } | null;
    } | null;
}

interface OperacaoFinanceira {
    id: string;
    tipo: string;
    valor_centavos: number;
    justificativa: string;
    criado_em: string;
    consultoria: { nome: string };
}

export default function PainelFinanceiro() {
    const { userProfile } = useAuth();
    const [consultorias, setConsultorias] = useState<ConsultoriaBilling[]>([]);
    const [operacoes, setOperacoes] = useState<OperacaoFinanceira[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [showOperacaoModal, setShowOperacaoModal] = useState(false);
    const [selectedConsultoria, setSelectedConsultoria] = useState<ConsultoriaBilling | null>(null);
    const [operacaoForm, setOperacaoForm] = useState({
        tipo: 'credito',
        valor: '',
        justificativa: '',
    });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch consultorias with billing info
            const { data: consultoriasData } = await supabase
                .from('consultorias')
                .select(`
                    id, nome,
                    assinaturas(id, status, valor_cobranca_centavos, ciclo, proxima_cobranca, plano:planos(nome))
                `)
                .order('nome');

            const mapped = (consultoriasData || []).map(c => ({
                ...c,
                assinatura: c.assinaturas?.[0] || null,
            }));

            setConsultorias(mapped);

            // Fetch recent operations
            const { data: operacoesData } = await supabase
                .from('operacoes_financeiras')
                .select(`
                    id, tipo, valor_centavos, justificativa, criado_em,
                    consultoria:consultorias(nome)
                `)
                .order('criado_em', { ascending: false })
                .limit(10);

            setOperacoes(operacoesData || []);
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOperacao = async () => {
        if (!selectedConsultoria || !operacaoForm.justificativa.trim()) return;
        setActionLoading(true);

        try {
            const { error } = await supabase.from('operacoes_financeiras').insert({
                consultoria_id: selectedConsultoria.id,
                tipo: operacaoForm.tipo,
                valor_centavos: parseFloat(operacaoForm.valor || '0') * 100,
                justificativa: operacaoForm.justificativa,
                executado_por: userProfile?.id,
                executado_por_tipo: 'superadmin',
            });

            if (error) throw error;

            await fetchData();
            setShowOperacaoModal(false);
            setSelectedConsultoria(null);
            setOperacaoForm({ tipo: 'credito', valor: '', justificativa: '' });
        } catch (error) {
            console.error('Error creating operation:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    // Calculate metrics
    const totalMRR = consultorias.reduce((acc, c) => {
        if (c.assinatura?.status === 'ativa') {
            return acc + (c.assinatura.valor_cobranca_centavos || 0);
        }
        return acc;
    }, 0);

    const assinaturasAtivas = consultorias.filter(c => c.assinatura?.status === 'ativa').length;
    const assinaturasInadimplentes = consultorias.filter(c => c.assinatura?.status === 'inadimplente').length;
    const semAssinatura = consultorias.filter(c => !c.assinatura).length;

    const filteredConsultorias = consultorias.filter(c => {
        const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'todos' ||
            (statusFilter === 'ativa' && c.assinatura?.status === 'ativa') ||
            (statusFilter === 'inadimplente' && c.assinatura?.status === 'inadimplente') ||
            (statusFilter === 'cancelada' && c.assinatura?.status === 'cancelada') ||
            (statusFilter === 'sem' && !c.assinatura);
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string | undefined) => {
        const configs: Record<string, { color: string; label: string }> = {
            ativa: { color: 'bg-emerald-100 text-emerald-700', label: 'Ativa' },
            inadimplente: { color: 'bg-red-100 text-red-700', label: 'Inadimplente' },
            cancelada: { color: 'bg-gray-100 text-gray-700', label: 'Cancelada' },
            trial: { color: 'bg-blue-100 text-blue-700', label: 'Trial' },
        };
        const config = configs[status || ''] || { color: 'bg-gray-100 text-gray-500', label: 'Sem assinatura' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
    };

    const getTipoOperacaoBadge = (tipo: string) => {
        const configs: Record<string, { color: string; label: string }> = {
            credito: { color: 'bg-emerald-100 text-emerald-700', label: 'Crédito' },
            desconto: { color: 'bg-blue-100 text-blue-700', label: 'Desconto' },
            cancelamento: { color: 'bg-red-100 text-red-700', label: 'Cancelamento' },
            pagamento_manual: { color: 'bg-violet-100 text-violet-700', label: 'Pagamento Manual' },
            ajuste: { color: 'bg-amber-100 text-amber-700', label: 'Ajuste' },
        };
        const config = configs[tipo] || { color: 'bg-gray-100 text-gray-700', label: tipo };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
    };

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
                <h1 className="text-3xl font-bold text-gray-900">Painel Financeiro</h1>
                <p className="text-gray-500 mt-1">Visão geral de faturamento e operações financeiras</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-200 text-sm">MRR</p>
                            <p className="text-3xl font-bold mt-1">{formatCurrency(totalMRR)}</p>
                            <p className="text-violet-200 text-xs mt-2">Receita mensal recorrente</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-violet-300" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Assinaturas Ativas</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{assinaturasAtivas}</p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Inadimplentes</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{assinaturasInadimplentes}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Sem Assinatura</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{semAssinatura}</p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-lg">
                            <Clock className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Consultorias List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar consultoria..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main/20"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2"
                            >
                                <option value="todos">Todos</option>
                                <option value="ativa">Ativas</option>
                                <option value="inadimplente">Inadimplentes</option>
                                <option value="cancelada">Canceladas</option>
                                <option value="sem">Sem assinatura</option>
                            </select>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {filteredConsultorias.map((c) => (
                            <div key={c.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{c.nome}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getStatusBadge(c.assinatura?.status)}
                                        {c.assinatura?.plano?.nome && (
                                            <span className="text-xs text-gray-500">• {c.assinatura.plano.nome}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {c.assinatura?.valor_cobranca_centavos ? (
                                        <p className="font-semibold text-gray-900">
                                            {formatCurrency(c.assinatura.valor_cobranca_centavos)}
                                            <span className="text-xs text-gray-400 font-normal">/{c.assinatura.ciclo === 'anual' ? 'ano' : 'mês'}</span>
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 text-sm">-</p>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedConsultoria(c);
                                            setShowOperacaoModal(true);
                                        }}
                                        className="text-xs text-primary-main hover:underline mt-1"
                                    >
                                        + Operação
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Operations */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Operações Recentes</h2>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {operacoes.length > 0 ? operacoes.map((op) => (
                            <div key={op.id} className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    {getTipoOperacaoBadge(op.tipo)}
                                    {op.valor_centavos > 0 && (
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatCurrency(op.valor_centavos)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{op.consultoria?.nome}</p>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{op.justificativa}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatDate(op.criado_em)}</p>
                            </div>
                        )) : (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                Nenhuma operação registrada
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Operation Modal */}
            {showOperacaoModal && selectedConsultoria && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowOperacaoModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Nova Operação Financeira</h3>
                                <p className="text-sm text-gray-500">{selectedConsultoria.nome}</p>
                            </div>
                            <button onClick={() => setShowOperacaoModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Operação</label>
                                <select
                                    value={operacaoForm.tipo}
                                    onChange={(e) => setOperacaoForm({ ...operacaoForm, tipo: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
                                >
                                    <option value="credito">Crédito</option>
                                    <option value="desconto">Desconto</option>
                                    <option value="pagamento_manual">Pagamento Manual</option>
                                    <option value="ajuste">Ajuste</option>
                                    <option value="cancelamento">Cancelamento</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={operacaoForm.valor}
                                    onChange={(e) => setOperacaoForm({ ...operacaoForm, valor: e.target.value })}
                                    placeholder="0,00"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Justificativa *</label>
                                <textarea
                                    value={operacaoForm.justificativa}
                                    onChange={(e) => setOperacaoForm({ ...operacaoForm, justificativa: e.target.value })}
                                    placeholder="Descreva o motivo..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <Button variant="ghost" onClick={() => setShowOperacaoModal(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleCreateOperacao}
                                disabled={!operacaoForm.justificativa.trim() || actionLoading}
                            >
                                {actionLoading ? 'Salvando...' : 'Registrar Operação'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
