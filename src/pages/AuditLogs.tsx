import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { auditService } from '../services/auditService';
import { Database } from '../lib/database.types';
import { History, Search, FileText, User } from 'lucide-react';

type AuditLog = Database['public']['Tables']['audit_log']['Row'];

export default function AuditLogs() {
    const { empresaAtiva } = useWorkspace();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (empresaAtiva) {
            loadLogs();
        }
    }, [empresaAtiva?.id]);

    const loadLogs = async () => {
        if (!empresaAtiva) return;
        setLoading(true);
        try {
            const data = await auditService.getAuditLogs(empresaAtiva.id);
            setLogs(data || []);
        } catch (error) {
            console.error('Error loading audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-gray900">Logs de Auditoria</h1>
                <p className="text-sm text-neutral-gray500 mt-1">
                    Histórico de atividades e mudanças no sistema
                </p>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-neutral-gray500">
                        Carregando histórico...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-neutral-gray900">Nenhum registro encontrado</h3>
                        <p className="text-neutral-gray500">As atividades aparecerão aqui.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${log.acao === 'INSERT' ? 'bg-green-50 text-green-600' :
                                        log.acao === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                                            'bg-red-50 text-red-600'
                                    }`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-neutral-gray900">
                                                <span className="uppercase text-xs font-bold tracking-wider opacity-70 mr-2">
                                                    {log.acao}
                                                </span>
                                                {log.tabela}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-neutral-gray500">
                                                <User className="w-3 h-3" />
                                                <span>{log.user_name} ({log.user_email})</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>{new Date(log.criado_em || '').toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Diff visualization could go here */}
                                    {log.campos_alterados && log.campos_alterados.length > 0 && (
                                        <div className="mt-3 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <p className="text-xs font-semibold text-neutral-gray500 uppercase mb-1">
                                                Campos alterados
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {log.campos_alterados.map(campo => (
                                                    <span key={campo} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-neutral-gray700 font-mono">
                                                        {campo}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
