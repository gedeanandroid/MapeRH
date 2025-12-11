import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    BookOpen, Grid3X3, Plus, Search, Filter, Loader2, Edit3,
    Eye, X, Brain, Lightbulb, Heart, Check, Trash2, Target
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface Competencia {
    id: string;
    nome: string;
    tipo: 'tecnica' | 'comportamental' | 'organizacional';
    eixo_cha: 'C' | 'H' | 'A';
    descricao: string | null;
    status: string;
    niveis?: Nivel[];
}

interface Nivel {
    id?: string;
    nivel: number;
    nome: string;
    descricao: string;
}

interface Cargo {
    id: string;
    nome: string;
    departamento?: { nome: string };
}

interface CargoCompetencia {
    id: string;
    cargo_id: string;
    competencia_empresa_id: string;
    nivel_desejado: number;
    obrigatoria: boolean;
    competencia?: Competencia;
}

type Tab = 'biblioteca' | 'matriz';

const tipoLabels: Record<string, string> = {
    tecnica: 'Técnica',
    comportamental: 'Comportamental',
    organizacional: 'Organizacional'
};

const chaLabels: Record<string, { label: string; color: string; icon: any }> = {
    C: { label: 'Conhecimento', color: 'bg-blue-100 text-blue-700', icon: Brain },
    H: { label: 'Habilidade', color: 'bg-green-100 text-green-700', icon: Lightbulb },
    A: { label: 'Atitude', color: 'bg-purple-100 text-purple-700', icon: Heart }
};

const defaultNiveis: Nivel[] = [
    { nivel: 1, nome: 'Básico', descricao: '' },
    { nivel: 2, nome: 'Elementar', descricao: '' },
    { nivel: 3, nome: 'Intermediário', descricao: '' },
    { nivel: 4, nome: 'Avançado', descricao: '' },
    { nivel: 5, nome: 'Especialista', descricao: '' }
];

export default function Competencies() {
    const { empresaId } = useParams<{ empresaId: string }>();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('biblioteca');
    const [competencias, setCompetencias] = useState<Competencia[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [consultoriaId, setConsultoriaId] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterCha, setFilterCha] = useState('');
    const [showInativas, setShowInativas] = useState(false);

    // Modals
    const [showForm, setShowForm] = useState(false);
    const [editingCompetencia, setEditingCompetencia] = useState<Competencia | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        nome: '',
        tipo: 'tecnica' as 'tecnica' | 'comportamental' | 'organizacional',
        eixo_cha: 'C' as 'C' | 'H' | 'A',
        descricao: '',
        niveis: [...defaultNiveis]
    });

    // Matrix state
    const [selectedCargoId, setSelectedCargoId] = useState('');
    const [cargoCompetencias, setCargoCompetencias] = useState<CargoCompetencia[]>([]);
    const [showAddToCargoModal, setShowAddToCargoModal] = useState(false);
    const [addingCompetenciaId, setAddingCompetenciaId] = useState('');
    const [addingNivel, setAddingNivel] = useState(3);
    const [showMatrixView, setShowMatrixView] = useState(false);

    useEffect(() => {
        fetchData();
    }, [empresaId, user]);

    useEffect(() => {
        if (selectedCargoId) {
            fetchCargoCompetencias();
        }
    }, [selectedCargoId]);

    const fetchData = async () => {
        if (!user || !empresaId) return;

        try {
            const { data: userData } = await supabase
                .from('usuarios')
                .select('consultoria_id')
                .eq('auth_user_id', user.id)
                .single();

            if (userData) setConsultoriaId(userData.consultoria_id);

            // Fetch competencias with niveis
            const { data: compData } = await supabase
                .from('competencias_empresa')
                .select('*, niveis:niveis_competencia_empresa(*)')
                .eq('empresa_cliente_id', empresaId)
                .order('nome');

            if (compData) setCompetencias(compData);

            // Fetch cargos
            const { data: cargosData } = await supabase
                .from('cargos')
                .select('id, nome, departamento:departamentos(nome)')
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

    const fetchCargoCompetencias = async () => {
        if (!selectedCargoId) return;

        const { data } = await supabase
            .from('cargos_competencias')
            .select('*, competencia:competencias_empresa(*)')
            .eq('cargo_id', selectedCargoId);

        if (data) setCargoCompetencias(data);
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            tipo: 'tecnica',
            eixo_cha: 'C',
            descricao: '',
            niveis: [...defaultNiveis]
        });
    };

    const handleEdit = async (competencia: Competencia) => {
        // Fetch niveis for this competencia
        const { data: niveisData } = await supabase
            .from('niveis_competencia_empresa')
            .select('*')
            .eq('competencia_empresa_id', competencia.id)
            .order('nivel');

        setEditingCompetencia(competencia);
        setFormData({
            nome: competencia.nome,
            tipo: competencia.tipo,
            eixo_cha: competencia.eixo_cha,
            descricao: competencia.descricao || '',
            niveis: niveisData && niveisData.length > 0
                ? niveisData
                : [...defaultNiveis]
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!empresaId || !consultoriaId || !formData.nome) return;

        // Validate at least one nivel has description
        const hasValidNivel = formData.niveis.some(n => n.descricao.trim());
        if (!hasValidNivel) {
            alert('Defina a descrição de pelo menos um nível de proficiência.');
            return;
        }

        setSaving(true);
        try {
            let competenciaId: string;

            if (editingCompetencia) {
                // Update competencia
                const { error } = await supabase
                    .from('competencias_empresa')
                    .update({
                        nome: formData.nome,
                        tipo: formData.tipo,
                        eixo_cha: formData.eixo_cha,
                        descricao: formData.descricao || null,
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', editingCompetencia.id);

                if (error) throw error;
                competenciaId = editingCompetencia.id;

                // Delete existing niveis and recreate
                await supabase
                    .from('niveis_competencia_empresa')
                    .delete()
                    .eq('competencia_empresa_id', competenciaId);
            } else {
                // Create new competencia
                const { data, error } = await supabase
                    .from('competencias_empresa')
                    .insert({
                        empresa_cliente_id: empresaId,
                        consultoria_id: consultoriaId,
                        nome: formData.nome,
                        tipo: formData.tipo,
                        eixo_cha: formData.eixo_cha,
                        descricao: formData.descricao || null
                    })
                    .select()
                    .single();

                if (error) throw error;
                competenciaId = data.id;
            }

            // Insert niveis with descriptions
            const niveisToInsert = formData.niveis
                .filter(n => n.descricao.trim())
                .map(n => ({
                    competencia_empresa_id: competenciaId,
                    nivel: n.nivel,
                    nome: n.nome,
                    descricao: n.descricao
                }));

            if (niveisToInsert.length > 0) {
                await supabase
                    .from('niveis_competencia_empresa')
                    .insert(niveisToInsert);
            }

            setShowForm(false);
            setEditingCompetencia(null);
            resetForm();
            await fetchData();
        } catch (error) {
            console.error('Error saving competencia:', error);
            alert('Erro ao salvar competência');
        } finally {
            setSaving(false);
        }
    };

    const handleInactivate = async (competencia: Competencia) => {
        if (!confirm('Inativar esta competência? Ela não poderá ser vinculada a novos cargos.')) return;

        try {
            await supabase
                .from('competencias_empresa')
                .update({ status: 'inativa', atualizado_em: new Date().toISOString() })
                .eq('id', competencia.id);

            await fetchData();
        } catch (error) {
            console.error('Error inactivating:', error);
        }
    };

    const handleAddToCargoSave = async () => {
        if (!selectedCargoId || !addingCompetenciaId || !consultoriaId || !empresaId) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('cargos_competencias')
                .insert({
                    cargo_id: selectedCargoId,
                    competencia_empresa_id: addingCompetenciaId,
                    empresa_cliente_id: empresaId,
                    consultoria_id: consultoriaId,
                    nivel_desejado: addingNivel
                });

            if (error) throw error;

            setShowAddToCargoModal(false);
            setAddingCompetenciaId('');
            setAddingNivel(3);
            await fetchCargoCompetencias();
        } catch (error: any) {
            console.error('Error adding competencia to cargo:', error);
            if (error.code === '23505') {
                alert('Esta competência já está vinculada a este cargo.');
            } else {
                alert('Erro ao adicionar competência ao cargo.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateNivel = async (cargoCompId: string, novoNivel: number) => {
        try {
            await supabase
                .from('cargos_competencias')
                .update({ nivel_desejado: novoNivel, atualizado_em: new Date().toISOString() })
                .eq('id', cargoCompId);

            await fetchCargoCompetencias();
        } catch (error) {
            console.error('Error updating nivel:', error);
        }
    };

    const handleRemoveFromCargo = async (cargoCompId: string) => {
        if (!confirm('Remover esta competência do cargo?')) return;

        try {
            await supabase
                .from('cargos_competencias')
                .delete()
                .eq('id', cargoCompId);

            await fetchCargoCompetencias();
        } catch (error) {
            console.error('Error removing:', error);
        }
    };

    // Filter competencias
    const filteredCompetencias = competencias.filter(c => {
        const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = !filterTipo || c.tipo === filterTipo;
        const matchesCha = !filterCha || c.eixo_cha === filterCha;
        const matchesStatus = showInativas || c.status === 'ativa';
        return matchesSearch && matchesTipo && matchesCha && matchesStatus;
    });

    const activeCompetencias = competencias.filter(c => c.status === 'ativa');

    const tabs = [
        { id: 'biblioteca' as Tab, label: 'Biblioteca de Competências', icon: BookOpen },
        { id: 'matriz' as Tab, label: 'Matriz CHA por Cargo', icon: Grid3X3 }
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-gray900">Competências & Matriz CHA</h1>
                    <p className="text-neutral-gray600 mt-1">Biblioteca de competências e níveis esperados por cargo</p>
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
                        {/* BIBLIOTECA TAB */}
                        {activeTab === 'biblioteca' && (
                            <div>
                                {/* Actions & Filters */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                placeholder="Buscar competência..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            />
                                        </div>
                                    </div>
                                    <select
                                        value={filterTipo}
                                        onChange={e => setFilterTipo(e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg"
                                    >
                                        <option value="">Todos os tipos</option>
                                        <option value="tecnica">Técnica</option>
                                        <option value="comportamental">Comportamental</option>
                                        <option value="organizacional">Organizacional</option>
                                    </select>
                                    <select
                                        value={filterCha}
                                        onChange={e => setFilterCha(e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg"
                                    >
                                        <option value="">Todos os eixos</option>
                                        <option value="C">C - Conhecimento</option>
                                        <option value="H">H - Habilidade</option>
                                        <option value="A">A - Atitude</option>
                                    </select>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={showInativas}
                                            onChange={e => setShowInativas(e.target.checked)}
                                        />
                                        Mostrar inativas
                                    </label>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setEditingCompetencia(null);
                                            resetForm();
                                            setShowForm(true);
                                        }}
                                        className="!py-2"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar
                                    </Button>
                                </div>

                                {/* List */}
                                {filteredCompetencias.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Target className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                        <p className="text-neutral-gray600">
                                            {competencias.length === 0 ? 'Nenhuma competência cadastrada' : 'Nenhuma competência encontrada'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredCompetencias.map(comp => {
                                            const ChaIcon = chaLabels[comp.eixo_cha].icon;
                                            return (
                                                <div
                                                    key={comp.id}
                                                    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${comp.status === 'inativa' ? 'bg-gray-100 opacity-60' : 'bg-gray-50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${chaLabels[comp.eixo_cha].color}`}>
                                                            <ChaIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-neutral-gray900">{comp.nome}</h3>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="text-neutral-gray600">{tipoLabels[comp.tipo]}</span>
                                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${chaLabels[comp.eixo_cha].color}`}>
                                                                    {chaLabels[comp.eixo_cha].label}
                                                                </span>
                                                                {comp.status === 'inativa' && (
                                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Inativa</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(comp)}
                                                            className="p-2 text-neutral-gray500 hover:text-primary-main"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        {comp.status === 'ativa' && (
                                                            <button
                                                                onClick={() => handleInactivate(comp)}
                                                                className="p-2 text-neutral-gray500 hover:text-red-500"
                                                                title="Inativar"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MATRIZ TAB */}
                        {activeTab === 'matriz' && (
                            <div>
                                {cargos.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Grid3X3 className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                        <p className="text-neutral-gray600">Cadastre cargos primeiro para definir a matriz CHA</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Cargo Selector */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <select
                                                value={selectedCargoId}
                                                onChange={e => setSelectedCargoId(e.target.value)}
                                                className="flex-1 max-w-md px-4 py-3 border border-gray-200 rounded-lg text-lg"
                                            >
                                                <option value="">Selecione um cargo</option>
                                                {cargos.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.nome} {(c.departamento as any)?.nome ? `(${(c.departamento as any).nome})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setShowMatrixView(true)}
                                                className="!py-2"
                                            >
                                                <Grid3X3 className="w-4 h-4 mr-2" />
                                                Ver Matriz Completa
                                            </Button>
                                        </div>

                                        {selectedCargoId && (
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-neutral-gray900">
                                                        Competências do Cargo
                                                    </h3>
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => setShowAddToCargoModal(true)}
                                                        disabled={activeCompetencias.length === 0}
                                                        className="!py-2"
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Adicionar Competência
                                                    </Button>
                                                </div>

                                                {cargoCompetencias.length === 0 ? (
                                                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                                                        <p className="text-neutral-gray600">Nenhuma competência vinculada a este cargo</p>
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="bg-gray-50">
                                                                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-gray600">Competência</th>
                                                                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-gray600">Tipo</th>
                                                                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-gray600">Eixo CHA</th>
                                                                    <th className="text-center px-4 py-3 text-sm font-medium text-neutral-gray600">Nível Desejado</th>
                                                                    <th className="text-center px-4 py-3 text-sm font-medium text-neutral-gray600">Ações</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y">
                                                                {cargoCompetencias.map(cc => {
                                                                    const comp = cc.competencia as any;
                                                                    if (!comp) return null;
                                                                    return (
                                                                        <tr key={cc.id} className="hover:bg-gray-50">
                                                                            <td className="px-4 py-3 font-medium">{comp.nome}</td>
                                                                            <td className="px-4 py-3 text-sm">{tipoLabels[comp.tipo]}</td>
                                                                            <td className="px-4 py-3">
                                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${chaLabels[comp.eixo_cha].color}`}>
                                                                                    {comp.eixo_cha}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-center">
                                                                                <select
                                                                                    value={cc.nivel_desejado}
                                                                                    onChange={e => handleUpdateNivel(cc.id, parseInt(e.target.value))}
                                                                                    className="px-3 py-1 border rounded text-center font-medium"
                                                                                >
                                                                                    {[1, 2, 3, 4, 5].map(n => (
                                                                                        <option key={n} value={n}>{n}</option>
                                                                                    ))}
                                                                                </select>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-center">
                                                                                <button
                                                                                    onClick={() => handleRemoveFromCargo(cc.id)}
                                                                                    className="text-red-500 hover:text-red-700"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Competencia Form Modal */}
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
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-xl font-bold text-neutral-gray900">
                                    {editingCompetencia ? 'Editar Competência' : 'Nova Competência'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">Nome *</label>
                                        <input
                                            type="text"
                                            value={formData.nome}
                                            onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            placeholder="Ex: Comunicação Assertiva"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">Tipo *</label>
                                        <select
                                            value={formData.tipo}
                                            onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                        >
                                            <option value="tecnica">Técnica</option>
                                            <option value="comportamental">Comportamental</option>
                                            <option value="organizacional">Organizacional</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">Eixo CHA *</label>
                                        <select
                                            value={formData.eixo_cha}
                                            onChange={e => setFormData(prev => ({ ...prev, eixo_cha: e.target.value as any }))}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                        >
                                            <option value="C">C - Conhecimento</option>
                                            <option value="H">H - Habilidade</option>
                                            <option value="A">A - Atitude</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">Descrição</label>
                                        <textarea
                                            value={formData.descricao}
                                            onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                            placeholder="Descrição geral da competência..."
                                        />
                                    </div>
                                </div>

                                {/* Níveis de Proficiência */}
                                <div>
                                    <h3 className="text-sm font-medium text-neutral-gray700 mb-3">Níveis de Proficiência</h3>
                                    <div className="space-y-3">
                                        {formData.niveis.map((nivel, index) => (
                                            <div key={nivel.nivel} className="flex gap-3 items-start">
                                                <div className="w-20 flex-shrink-0">
                                                    <div className="flex items-center gap-2 py-2">
                                                        <span className="w-6 h-6 bg-primary-main/10 text-primary-main font-bold text-sm rounded flex items-center justify-center">
                                                            {nivel.nivel}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={nivel.nome}
                                                            onChange={e => {
                                                                const newNiveis = [...formData.niveis];
                                                                newNiveis[index] = { ...newNiveis[index], nome: e.target.value };
                                                                setFormData(prev => ({ ...prev, niveis: newNiveis }));
                                                            }}
                                                            className="w-full text-sm border-0 border-b border-gray-200 focus:border-primary-main focus:outline-none py-1"
                                                            placeholder="Nome"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={nivel.descricao}
                                                    onChange={e => {
                                                        const newNiveis = [...formData.niveis];
                                                        newNiveis[index] = { ...newNiveis[index], descricao: e.target.value };
                                                        setFormData(prev => ({ ...prev, niveis: newNiveis }));
                                                    }}
                                                    rows={2}
                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-main"
                                                    placeholder="Descrição comportamental para este nível..."
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-neutral-gray500 mt-2">
                                        Defina a descrição para pelo menos um nível.
                                    </p>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                                <Button variant="primary" onClick={handleSave} disabled={saving || !formData.nome}>
                                    {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Competencia to Cargo Modal */}
            <AnimatePresence>
                {showAddToCargoModal && (
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
                                <h2 className="text-lg font-bold text-neutral-gray900">Adicionar Competência ao Cargo</h2>
                                <button onClick={() => setShowAddToCargoModal(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Competência *</label>
                                    <select
                                        value={addingCompetenciaId}
                                        onChange={e => setAddingCompetenciaId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                    >
                                        <option value="">Selecione</option>
                                        {activeCompetencias
                                            .filter(c => !cargoCompetencias.some(cc => cc.competencia_empresa_id === c.id))
                                            .map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.nome} ({c.eixo_cha})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Nível Desejado *</label>
                                    <select
                                        value={addingNivel}
                                        onChange={e => setAddingNivel(parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                    >
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <option key={n} value={n}>Nível {n}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowAddToCargoModal(false)}>Cancelar</Button>
                                <Button variant="primary" onClick={handleAddToCargoSave} disabled={saving || !addingCompetenciaId}>
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Adicionar'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Matrix View Modal */}
            <AnimatePresence>
                {showMatrixView && (
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
                            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto"
                        >
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-xl font-bold text-neutral-gray900">Matriz CHA Completa</h2>
                                <button onClick={() => setShowMatrixView(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                {activeCompetencias.length === 0 || cargos.length === 0 ? (
                                    <p className="text-center text-neutral-gray600 py-8">
                                        Cadastre competências e cargos para visualizar a matriz.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="text-left px-3 py-2 font-medium text-neutral-gray700 sticky left-0 bg-gray-50 min-w-[200px]">
                                                        Competência
                                                    </th>
                                                    {cargos.map(cargo => (
                                                        <th key={cargo.id} className="text-center px-3 py-2 font-medium text-neutral-gray700 min-w-[100px]">
                                                            <div className="truncate max-w-[100px]" title={cargo.nome}>
                                                                {cargo.nome}
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {activeCompetencias.map(comp => (
                                                    <tr key={comp.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 sticky left-0 bg-white">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-1.5 py-0.5 text-xs rounded ${chaLabels[comp.eixo_cha].color}`}>
                                                                    {comp.eixo_cha}
                                                                </span>
                                                                <span className="font-medium">{comp.nome}</span>
                                                            </div>
                                                        </td>
                                                        {cargos.map(cargo => {
                                                            // This would need async data - for now we show placeholder
                                                            // In production, fetch all matrix data at once
                                                            return (
                                                                <td key={cargo.id} className="text-center px-3 py-2">
                                                                    <span className="text-neutral-gray400">—</span>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </WorkspaceLayout>
    );
}
