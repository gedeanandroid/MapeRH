import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import {
    FileText, Search, Filter, Calendar, User,
    ChevronDown, Download, Eye, Clock, RefreshCw
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface AuditLog {
    id: string;
    usuario_id: string | null;
    usuario_email: string | null;
    acao: string;
    tabela: string;
    registro_id: string | null;
    dados_anteriores: any;
    dados_novos: any;
    descricao: string | null;
    criado_em: string;
    ip_address: string | null;
}

interface ImpersonationLog {
    id: string;
    superadmin_id: string;
    target_user_id: string;
    target_user_email: string;
    reason: string | null;
    started_at: string;
    ended_at: string | null;
}

export default function AuditoriaSistema() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [impersonationLogs, setImpersonationLogs] = useState<ImpersonationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'audit' | 'impersonation' | 'login'>('audit');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('7d');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        fetchLogs();
    }, [dateFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const daysAgo = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - daysAgo);

            // Fetch audit logs
            const { data: auditData } = await supabase
                .from('audit_log')
                .select('*')
                .gte('criado_em', fromDate.toISOString())
                .order('criado_em', { ascending: false })
                .limit(100);

            setLogs(auditData || []);

            // Fetch impersonation logs
            const { data: impersonData } = await supabase
                .from('audit_impersonation')
                .select('*')
                .gte('started_at', fromDate.toISOString())
                .order('started_at', { ascending: false })
                .limit(50);

            setImpersonationLogs(impersonData || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('pt-BR');
    };

    const getActionColor = (acao: string) => {
        if (acao.includes('CREATE') || acao.includes('INSERT')) return 'bg-emerald-100 text-emerald-700';
        if (acao.includes('UPDATE')) return 'bg-blue-100 text-blue-700';
        if (acao.includes('DELETE')) return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    const exportToCSV = () => {
        const headers = ['Data', 'Email', 'Ação', 'Tabela', 'Descrição'];
        const rows = logs.map(log => [
            formatDate(log.criado_em),
            log.usuario_email || '-',
            log.acao,
            log.tabela,
            log.descricao || '-'
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredLogs = logs.filter(log =>
        log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.tabela.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.usuario_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Auditoria do Sistema</h1>
                    <p className="text-gray-500 mt-1">Logs de atividades e segurança</p>
                </div>
                <Button variant="outline" onClick={exportToCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { key: 'audit', label: 'Logs de Auditoria', count: logs.length },
                    { key: 'impersonation', label: 'Impersonation', count: impersonationLogs.length },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-primary-main text-primary-main'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main/20"
                    />
                </div>
                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-4 py-2"
                >
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="90d">Últimos 90 dias</option>
                </select>
                <Button variant="ghost" onClick={fetchLogs}>
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Data</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Usuário</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ação</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tabela</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Descrição</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(log.criado_em)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {log.usuario_email || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.acao)}`}>
                                            {log.acao}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                                        {log.tabela}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {log.descricao || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <Eye className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLogs.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Nenhum log encontrado</p>
                        </div>
                    )}
                </div>
            )}

            {/* Impersonation Tab */}
            {activeTab === 'impersonation' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Início</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Usuário Assumido</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Motivo</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {impersonationLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(log.started_at)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {log.target_user_email}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        {log.reason || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.ended_at ? (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                Encerrado
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                                                Ativo
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {impersonationLogs.length === 0 && (
                        <div className="text-center py-12">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Nenhuma sessão de impersonation</p>
                        </div>
                    )}
                </div>
            )}

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Detalhes do Log</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Data</p>
                                    <p className="font-medium">{formatDate(selectedLog.criado_em)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Usuário</p>
                                    <p className="font-medium">{selectedLog.usuario_email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ação</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.acao)}`}>
                                        {selectedLog.acao}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tabela</p>
                                    <p className="font-mono text-sm">{selectedLog.tabela}</p>
                                </div>
                            </div>
                            {selectedLog.dados_anteriores && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Dados Anteriores</p>
                                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                                        {JSON.stringify(selectedLog.dados_anteriores, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {selectedLog.dados_novos && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Dados Novos</p>
                                    <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                                        {JSON.stringify(selectedLog.dados_novos, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
