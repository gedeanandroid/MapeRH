import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    Briefcase, Plus, Search, Filter, Loader2, Edit3, Eye,
    Building2, Network, ChevronUp, ChevronDown, X, Users, GraduationCap
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface Cargo {
    id: string;
    nome: string;
    codigo: string | null;
    nivel_organizacional: string | null;
    nivel_senioridade: string | null;
    missao: string | null;
    responsabilidades: string[];
    atividades: string[];
    escolaridade_minima: string | null;
    experiencia_minima: string | null;
    idiomas: string | null;
    conhecimentos_tecnicos: string | null;
    outros_requisitos: string | null;
    departamento_id: string;
    unidade_id: string | null;
    cargo_superior_id: string | null;
    status: string;
    departamento?: { nome: string; unidade?: { nome: string } };
    cargo_superior?: { nome: string };
}

interface Departamento {
    id: string;
    nome: string;
    unidade_id: string;
    unidade?: { nome: string };
}

interface Unidade {
    id: string;
    nome: string;
}

export default function Positions() {
    const { empresaId } = useParams<{ empresaId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [consultoriaId, setConsultoriaId] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUnidade, setFilterUnidade] = useState('');
    const [filterDepartamento, setFilterDepartamento] = useState('');
    const [filterNivel, setFilterNivel] = useState('');

    // Modals
    const [showForm, setShowForm] = useState(false);
    const [showView, setShowView] = useState(false);
    const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
    const [viewingCargo, setViewingCargo] = useState<Cargo | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        nome: '',
        codigo: '',
        departamento_id: '',
        unidade_id: '',
        cargo_superior_id: '',
        nivel_organizacional: '',
        nivel_senioridade: '',
        missao: '',
        responsabilidades: [] as string[],
        atividades: [] as string[],
        escolaridade_minima: '',
        experiencia_minima: '',
        idiomas: '',
        conhecimentos_tecnicos: '',
        outros_requisitos: ''
    });

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

            if (userData) setConsultoriaId(userData.consultoria_id);

            // Fetch unidades
            const { data: unidadesData } = await supabase
                .from('unidades_organizacionais')
                .select('id, nome')
                .eq('empresa_cliente_id', empresaId)
                .eq('status', 'ativa')
                .order('nome');

            if (unidadesData) setUnidades(unidadesData);

            // Fetch departamentos
            const { data: departamentosData } = await supabase
                .from('departamentos')
                .select('id, nome, unidade_id, unidade:unidades_organizacionais(nome)')
                .eq('empresa_cliente_id', empresaId)
                .eq('status', 'ativo')
                .order('nome');

            if (departamentosData) setDepartamentos(departamentosData);

            // Fetch cargos
            const { data: cargosData } = await supabase
                .from('cargos')
                .select(`
                    *,
                    departamento:departamentos(nome, unidade:unidades_organizacionais(nome)),
                    cargo_superior:cargos!cargo_superior_id(nome)
                `)
                .eq('empresa_cliente_id', empresaId)
                .eq('status', 'ativo')
                .order('nome');

            if (cargosData) setCargos(cargosData);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            codigo: '',
            departamento_id: departamentos[0]?.id || '',
            unidade_id: '',
            cargo_superior_id: '',
            nivel_organizacional: '',
            nivel_senioridade: '',
            missao: '',
            responsabilidades: [],
            atividades: [],
            escolaridade_minima: '',
            experiencia_minima: '',
            idiomas: '',
            conhecimentos_tecnicos: '',
            outros_requisitos: ''
        });
    };

    const handleEdit = (cargo: Cargo) => {
        setEditingCargo(cargo);
        setFormData({
            nome: cargo.nome,
            codigo: cargo.codigo || '',
            departamento_id: cargo.departamento_id,
            unidade_id: cargo.unidade_id || '',
            cargo_superior_id: cargo.cargo_superior_id || '',
            nivel_organizacional: cargo.nivel_organizacional || '',
            nivel_senioridade: cargo.nivel_senioridade || '',
            missao: cargo.missao || '',
            responsabilidades: cargo.responsabilidades || [],
            atividades: cargo.atividades || [],
            escolaridade_minima: cargo.escolaridade_minima || '',
            experiencia_minima: cargo.experiencia_minima || '',
            idiomas: cargo.idiomas || '',
            conhecimentos_tecnicos: cargo.conhecimentos_tecnicos || '',
            outros_requisitos: cargo.outros_requisitos || ''
        });
        setShowForm(true);
    };

    const handleView = (cargo: Cargo) => {
        setViewingCargo(cargo);
        setShowView(true);
    };

    const handleSave = async () => {
        if (!empresaId || !consultoriaId || !formData.nome || !formData.departamento_id) return;

        setSaving(true);
        try {
            const cargoData = {
                empresa_cliente_id: empresaId,
                consultoria_id: consultoriaId,
                nome: formData.nome,
                codigo: formData.codigo || null,
                departamento_id: formData.departamento_id,
                unidade_id: formData.unidade_id || null,
                cargo_superior_id: formData.cargo_superior_id || null,
                nivel_organizacional: formData.nivel_organizacional || null,
                nivel_senioridade: formData.nivel_senioridade || null,
                missao: formData.missao || null,
                responsabilidades: formData.responsabilidades,
                atividades: formData.atividades,
                escolaridade_minima: formData.escolaridade_minima || null,
                experiencia_minima: formData.experiencia_minima || null,
                idiomas: formData.idiomas || null,
                conhecimentos_tecnicos: formData.conhecimentos_tecnicos || null,
                outros_requisitos: formData.outros_requisitos || null,
                atualizado_em: new Date().toISOString()
            };

            if (editingCargo) {
                await supabase
                    .from('cargos')
                    .update(cargoData)
                    .eq('id', editingCargo.id);
            } else {
                await supabase
                    .from('cargos')
                    .insert(cargoData);
            }

            setShowForm(false);
            setEditingCargo(null);
            resetForm();
            await fetchData();
        } catch (error) {
            console.error('Error saving cargo:', error);
            alert('Erro ao salvar cargo');
        } finally {
            setSaving(false);
        }
    };

    const addResponsabilidade = () => {
        setFormData(prev => ({ ...prev, responsabilidades: [...prev.responsabilidades, ''] }));
    };

    const updateResponsabilidade = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            responsabilidades: prev.responsabilidades.map((r, i) => i === index ? value : r)
        }));
    };

    const removeResponsabilidade = (index: number) => {
        setFormData(prev => ({
            ...prev,
            responsabilidades: prev.responsabilidades.filter((_, i) => i !== index)
        }));
    };

    const addAtividade = () => {
        setFormData(prev => ({ ...prev, atividades: [...prev.atividades, ''] }));
    };

    const updateAtividade = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            atividades: prev.atividades.map((a, i) => i === index ? value : a)
        }));
    };

    const removeAtividade = (index: number) => {
        setFormData(prev => ({
            ...prev,
            atividades: prev.atividades.filter((_, i) => i !== index)
        }));
    };

    // Filter cargos
    const filteredCargos = cargos.filter(cargo => {
        const matchesSearch = cargo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cargo.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUnidade = !filterUnidade || cargo.unidade_id === filterUnidade;
        const matchesDepartamento = !filterDepartamento || cargo.departamento_id === filterDepartamento;
        const matchesNivel = !filterNivel || cargo.nivel_organizacional === filterNivel || cargo.nivel_senioridade === filterNivel;
        return matchesSearch && matchesUnidade && matchesDepartamento && matchesNivel;
    });

    const nivelOrgLabels: Record<string, string> = {
        operacional: 'Operacional',
        tatico: 'Tático',
        estrategico: 'Estratégico'
    };

    const nivelSenLabels: Record<string, string> = {
        estagiario: 'Estagiário',
        junior: 'Júnior',
        pleno: 'Pleno',
        senior: 'Sênior',
        especialista: 'Especialista',
        coordenacao: 'Coordenação',
        gerencia: 'Gerência',
        diretoria: 'Diretoria'
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
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-gray900">Cargos</h1>
                        <p className="text-neutral-gray600 mt-1">Descrições de cargo e job descriptions</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingCargo(null);
                            resetForm();
                            setShowForm(true);
                        }}
                        disabled={departamentos.length === 0}
                        className="!py-2"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Cargo
                    </Button>
                </div>

                {departamentos.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Network className="w-16 h-16 text-neutral-gray400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-neutral-gray900 mb-2">
                            Cadastre departamentos primeiro
                        </h2>
                        <p className="text-neutral-gray600 mb-6">
                            Para cadastrar cargos, você precisa ter pelo menos um departamento cadastrado.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate(`/workspace/${empresaId}/estrutura`)}
                        >
                            Ir para Estrutura Organizacional
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md">
                        {/* Filters */}
                        <div className="p-4 border-b">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            placeholder="Buscar cargo..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterUnidade}
                                    onChange={e => setFilterUnidade(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                >
                                    <option value="">Todas as unidades</option>
                                    {unidades.map(u => (
                                        <option key={u.id} value={u.id}>{u.nome}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterDepartamento}
                                    onChange={e => setFilterDepartamento(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                >
                                    <option value="">Todos os departamentos</option>
                                    {departamentos.map(d => (
                                        <option key={d.id} value={d.id}>{d.nome}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterNivel}
                                    onChange={e => setFilterNivel(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                >
                                    <option value="">Todos os níveis</option>
                                    <optgroup label="Nível Organizacional">
                                        <option value="operacional">Operacional</option>
                                        <option value="tatico">Tático</option>
                                        <option value="estrategico">Estratégico</option>
                                    </optgroup>
                                    <optgroup label="Senioridade">
                                        <option value="junior">Júnior</option>
                                        <option value="pleno">Pleno</option>
                                        <option value="senior">Sênior</option>
                                        <option value="coordenacao">Coordenação</option>
                                        <option value="gerencia">Gerência</option>
                                        <option value="diretoria">Diretoria</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        {/* List */}
                        <div className="p-4">
                            {filteredCargos.length === 0 ? (
                                <div className="text-center py-12">
                                    <Briefcase className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                    <p className="text-neutral-gray600">
                                        {cargos.length === 0 ? 'Nenhum cargo cadastrado' : 'Nenhum cargo encontrado com os filtros aplicados'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredCargos.map(cargo => (
                                        <div
                                            key={cargo.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary-main/10 rounded-xl flex items-center justify-center">
                                                    <Briefcase className="w-6 h-6 text-primary-main" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-neutral-gray900">{cargo.nome}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-neutral-gray600">
                                                        <span className="flex items-center gap-1">
                                                            <Network className="w-3 h-3" />
                                                            {(cargo.departamento as any)?.nome}
                                                        </span>
                                                        {cargo.nivel_organizacional && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                                                {nivelOrgLabels[cargo.nivel_organizacional]}
                                                            </span>
                                                        )}
                                                        {cargo.nivel_senioridade && (
                                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                                                {nivelSenLabels[cargo.nivel_senioridade]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView(cargo)}
                                                    className="p-2 text-neutral-gray500 hover:text-primary-main transition-colors"
                                                    title="Visualizar"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(cargo)}
                                                    className="p-2 text-neutral-gray500 hover:text-primary-main transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

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
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-xl font-bold text-neutral-gray900">
                                    {editingCargo ? 'Editar Cargo' : 'Novo Cargo'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Dados Gerais */}
                                <div>
                                    <h3 className="font-semibold text-neutral-gray800 mb-4 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" />
                                        Dados Gerais
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Nome do Cargo *</label>
                                            <input
                                                type="text"
                                                value={formData.nome}
                                                onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Ex: Analista de RH"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Código</label>
                                            <input
                                                type="text"
                                                value={formData.codigo}
                                                onChange={e => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Ex: RH-001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Departamento *</label>
                                            <select
                                                value={formData.departamento_id}
                                                onChange={e => setFormData(prev => ({ ...prev, departamento_id: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="">Selecione</option>
                                                {departamentos.map(d => (
                                                    <option key={d.id} value={d.id}>{d.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Cargo Superior</label>
                                            <select
                                                value={formData.cargo_superior_id}
                                                onChange={e => setFormData(prev => ({ ...prev, cargo_superior_id: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="">Nenhum</option>
                                                {cargos.filter(c => c.id !== editingCargo?.id).map(c => (
                                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Nível Organizacional</label>
                                            <select
                                                value={formData.nivel_organizacional}
                                                onChange={e => setFormData(prev => ({ ...prev, nivel_organizacional: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="operacional">Operacional</option>
                                                <option value="tatico">Tático</option>
                                                <option value="estrategico">Estratégico</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Senioridade</label>
                                            <select
                                                value={formData.nivel_senioridade}
                                                onChange={e => setFormData(prev => ({ ...prev, nivel_senioridade: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="estagiario">Estagiário</option>
                                                <option value="junior">Júnior</option>
                                                <option value="pleno">Pleno</option>
                                                <option value="senior">Sênior</option>
                                                <option value="especialista">Especialista</option>
                                                <option value="coordenacao">Coordenação</option>
                                                <option value="gerencia">Gerência</option>
                                                <option value="diretoria">Diretoria</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Descrição */}
                                <div>
                                    <h3 className="font-semibold text-neutral-gray800 mb-4">Descrição do Cargo</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Missão do Cargo</label>
                                            <textarea
                                                value={formData.missao}
                                                onChange={e => setFormData(prev => ({ ...prev, missao: e.target.value }))}
                                                rows={2}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Descreva o propósito principal do cargo..."
                                            />
                                        </div>

                                        {/* Responsabilidades */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium text-neutral-gray700">Responsabilidades</label>
                                                <button type="button" onClick={addResponsabilidade} className="text-sm text-primary-main hover:underline">
                                                    + Adicionar
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {formData.responsabilidades.map((resp, i) => (
                                                    <div key={i} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={resp}
                                                            onChange={e => updateResponsabilidade(i, e.target.value)}
                                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                            placeholder="Descreva a responsabilidade..."
                                                        />
                                                        <button type="button" onClick={() => removeResponsabilidade(i)} className="text-red-500 px-2">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Atividades */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium text-neutral-gray700">Atividades (opcional)</label>
                                                <button type="button" onClick={addAtividade} className="text-sm text-primary-main hover:underline">
                                                    + Adicionar
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {formData.atividades.map((ativ, i) => (
                                                    <div key={i} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={ativ}
                                                            onChange={e => updateAtividade(i, e.target.value)}
                                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                            placeholder="Descreva a atividade..."
                                                        />
                                                        <button type="button" onClick={() => removeAtividade(i)} className="text-red-500 px-2">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Requisitos */}
                                <div>
                                    <h3 className="font-semibold text-neutral-gray800 mb-4 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        Requisitos
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Escolaridade Mínima</label>
                                            <input
                                                type="text"
                                                value={formData.escolaridade_minima}
                                                onChange={e => setFormData(prev => ({ ...prev, escolaridade_minima: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Ex: Ensino Superior em Administração"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Experiência Mínima</label>
                                            <input
                                                type="text"
                                                value={formData.experiencia_minima}
                                                onChange={e => setFormData(prev => ({ ...prev, experiencia_minima: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Ex: 2 anos na área"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Idiomas</label>
                                            <input
                                                type="text"
                                                value={formData.idiomas}
                                                onChange={e => setFormData(prev => ({ ...prev, idiomas: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Ex: Inglês intermediário"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Conhecimentos Técnicos</label>
                                            <input
                                                type="text"
                                                value={formData.conhecimentos_tecnicos}
                                                onChange={e => setFormData(prev => ({ ...prev, conhecimentos_tecnicos: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Ex: Excel avançado, SAP"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Outros Requisitos</label>
                                            <textarea
                                                value={formData.outros_requisitos}
                                                onChange={e => setFormData(prev => ({ ...prev, outros_requisitos: e.target.value }))}
                                                rows={2}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Outros requisitos relevantes..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                                <Button variant="primary" onClick={handleSave} disabled={saving || !formData.nome || !formData.departamento_id}>
                                    {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    {saving ? 'Salvando...' : 'Salvar Cargo'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {showView && viewingCargo && (
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
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-primary-main text-white px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">{viewingCargo.nome}</h2>
                                    <p className="text-sm opacity-80">{(viewingCargo.departamento as any)?.nome}</p>
                                </div>
                                <button onClick={() => setShowView(false)} className="text-white/80 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {viewingCargo.nivel_organizacional && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                            {nivelOrgLabels[viewingCargo.nivel_organizacional]}
                                        </span>
                                    )}
                                    {viewingCargo.nivel_senioridade && (
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                            {nivelSenLabels[viewingCargo.nivel_senioridade]}
                                        </span>
                                    )}
                                    {viewingCargo.cargo_superior && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                            Reporta a: {(viewingCargo.cargo_superior as any)?.nome}
                                        </span>
                                    )}
                                </div>

                                {/* Missão */}
                                {viewingCargo.missao && (
                                    <div>
                                        <h3 className="font-semibold text-neutral-gray800 mb-2">Missão do Cargo</h3>
                                        <p className="text-neutral-gray700">{viewingCargo.missao}</p>
                                    </div>
                                )}

                                {/* Responsabilidades */}
                                {viewingCargo.responsabilidades && viewingCargo.responsabilidades.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-neutral-gray800 mb-2">Responsabilidades</h3>
                                        <ul className="list-disc list-inside space-y-1 text-neutral-gray700">
                                            {viewingCargo.responsabilidades.map((resp, i) => (
                                                <li key={i}>{resp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Atividades */}
                                {viewingCargo.atividades && viewingCargo.atividades.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-neutral-gray800 mb-2">Atividades</h3>
                                        <ul className="list-disc list-inside space-y-1 text-neutral-gray700">
                                            {viewingCargo.atividades.map((ativ, i) => (
                                                <li key={i}>{ativ}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Requisitos */}
                                <div>
                                    <h3 className="font-semibold text-neutral-gray800 mb-2">Requisitos</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {viewingCargo.escolaridade_minima && (
                                            <div>
                                                <p className="text-sm text-neutral-gray500">Escolaridade</p>
                                                <p className="text-neutral-gray700">{viewingCargo.escolaridade_minima}</p>
                                            </div>
                                        )}
                                        {viewingCargo.experiencia_minima && (
                                            <div>
                                                <p className="text-sm text-neutral-gray500">Experiência</p>
                                                <p className="text-neutral-gray700">{viewingCargo.experiencia_minima}</p>
                                            </div>
                                        )}
                                        {viewingCargo.idiomas && (
                                            <div>
                                                <p className="text-sm text-neutral-gray500">Idiomas</p>
                                                <p className="text-neutral-gray700">{viewingCargo.idiomas}</p>
                                            </div>
                                        )}
                                        {viewingCargo.conhecimentos_tecnicos && (
                                            <div>
                                                <p className="text-sm text-neutral-gray500">Conhecimentos Técnicos</p>
                                                <p className="text-neutral-gray700">{viewingCargo.conhecimentos_tecnicos}</p>
                                            </div>
                                        )}
                                    </div>
                                    {viewingCargo.outros_requisitos && (
                                        <div className="mt-4">
                                            <p className="text-sm text-neutral-gray500">Outros</p>
                                            <p className="text-neutral-gray700">{viewingCargo.outros_requisitos}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowView(false)}>Fechar</Button>
                                <Button variant="primary" onClick={() => { setShowView(false); handleEdit(viewingCargo); }}>
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </WorkspaceLayout>
    );
}
