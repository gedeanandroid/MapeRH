import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    Building2, Network, GitBranch, Plus, Edit3, Loader2,
    MapPin, ChevronRight, X, Trash2
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface Unidade {
    id: string;
    nome: string;
    tipo: string | null;
    cidade: string | null;
    estado: string | null;
    status: string;
}

interface Departamento {
    id: string;
    unidade_id: string;
    nome: string;
    departamento_pai_id: string | null;
    status: string;
    unidade?: Unidade;
    subdepartamentos?: Departamento[];
}

type Tab = 'unidades' | 'departamentos' | 'organograma';

export default function OrganizationalStructure() {
    const { empresaId } = useParams<{ empresaId: string }>();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('unidades');
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [consultoriaId, setConsultoriaId] = useState<string | null>(null);

    // Modals
    const [showUnidadeModal, setShowUnidadeModal] = useState(false);
    const [showDepartamentoModal, setShowDepartamentoModal] = useState(false);
    const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
    const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null);
    const [saving, setSaving] = useState(false);

    // Form data
    const [unidadeForm, setUnidadeForm] = useState({ nome: '', tipo: 'filial', cidade: '', estado: '' });
    const [departamentoForm, setDepartamentoForm] = useState({ nome: '', unidade_id: '', departamento_pai_id: '' });

    useEffect(() => {
        fetchData();
    }, [empresaId, user]);

    const fetchData = async () => {
        if (!user || !empresaId) return;

        try {
            const { data: userData } = await supabase
                .from('usuarios')
                .select('consultoria_id')
                .eq('auth_user_id', user.id)
                .single();

            if (userData) {
                setConsultoriaId(userData.consultoria_id);
            }

            // Fetch unidades
            const { data: unidadesData } = await supabase
                .from('unidades_organizacionais')
                .select('*')
                .eq('empresa_cliente_id', empresaId)
                .eq('status', 'ativa')
                .order('nome');

            if (unidadesData) setUnidades(unidadesData);

            // Fetch departamentos
            const { data: departamentosData } = await supabase
                .from('departamentos')
                .select('*, unidade:unidades_organizacionais(nome)')
                .eq('empresa_cliente_id', empresaId)
                .eq('status', 'ativo')
                .order('nome');

            if (departamentosData) setDepartamentos(departamentosData);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // UNIDADE handlers
    const handleSaveUnidade = async () => {
        if (!empresaId || !consultoriaId || !unidadeForm.nome) return;

        setSaving(true);
        try {
            if (editingUnidade) {
                await supabase
                    .from('unidades_organizacionais')
                    .update({
                        nome: unidadeForm.nome,
                        tipo: unidadeForm.tipo,
                        cidade: unidadeForm.cidade || null,
                        estado: unidadeForm.estado || null,
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', editingUnidade.id);
            } else {
                await supabase
                    .from('unidades_organizacionais')
                    .insert({
                        empresa_cliente_id: empresaId,
                        consultoria_id: consultoriaId,
                        nome: unidadeForm.nome,
                        tipo: unidadeForm.tipo,
                        cidade: unidadeForm.cidade || null,
                        estado: unidadeForm.estado || null
                    });
            }

            setShowUnidadeModal(false);
            setEditingUnidade(null);
            setUnidadeForm({ nome: '', tipo: 'filial', cidade: '', estado: '' });
            await fetchData();
        } catch (error) {
            console.error('Error saving unidade:', error);
            alert('Erro ao salvar unidade');
        } finally {
            setSaving(false);
        }
    };

    const handleEditUnidade = (unidade: Unidade) => {
        setEditingUnidade(unidade);
        setUnidadeForm({
            nome: unidade.nome,
            tipo: unidade.tipo || 'filial',
            cidade: unidade.cidade || '',
            estado: unidade.estado || ''
        });
        setShowUnidadeModal(true);
    };

    // DEPARTAMENTO handlers
    const handleSaveDepartamento = async () => {
        if (!empresaId || !consultoriaId || !departamentoForm.nome || !departamentoForm.unidade_id) return;

        setSaving(true);
        try {
            if (editingDepartamento) {
                await supabase
                    .from('departamentos')
                    .update({
                        nome: departamentoForm.nome,
                        unidade_id: departamentoForm.unidade_id,
                        departamento_pai_id: departamentoForm.departamento_pai_id || null,
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', editingDepartamento.id);
            } else {
                await supabase
                    .from('departamentos')
                    .insert({
                        empresa_cliente_id: empresaId,
                        consultoria_id: consultoriaId,
                        nome: departamentoForm.nome,
                        unidade_id: departamentoForm.unidade_id,
                        departamento_pai_id: departamentoForm.departamento_pai_id || null
                    });
            }

            setShowDepartamentoModal(false);
            setEditingDepartamento(null);
            setDepartamentoForm({ nome: '', unidade_id: '', departamento_pai_id: '' });
            await fetchData();
        } catch (error) {
            console.error('Error saving departamento:', error);
            alert('Erro ao salvar departamento');
        } finally {
            setSaving(false);
        }
    };

    const handleEditDepartamento = (departamento: Departamento) => {
        setEditingDepartamento(departamento);
        setDepartamentoForm({
            nome: departamento.nome,
            unidade_id: departamento.unidade_id,
            departamento_pai_id: departamento.departamento_pai_id || ''
        });
        setShowDepartamentoModal(true);
    };

    // Build hierarchy for org chart
    const buildHierarchy = () => {
        const unidadesWithDeps = unidades.map(unidade => ({
            ...unidade,
            departamentos: departamentos
                .filter(d => d.unidade_id === unidade.id && !d.departamento_pai_id)
                .map(dep => ({
                    ...dep,
                    subdepartamentos: departamentos.filter(sub => sub.departamento_pai_id === dep.id)
                }))
        }));
        return unidadesWithDeps;
    };

    const tabs = [
        { id: 'unidades' as Tab, label: 'Unidades / Filiais', icon: Building2 },
        { id: 'departamentos' as Tab, label: 'Departamentos', icon: Network },
        { id: 'organograma' as Tab, label: 'Organograma', icon: GitBranch }
    ];

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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-gray900">Estrutura Organizacional</h1>
                    <p className="text-neutral-gray600 mt-1">Unidades, departamentos e organograma da empresa</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-md mb-6">
                    <div className="border-b flex">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id
                                        ? 'border-primary-main text-primary-main'
                                        : 'border-transparent text-neutral-gray600 hover:text-neutral-gray900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* UNIDADES TAB */}
                        {activeTab === 'unidades' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold text-neutral-gray900">
                                        {unidades.length} unidade{unidades.length !== 1 ? 's' : ''} cadastrada{unidades.length !== 1 ? 's' : ''}
                                    </h2>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setEditingUnidade(null);
                                            setUnidadeForm({ nome: '', tipo: 'filial', cidade: '', estado: '' });
                                            setShowUnidadeModal(true);
                                        }}
                                        className="!py-2"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar Unidade
                                    </Button>
                                </div>

                                {unidades.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Building2 className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                        <p className="text-neutral-gray600">Nenhuma unidade cadastrada</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {unidades.map(unidade => (
                                            <div
                                                key={unidade.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-primary-main/10 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-primary-main" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-neutral-gray900">{unidade.nome}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-neutral-gray600">
                                                            <span className="capitalize">{unidade.tipo}</span>
                                                            {(unidade.cidade || unidade.estado) && (
                                                                <>
                                                                    <span>•</span>
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span>{[unidade.cidade, unidade.estado].filter(Boolean).join(', ')}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleEditUnidade(unidade)}
                                                    className="p-2 text-neutral-gray500 hover:text-primary-main transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DEPARTAMENTOS TAB */}
                        {activeTab === 'departamentos' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold text-neutral-gray900">
                                        {departamentos.length} departamento{departamentos.length !== 1 ? 's' : ''} cadastrado{departamentos.length !== 1 ? 's' : ''}
                                    </h2>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setEditingDepartamento(null);
                                            setDepartamentoForm({ nome: '', unidade_id: unidades[0]?.id || '', departamento_pai_id: '' });
                                            setShowDepartamentoModal(true);
                                        }}
                                        disabled={unidades.length === 0}
                                        className="!py-2"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar Departamento
                                    </Button>
                                </div>

                                {unidades.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Building2 className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                        <p className="text-neutral-gray600">Cadastre uma unidade primeiro</p>
                                    </div>
                                ) : departamentos.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Network className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                        <p className="text-neutral-gray600">Nenhum departamento cadastrado</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {departamentos.map(dep => (
                                            <div
                                                key={dep.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <Network className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-neutral-gray900">{dep.nome}</h3>
                                                        <p className="text-sm text-neutral-gray600">
                                                            {(dep.unidade as any)?.nome || 'Sem unidade'}
                                                            {dep.departamento_pai_id && (
                                                                <span className="ml-2">
                                                                    • Subordinado a: {departamentos.find(d => d.id === dep.departamento_pai_id)?.nome}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleEditDepartamento(dep)}
                                                    className="p-2 text-neutral-gray500 hover:text-primary-main transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ORGANOGRAMA TAB */}
                        {activeTab === 'organograma' && (
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-gray900 mb-6">Organograma</h2>

                                {unidades.length === 0 ? (
                                    <div className="text-center py-12">
                                        <GitBranch className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                        <p className="text-neutral-gray600">Cadastre unidades e departamentos para visualizar o organograma</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {buildHierarchy().map(unidade => (
                                            <div key={unidade.id} className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-primary-main rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-neutral-gray900">{unidade.nome}</h3>
                                                        <p className="text-xs text-neutral-gray500 capitalize">{unidade.tipo}</p>
                                                    </div>
                                                </div>

                                                {unidade.departamentos.length > 0 && (
                                                    <div className="ml-6 border-l-2 border-gray-200 pl-4 space-y-3">
                                                        {unidade.departamentos.map(dep => (
                                                            <div key={dep.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                                                                        <Network className="w-4 h-4 text-purple-500" />
                                                                        <span className="font-medium text-sm">{dep.nome}</span>
                                                                    </div>
                                                                </div>

                                                                {dep.subdepartamentos && dep.subdepartamentos.length > 0 && (
                                                                    <div className="ml-8 mt-2 space-y-2">
                                                                        {dep.subdepartamentos.map(sub => (
                                                                            <div key={sub.id} className="flex items-center gap-2">
                                                                                <ChevronRight className="w-3 h-3 text-gray-300" />
                                                                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                                                                                    <span className="text-sm text-neutral-gray700">{sub.nome}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {unidade.departamentos.length === 0 && (
                                                    <p className="ml-10 text-sm text-neutral-gray500 italic">Nenhum departamento nesta unidade</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Unidade Modal */}
            <AnimatePresence>
                {showUnidadeModal && (
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
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                        >
                            <div className="border-b px-6 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-neutral-gray900">
                                    {editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}
                                </h2>
                                <button onClick={() => setShowUnidadeModal(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={unidadeForm.nome}
                                        onChange={e => setUnidadeForm(prev => ({ ...prev, nome: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                        placeholder="Ex: Matriz São Paulo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Tipo</label>
                                    <select
                                        value={unidadeForm.tipo}
                                        onChange={e => setUnidadeForm(prev => ({ ...prev, tipo: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                    >
                                        <option value="matriz">Matriz</option>
                                        <option value="filial">Filial</option>
                                        <option value="escritorio">Escritório</option>
                                        <option value="fabrica">Fábrica</option>
                                        <option value="centro_distribuicao">Centro de Distribuição</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={unidadeForm.cidade}
                                            onChange={e => setUnidadeForm(prev => ({ ...prev, cidade: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">Estado</label>
                                        <input
                                            type="text"
                                            value={unidadeForm.estado}
                                            onChange={e => setUnidadeForm(prev => ({ ...prev, estado: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            placeholder="Ex: SP"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowUnidadeModal(false)}>Cancelar</Button>
                                <Button variant="primary" onClick={handleSaveUnidade} disabled={saving || !unidadeForm.nome}>
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Salvar'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Departamento Modal */}
            <AnimatePresence>
                {showDepartamentoModal && (
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
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                        >
                            <div className="border-b px-6 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-neutral-gray900">
                                    {editingDepartamento ? 'Editar Departamento' : 'Novo Departamento'}
                                </h2>
                                <button onClick={() => setShowDepartamentoModal(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={departamentoForm.nome}
                                        onChange={e => setDepartamentoForm(prev => ({ ...prev, nome: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                        placeholder="Ex: Recursos Humanos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Unidade *</label>
                                    <select
                                        value={departamentoForm.unidade_id}
                                        onChange={e => setDepartamentoForm(prev => ({ ...prev, unidade_id: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                    >
                                        <option value="">Selecione uma unidade</option>
                                        {unidades.map(u => (
                                            <option key={u.id} value={u.id}>{u.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Departamento Pai (opcional)</label>
                                    <select
                                        value={departamentoForm.departamento_pai_id}
                                        onChange={e => setDepartamentoForm(prev => ({ ...prev, departamento_pai_id: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                    >
                                        <option value="">Nenhum (departamento raiz)</option>
                                        {departamentos
                                            .filter(d => d.id !== editingDepartamento?.id)
                                            .map(d => (
                                                <option key={d.id} value={d.id}>{d.nome}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowDepartamentoModal(false)}>Cancelar</Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSaveDepartamento}
                                    disabled={saving || !departamentoForm.nome || !departamentoForm.unidade_id}
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Salvar'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </WorkspaceLayout>
    );
}
