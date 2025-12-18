import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import {
    Settings, ToggleLeft, ToggleRight, Save, Shield,
    Mail, CreditCard, Clock, AlertCircle
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface Config {
    id: string;
    chave: string;
    valor: any;
    descricao: string;
}

interface FeatureFlag {
    id: string;
    nome: string;
    ativo: boolean;
    descricao: string;
}

export default function Configuracoes() {
    const { userProfile } = useAuth();
    const [configs, setConfigs] = useState<Config[]>([]);
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: configsData } = await supabase
                .from('configuracoes_globais')
                .select('*')
                .order('chave');

            const { data: flagsData } = await supabase
                .from('feature_flags')
                .select('*')
                .order('nome');

            setConfigs(configsData || []);
            setFeatureFlags(flagsData || []);
        } catch (error) {
            console.error('Error fetching configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFlag = async (flag: FeatureFlag) => {
        try {
            const { error } = await supabase
                .from('feature_flags')
                .update({ ativo: !flag.ativo, atualizado_em: new Date().toISOString() })
                .eq('id', flag.id);

            if (error) throw error;

            setFeatureFlags(prev =>
                prev.map(f => f.id === flag.id ? { ...f, ativo: !f.ativo } : f)
            );

            setMessage({ type: 'success', text: `Feature "${flag.nome}" ${!flag.ativo ? 'ativada' : 'desativada'}` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error toggling flag:', error);
            setMessage({ type: 'error', text: 'Erro ao alterar feature flag' });
        }
    };

    const handleUpdateConfig = async (config: Config, newValue: any) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('configuracoes_globais')
                .update({
                    valor: newValue,
                    atualizado_por: userProfile?.id,
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', config.id);

            if (error) throw error;

            setConfigs(prev =>
                prev.map(c => c.id === config.id ? { ...c, valor: newValue } : c)
            );

            setMessage({ type: 'success', text: 'Configuração atualizada' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error updating config:', error);
            setMessage({ type: 'error', text: 'Erro ao atualizar configuração' });
        } finally {
            setSaving(false);
        }
    };

    const getConfigIcon = (chave: string) => {
        if (chave.includes('seguranca')) return Shield;
        if (chave.includes('email')) return Mail;
        if (chave.includes('pagamento')) return CreditCard;
        if (chave.includes('impersonation')) return Clock;
        return Settings;
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
                <h1 className="text-3xl font-bold text-gray-900">Configurações Globais</h1>
                <p className="text-gray-500 mt-1">Parâmetros da plataforma e feature flags</p>
            </div>

            {/* Message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                >
                    {message.text}
                </motion.div>
            )}

            {/* Feature Flags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Feature Flags</h2>
                    <p className="text-sm text-gray-500">Ativar ou desativar módulos da plataforma</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {featureFlags.map((flag) => (
                        <div key={flag.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                            <div>
                                <p className="font-medium text-gray-900">{flag.nome}</p>
                                <p className="text-sm text-gray-500">{flag.descricao}</p>
                            </div>
                            <button
                                onClick={() => handleToggleFlag(flag)}
                                className="focus:outline-none"
                            >
                                {flag.ativo ? (
                                    <ToggleRight className="w-10 h-10 text-emerald-500" />
                                ) : (
                                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Global Configs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Parâmetros do Sistema</h2>
                    <p className="text-sm text-gray-500">Configurações gerais da plataforma</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {configs.map((config) => {
                        const Icon = getConfigIcon(config.chave);
                        return (
                            <div key={config.id} className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{config.chave}</p>
                                        <p className="text-sm text-gray-500 mb-3">{config.descricao}</p>

                                        {/* Render based on config type */}
                                        {config.chave === 'seguranca_login' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Máx. Tentativas</label>
                                                    <input
                                                        type="number"
                                                        value={config.valor.max_tentativas || 5}
                                                        onChange={(e) => handleUpdateConfig(config, {
                                                            ...config.valor,
                                                            max_tentativas: parseInt(e.target.value)
                                                        })}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Bloqueio (min)</label>
                                                    <input
                                                        type="number"
                                                        value={config.valor.bloqueio_minutos || 15}
                                                        onChange={(e) => handleUpdateConfig(config, {
                                                            ...config.valor,
                                                            bloqueio_minutos: parseInt(e.target.value)
                                                        })}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="mfa"
                                                        checked={config.valor.mfa_obrigatorio_admin || false}
                                                        onChange={(e) => handleUpdateConfig(config, {
                                                            ...config.valor,
                                                            mfa_obrigatorio_admin: e.target.checked
                                                        })}
                                                        className="w-4 h-4 text-primary-main"
                                                    />
                                                    <label htmlFor="mfa" className="text-sm text-gray-700">MFA obrigatório p/ admin</label>
                                                </div>
                                            </div>
                                        )}

                                        {config.chave === 'impersonation' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Tempo Limite (min)</label>
                                                    <input
                                                        type="number"
                                                        value={config.valor.tempo_limite_minutos || 30}
                                                        onChange={(e) => handleUpdateConfig(config, {
                                                            ...config.valor,
                                                            tempo_limite_minutos: parseInt(e.target.value)
                                                        })}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="justificativa"
                                                        checked={config.valor.justificativa_obrigatoria || false}
                                                        onChange={(e) => handleUpdateConfig(config, {
                                                            ...config.valor,
                                                            justificativa_obrigatoria: e.target.checked
                                                        })}
                                                        className="w-4 h-4 text-primary-main"
                                                    />
                                                    <label htmlFor="justificativa" className="text-sm text-gray-700">Justificativa obrigatória</label>
                                                </div>
                                            </div>
                                        )}

                                        {config.chave === 'limites_plano_default' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Máx. Empresas (padrão)</label>
                                                    <input
                                                        type="number"
                                                        value={config.valor.max_empresas || 5}
                                                        onChange={(e) => handleUpdateConfig(config, {
                                                            ...config.valor,
                                                            max_empresas: parseInt(e.target.value)
                                                        })}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Máx. Usuários Cliente</label>
                                                    <input
                                                        type="number"
                                                        value={config.valor.max_usuarios_cliente || 20}
                                                        onChange={(e) => handleUpdateConfig(config, {
                                                            ...config.valor,
                                                            max_usuarios_cliente: parseInt(e.target.value)
                                                        })}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {(config.chave === 'email_provider' || config.chave === 'gateway_pagamento') && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <pre className="text-xs text-gray-600">
                                                    {JSON.stringify(config.valor, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-amber-800">Atenção</p>
                    <p className="text-sm text-amber-700">
                        Alterações nas configurações globais afetam toda a plataforma. Todas as mudanças são registradas no log de auditoria.
                    </p>
                </div>
            </div>
        </div>
    );
}
