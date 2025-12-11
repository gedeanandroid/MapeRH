import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    Target, Eye, Heart, Sparkles, Star, Clock, Edit3, Plus,
    Loader2, ChevronRight, History, X
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface Identidade {
    id: string;
    missao: string | null;
    visao: string | null;
    proposito: string | null;
    evp: string | null;
    valores: { nome: string; descricao?: string }[];
    principios_culturais: string[];
    notas_internas: string | null;
    versao: number;
    criado_em: string;
    criado_por_usuario_id: string | null;
}

interface FormData {
    missao: string;
    visao: string;
    proposito: string;
    evp: string;
    valores: { nome: string; descricao: string }[];
    principios_culturais: string[];
    notas_internas: string;
}

export default function CompanyIdentity() {
    const { empresaId } = useParams<{ empresaId: string }>();
    const { user } = useAuth();
    const [identidade, setIdentidade] = useState<Identidade | null>(null);
    const [historico, setHistorico] = useState<Identidade[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showHistorico, setShowHistorico] = useState(false);
    const [consultoriaId, setConsultoriaId] = useState<string | null>(null);
    const [usuarioId, setUsuarioId] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        missao: '',
        visao: '',
        proposito: '',
        evp: '',
        valores: [],
        principios_culturais: [],
        notas_internas: ''
    });

    useEffect(() => {
        fetchData();
    }, [empresaId, user]);

    const fetchData = async () => {
        if (!user || !empresaId) return;

        try {
            // Get user's consultoria_id and usuario_id
            const { data: userData } = await supabase
                .from('usuarios')
                .select('id, consultoria_id')
                .eq('auth_user_id', user.id)
                .single();

            if (userData) {
                setConsultoriaId(userData.consultoria_id);
                setUsuarioId(userData.id);
            }

            // Fetch latest identity version
            const { data: identidadeData, error } = await supabase
                .from('identidades_empresariais')
                .select('*')
                .eq('empresa_cliente_id', empresaId)
                .order('versao', { ascending: false })
                .limit(1)
                .single();

            if (!error && identidadeData) {
                setIdentidade(identidadeData);
            }

        } catch (error) {
            console.error('Error fetching identity:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistorico = async () => {
        if (!empresaId) return;

        const { data } = await supabase
            .from('identidades_empresariais')
            .select('*')
            .eq('empresa_cliente_id', empresaId)
            .order('versao', { ascending: false });

        if (data) {
            setHistorico(data);
        }
        setShowHistorico(true);
    };

    const handleEdit = () => {
        if (identidade) {
            setFormData({
                missao: identidade.missao || '',
                visao: identidade.visao || '',
                proposito: identidade.proposito || '',
                evp: identidade.evp || '',
                valores: identidade.valores || [],
                principios_culturais: identidade.principios_culturais || [],
                notas_internas: identidade.notas_internas || ''
            });
        }
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!empresaId || !consultoriaId || !usuarioId) return;

        setSaving(true);
        try {
            const novaVersao = identidade ? identidade.versao + 1 : 1;

            const { error } = await supabase
                .from('identidades_empresariais')
                .insert({
                    empresa_cliente_id: empresaId,
                    consultoria_id: consultoriaId,
                    criado_por_usuario_id: usuarioId,
                    versao: novaVersao,
                    missao: formData.missao || null,
                    visao: formData.visao || null,
                    proposito: formData.proposito || null,
                    evp: formData.evp || null,
                    valores: formData.valores,
                    principios_culturais: formData.principios_culturais,
                    notas_internas: formData.notas_internas || null
                });

            if (error) throw error;

            setShowForm(false);
            await fetchData();
        } catch (error) {
            console.error('Error saving identity:', error);
            alert('Erro ao salvar identidade');
        } finally {
            setSaving(false);
        }
    };

    const addValor = () => {
        setFormData(prev => ({
            ...prev,
            valores: [...prev.valores, { nome: '', descricao: '' }]
        }));
    };

    const updateValor = (index: number, field: 'nome' | 'descricao', value: string) => {
        setFormData(prev => ({
            ...prev,
            valores: prev.valores.map((v, i) => i === index ? { ...v, [field]: value } : v)
        }));
    };

    const removeValor = (index: number) => {
        setFormData(prev => ({
            ...prev,
            valores: prev.valores.filter((_, i) => i !== index)
        }));
    };

    const addPrincipio = () => {
        setFormData(prev => ({
            ...prev,
            principios_culturais: [...prev.principios_culturais, '']
        }));
    };

    const updatePrincipio = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            principios_culturais: prev.principios_culturais.map((p, i) => i === index ? value : p)
        }));
    };

    const removePrincipio = (index: number) => {
        setFormData(prev => ({
            ...prev,
            principios_culturais: prev.principios_culturais.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <WorkspaceLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="animate-spin h-8 w-8 text-primary-main" />
                </div>
            </WorkspaceLayout>
        );
    }

    return (
        <WorkspaceLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-gray900">Identidade da Empresa</h1>
                        <p className="text-neutral-gray600 mt-1">Missão, visão, valores e cultura organizacional</p>
                    </div>
                    <div className="flex gap-3">
                        {identidade && (
                            <Button
                                variant="secondary"
                                onClick={fetchHistorico}
                                className="!py-2"
                            >
                                <History className="w-4 h-4 mr-2" />
                                Histórico
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={handleEdit}
                            className="!py-2"
                        >
                            {identidade ? (
                                <>
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Editar
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Configurar
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Empty State */}
                {!identidade && !showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-primary-main/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Target className="w-10 h-10 text-primary-main" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-gray900 mb-3">
                            Identidade ainda não configurada
                        </h2>
                        <p className="text-neutral-gray600 max-w-md mx-auto mb-6">
                            Defina a missão, visão, valores e propósito da empresa para guiar todas as ações estratégicas de RH.
                        </p>
                        <Button variant="primary" onClick={handleEdit}>
                            <Plus className="w-4 h-4 mr-2" />
                            Configurar Identidade
                        </Button>
                    </motion.div>
                )}

                {/* Identity Display */}
                {identidade && !showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Missão */}
                        {identidade.missao && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Target className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-gray900">Missão</h3>
                                </div>
                                <p className="text-neutral-gray700 leading-relaxed">{identidade.missao}</p>
                            </div>
                        )}

                        {/* Visão */}
                        {identidade.visao && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-gray900">Visão</h3>
                                </div>
                                <p className="text-neutral-gray700 leading-relaxed">{identidade.visao}</p>
                            </div>
                        )}

                        {/* Propósito */}
                        {identidade.proposito && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-gray900">Propósito</h3>
                                </div>
                                <p className="text-neutral-gray700 leading-relaxed">{identidade.proposito}</p>
                            </div>
                        )}

                        {/* Valores */}
                        {identidade.valores && identidade.valores.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-gray900">Valores</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {identidade.valores.map((valor, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-medium text-neutral-gray900">{valor.nome}</h4>
                                            {valor.descricao && (
                                                <p className="text-sm text-neutral-gray600 mt-1">{valor.descricao}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Princípios Culturais */}
                        {identidade.principios_culturais && identidade.principios_culturais.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Star className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-neutral-gray900">Princípios Culturais</h3>
                                </div>
                                <ul className="space-y-2">
                                    {identidade.principios_culturais.map((principio, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <ChevronRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-neutral-gray700">{principio}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* EVP */}
                        {identidade.evp && (
                            <div className="bg-gradient-to-r from-primary-main to-blue-600 rounded-xl shadow-md p-6 text-white">
                                <h3 className="text-lg font-semibold mb-3">Proposta de Valor ao Empregado (EVP)</h3>
                                <p className="leading-relaxed opacity-90">{identidade.evp}</p>
                            </div>
                        )}

                        {/* Version info */}
                        <div className="text-sm text-neutral-gray500 text-center">
                            Versão {identidade.versao} • Atualizado em {new Date(identidade.criado_em).toLocaleDateString('pt-BR')}
                        </div>
                    </motion.div>
                )}

                {/* Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-neutral-gray900">
                                        {identidade ? 'Editar Identidade' : 'Configurar Identidade'}
                                    </h2>
                                    <button onClick={() => setShowForm(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Missão */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-2">Missão</label>
                                        <textarea
                                            value={formData.missao}
                                            onChange={e => setFormData(prev => ({ ...prev, missao: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20"
                                            placeholder="A razão de existir da empresa..."
                                        />
                                    </div>

                                    {/* Visão */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-2">Visão</label>
                                        <textarea
                                            value={formData.visao}
                                            onChange={e => setFormData(prev => ({ ...prev, visao: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20"
                                            placeholder="Onde a empresa quer chegar..."
                                        />
                                    </div>

                                    {/* Propósito */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-2">Propósito</label>
                                        <textarea
                                            value={formData.proposito}
                                            onChange={e => setFormData(prev => ({ ...prev, proposito: e.target.value }))}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20"
                                            placeholder="O impacto que a empresa quer causar..."
                                        />
                                    </div>

                                    {/* Valores */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-neutral-gray700">Valores</label>
                                            <button
                                                type="button"
                                                onClick={addValor}
                                                className="text-sm text-primary-main hover:underline"
                                            >
                                                + Adicionar valor
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.valores.map((valor, index) => (
                                                <div key={index} className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={valor.nome}
                                                        onChange={e => updateValor(index, 'nome', e.target.value)}
                                                        placeholder="Nome do valor"
                                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={valor.descricao}
                                                        onChange={e => updateValor(index, 'descricao', e.target.value)}
                                                        placeholder="Descrição (opcional)"
                                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeValor(index)}
                                                        className="text-red-500 hover:text-red-700 px-2"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Princípios Culturais */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-neutral-gray700">Princípios Culturais</label>
                                            <button
                                                type="button"
                                                onClick={addPrincipio}
                                                className="text-sm text-primary-main hover:underline"
                                            >
                                                + Adicionar princípio
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.principios_culturais.map((principio, index) => (
                                                <div key={index} className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={principio}
                                                        onChange={e => updatePrincipio(index, e.target.value)}
                                                        placeholder="Descreva o princípio cultural"
                                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePrincipio(index)}
                                                        className="text-red-500 hover:text-red-700 px-2"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* EVP */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-2">
                                            Proposta de Valor ao Empregado (EVP) <span className="text-neutral-gray500">(opcional)</span>
                                        </label>
                                        <textarea
                                            value={formData.evp}
                                            onChange={e => setFormData(prev => ({ ...prev, evp: e.target.value }))}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20"
                                            placeholder="O que a empresa oferece aos seus colaboradores..."
                                        />
                                    </div>

                                    {/* Notas Internas */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-2">
                                            Notas Internas <span className="text-neutral-gray500">(visível apenas para a consultoria)</span>
                                        </label>
                                        <textarea
                                            value={formData.notas_internas}
                                            onChange={e => setFormData(prev => ({ ...prev, notas_internas: e.target.value }))}
                                            rows={2}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20"
                                            placeholder="Observações, contexto, próximos passos..."
                                        />
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                    <Button variant="secondary" onClick={() => setShowForm(false)}>
                                        Cancelar
                                    </Button>
                                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                Salvando...
                                            </>
                                        ) : (
                                            'Salvar'
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History Modal */}
                <AnimatePresence>
                    {showHistorico && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-neutral-gray900 flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Histórico de Versões
                                    </h2>
                                    <button onClick={() => setShowHistorico(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {historico.map((versao) => (
                                            <div
                                                key={versao.id}
                                                className={`p-4 rounded-xl border ${versao.id === identidade?.id
                                                        ? 'border-primary-main bg-primary-main/5'
                                                        : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-neutral-gray900">
                                                        Versão {versao.versao}
                                                        {versao.id === identidade?.id && (
                                                            <span className="ml-2 text-xs bg-primary-main text-white px-2 py-0.5 rounded-full">
                                                                Atual
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-neutral-gray500">
                                                        {new Date(versao.criado_em).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-neutral-gray600">
                                                    {versao.missao && <p className="truncate">Missão: {versao.missao}</p>}
                                                    {versao.valores && versao.valores.length > 0 && (
                                                        <p>{versao.valores.length} valores definidos</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </WorkspaceLayout>
    );
}
