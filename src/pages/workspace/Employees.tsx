import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    Users, Plus, Search, Loader2, Edit3, Eye, X,
    Building2, Briefcase, Network, Calendar, Phone, Mail, UserCheck, UserX
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface Colaborador {
    id: string;
    nome_completo: string;
    email: string | null;
    telefone: string | null;
    cpf: string | null;
    data_nascimento: string | null;
    unidade_id: string | null;
    departamento_id: string;
    cargo_id: string;
    gestor_id: string | null;
    local_trabalho: string | null;
    data_admissao: string;
    tipo_vinculo: string;
    matricula: string | null;
    jornada_padrao: string | null;
    status: 'ativo' | 'desligado' | 'afastado';
    data_desligamento: string | null;
    unidade?: { nome: string };
    departamento?: { nome: string };
    cargo?: { nome: string };
    gestor?: { nome_completo: string };
}

interface Unidade {
    id: string;
    nome: string;
}

interface Departamento {
    id: string;
    nome: string;
}

interface Cargo {
    id: string;
    nome: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    ativo: { label: 'Ativo', color: 'bg-green-100 text-green-700' },
    desligado: { label: 'Desligado', color: 'bg-red-100 text-red-700' },
    afastado: { label: 'Afastado', color: 'bg-yellow-100 text-yellow-700' }
};

const vinculoLabels: Record<string, string> = {
    CLT: 'CLT',
    PJ: 'PJ',
    estagio: 'Estágio',
    temporario: 'Temporário',
    outro: 'Outro'
};

export default function Employees() {
    const { empresaId } = useParams<{ empresaId: string }>();
    const { user } = useAuth();
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [consultoriaId, setConsultoriaId] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ativo');
    const [filterUnidade, setFilterUnidade] = useState('');
    const [filterDepartamento, setFilterDepartamento] = useState('');
    const [filterCargo, setFilterCargo] = useState('');

    // Modals
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
    const [viewingColaborador, setViewingColaborador] = useState<Colaborador | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        telefone: '',
        cpf: '',
        data_nascimento: '',
        unidade_id: '',
        departamento_id: '',
        cargo_id: '',
        gestor_id: '',
        local_trabalho: '',
        data_admissao: '',
        tipo_vinculo: 'CLT',
        matricula: '',
        jornada_padrao: '',
        status: 'ativo',
        data_desligamento: ''
    });

    // Status change
    const [statusChangeData, setStatusChangeData] = useState({ status: '', data_desligamento: '' });

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
            const { data: deptData } = await supabase
                .from('departamentos')
                .select('id, nome')
                .eq('empresa_cliente_id', empresaId)
                .eq('status', 'ativo')
                .order('nome');
            if (deptData) setDepartamentos(deptData);

            // Fetch cargos
            const { data: cargosData } = await supabase
                .from('cargos')
                .select('id, nome')
                .eq('empresa_cliente_id', empresaId)
                .eq('status', 'ativo')
                .order('nome');
            if (cargosData) setCargos(cargosData);

            // Fetch colaboradores
            const { data: colabData } = await supabase
                .from('colaboradores')
                .select(`
                    *,
                    unidade:unidades_organizacionais(nome),
                    departamento:departamentos(nome),
                    cargo:cargos(nome),
                    gestor:colaboradores!gestor_id(nome_completo)
                `)
                .eq('empresa_cliente_id', empresaId)
                .order('nome_completo');

            if (colabData) setColaboradores(colabData);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nome_completo: '',
            email: '',
            telefone: '',
            cpf: '',
            data_nascimento: '',
            unidade_id: '',
            departamento_id: departamentos[0]?.id || '',
            cargo_id: cargos[0]?.id || '',
            gestor_id: '',
            local_trabalho: '',
            data_admissao: new Date().toISOString().split('T')[0],
            tipo_vinculo: 'CLT',
            matricula: '',
            jornada_padrao: '',
            status: 'ativo',
            data_desligamento: ''
        });
    };

    const handleEdit = (colab: Colaborador) => {
        setEditingColaborador(colab);
        setFormData({
            nome_completo: colab.nome_completo,
            email: colab.email || '',
            telefone: colab.telefone || '',
            cpf: colab.cpf || '',
            data_nascimento: colab.data_nascimento || '',
            unidade_id: colab.unidade_id || '',
            departamento_id: colab.departamento_id,
            cargo_id: colab.cargo_id,
            gestor_id: colab.gestor_id || '',
            local_trabalho: colab.local_trabalho || '',
            data_admissao: colab.data_admissao,
            tipo_vinculo: colab.tipo_vinculo,
            matricula: colab.matricula || '',
            jornada_padrao: colab.jornada_padrao || '',
            status: colab.status,
            data_desligamento: colab.data_desligamento || ''
        });
        setShowForm(true);
    };

    const handleView = (colab: Colaborador) => {
        setViewingColaborador(colab);
        setShowDetail(true);
    };

    const handleStatusChange = (colab: Colaborador) => {
        setEditingColaborador(colab);
        setStatusChangeData({
            status: colab.status,
            data_desligamento: colab.data_desligamento || ''
        });
        setShowStatusModal(true);
    };

    const handleSave = async () => {
        if (!empresaId || !consultoriaId || !formData.nome_completo || !formData.departamento_id || !formData.cargo_id || !formData.data_admissao) {
            alert('Preencha os campos obrigatórios.');
            return;
        }

        // Validate desligamento date
        if (formData.status === 'desligado' && !formData.data_desligamento) {
            alert('Informe a data de desligamento.');
            return;
        }

        if (formData.data_desligamento && formData.data_desligamento < formData.data_admissao) {
            alert('A data de desligamento não pode ser anterior à data de admissão.');
            return;
        }

        setSaving(true);
        try {
            const colabData = {
                empresa_cliente_id: empresaId,
                consultoria_id: consultoriaId,
                nome_completo: formData.nome_completo,
                email: formData.email || null,
                telefone: formData.telefone || null,
                cpf: formData.cpf || null,
                data_nascimento: formData.data_nascimento || null,
                unidade_id: formData.unidade_id || null,
                departamento_id: formData.departamento_id,
                cargo_id: formData.cargo_id,
                gestor_id: formData.gestor_id || null,
                local_trabalho: formData.local_trabalho || null,
                data_admissao: formData.data_admissao,
                tipo_vinculo: formData.tipo_vinculo,
                matricula: formData.matricula || null,
                jornada_padrao: formData.jornada_padrao || null,
                status: formData.status,
                data_desligamento: formData.status === 'desligado' ? formData.data_desligamento : null,
                atualizado_em: new Date().toISOString()
            };

            if (editingColaborador) {
                await supabase
                    .from('colaboradores')
                    .update(colabData)
                    .eq('id', editingColaborador.id);
            } else {
                await supabase
                    .from('colaboradores')
                    .insert(colabData);
            }

            setShowForm(false);
            setEditingColaborador(null);
            resetForm();
            await fetchData();
        } catch (error) {
            console.error('Error saving colaborador:', error);
            alert('Erro ao salvar colaborador.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveStatus = async () => {
        if (!editingColaborador) return;

        if (statusChangeData.status === 'desligado' && !statusChangeData.data_desligamento) {
            alert('Informe a data de desligamento.');
            return;
        }

        setSaving(true);
        try {
            await supabase
                .from('colaboradores')
                .update({
                    status: statusChangeData.status,
                    data_desligamento: statusChangeData.status === 'desligado' ? statusChangeData.data_desligamento : null,
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', editingColaborador.id);

            setShowStatusModal(false);
            setEditingColaborador(null);
            await fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erro ao alterar status.');
        } finally {
            setSaving(false);
        }
    };

    // Filter colaboradores
    const filteredColaboradores = colaboradores.filter(c => {
        const matchesSearch = c.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.matricula?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'todos' || c.status === filterStatus;
        const matchesUnidade = !filterUnidade || c.unidade_id === filterUnidade;
        const matchesDept = !filterDepartamento || c.departamento_id === filterDepartamento;
        const matchesCargo = !filterCargo || c.cargo_id === filterCargo;
        return matchesSearch && matchesStatus && matchesUnidade && matchesDept && matchesCargo;
    });

    const gestoresDisponiveis = colaboradores.filter(c =>
        c.status === 'ativo' && c.id !== editingColaborador?.id
    );

    if (loading) {
        return (
            <WorkspaceLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="animate-spin h-8 w-8 text-primary-main" />
                </div>
            </WorkspaceLayout>
        );
    }

    const canAddEmployee = departamentos.length > 0 && cargos.length > 0;

    return (
        <WorkspaceLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-gray900">Colaboradores</h1>
                        <p className="text-neutral-gray600 mt-1">Cadastro e gestão de colaboradores da empresa</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingColaborador(null);
                            resetForm();
                            setShowForm(true);
                        }}
                        disabled={!canAddEmployee}
                        className="!py-2"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Colaborador
                    </Button>
                </div>

                {!canAddEmployee && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <p className="text-yellow-800">
                            Cadastre pelo menos um departamento e um cargo antes de adicionar colaboradores.
                        </p>
                    </div>
                )}

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
                                        placeholder="Buscar por nome, e-mail ou matrícula..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                    />
                                </div>
                            </div>
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg"
                            >
                                <option value="ativo">Ativos</option>
                                <option value="desligado">Desligados</option>
                                <option value="afastado">Afastados</option>
                                <option value="todos">Todos</option>
                            </select>
                            <select
                                value={filterUnidade}
                                onChange={e => setFilterUnidade(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg"
                            >
                                <option value="">Todas as unidades</option>
                                {unidades.map(u => (
                                    <option key={u.id} value={u.id}>{u.nome}</option>
                                ))}
                            </select>
                            <select
                                value={filterDepartamento}
                                onChange={e => setFilterDepartamento(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg"
                            >
                                <option value="">Todos os departamentos</option>
                                {departamentos.map(d => (
                                    <option key={d.id} value={d.id}>{d.nome}</option>
                                ))}
                            </select>
                            <select
                                value={filterCargo}
                                onChange={e => setFilterCargo(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg"
                            >
                                <option value="">Todos os cargos</option>
                                {cargos.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* List */}
                    <div className="p-4">
                        {filteredColaboradores.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                <p className="text-neutral-gray600">
                                    {colaboradores.length === 0 ? 'Nenhum colaborador cadastrado' : 'Nenhum colaborador encontrado'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left px-4 py-3 font-medium text-neutral-gray600">Nome</th>
                                            <th className="text-left px-4 py-3 font-medium text-neutral-gray600">Cargo</th>
                                            <th className="text-left px-4 py-3 font-medium text-neutral-gray600">Departamento</th>
                                            <th className="text-left px-4 py-3 font-medium text-neutral-gray600">Admissão</th>
                                            <th className="text-center px-4 py-3 font-medium text-neutral-gray600">Status</th>
                                            <th className="text-center px-4 py-3 font-medium text-neutral-gray600">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredColaboradores.map(colab => (
                                            <tr key={colab.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary-main/10 rounded-full flex items-center justify-center">
                                                            <span className="text-primary-main font-semibold">
                                                                {colab.nome_completo.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-neutral-gray900">{colab.nome_completo}</p>
                                                            {colab.email && <p className="text-xs text-neutral-gray500">{colab.email}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{(colab.cargo as any)?.nome}</td>
                                                <td className="px-4 py-3">{(colab.departamento as any)?.nome}</td>
                                                <td className="px-4 py-3">
                                                    {new Date(colab.data_admissao).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[colab.status].color}`}>
                                                        {statusLabels[colab.status].label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleView(colab)}
                                                            className="p-1.5 text-neutral-gray500 hover:text-primary-main"
                                                            title="Ver detalhes"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(colab)}
                                                            className="p-1.5 text-neutral-gray500 hover:text-primary-main"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(colab)}
                                                            className="p-1.5 text-neutral-gray500 hover:text-yellow-600"
                                                            title="Alterar status"
                                                        >
                                                            {colab.status === 'ativo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
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
                                    {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Dados Pessoais */}
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-gray700 mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Dados Pessoais
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Nome Completo *</label>
                                            <input
                                                type="text"
                                                value={formData.nome_completo}
                                                onChange={e => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">E-mail</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Telefone</label>
                                            <input
                                                type="tel"
                                                value={formData.telefone}
                                                onChange={e => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">CPF</label>
                                            <input
                                                type="text"
                                                value={formData.cpf}
                                                onChange={e => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Data de Nascimento</label>
                                            <input
                                                type="date"
                                                value={formData.data_nascimento}
                                                onChange={e => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dados Organizacionais */}
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-gray700 mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Dados Organizacionais
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Unidade</label>
                                            <select
                                                value={formData.unidade_id}
                                                onChange={e => setFormData(prev => ({ ...prev, unidade_id: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="">Selecione</option>
                                                {unidades.map(u => (
                                                    <option key={u.id} value={u.id}>{u.nome}</option>
                                                ))}
                                            </select>
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
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Cargo *</label>
                                            <select
                                                value={formData.cargo_id}
                                                onChange={e => setFormData(prev => ({ ...prev, cargo_id: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="">Selecione</option>
                                                {cargos.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Gestor Imediato</label>
                                            <select
                                                value={formData.gestor_id}
                                                onChange={e => setFormData(prev => ({ ...prev, gestor_id: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="">Nenhum</option>
                                                {gestoresDisponiveis.map(g => (
                                                    <option key={g.id} value={g.id}>{g.nome_completo}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Local de Trabalho</label>
                                            <select
                                                value={formData.local_trabalho}
                                                onChange={e => setFormData(prev => ({ ...prev, local_trabalho: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="">Selecione</option>
                                                <option value="presencial">Presencial</option>
                                                <option value="remoto">Remoto</option>
                                                <option value="hibrido">Híbrido</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Dados Contratuais */}
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-gray700 mb-3 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> Dados Contratuais
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Data de Admissão *</label>
                                            <input
                                                type="date"
                                                value={formData.data_admissao}
                                                onChange={e => setFormData(prev => ({ ...prev, data_admissao: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Tipo de Vínculo *</label>
                                            <select
                                                value={formData.tipo_vinculo}
                                                onChange={e => setFormData(prev => ({ ...prev, tipo_vinculo: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            >
                                                <option value="CLT">CLT</option>
                                                <option value="PJ">PJ</option>
                                                <option value="estagio">Estágio</option>
                                                <option value="temporario">Temporário</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Matrícula</label>
                                            <input
                                                type="text"
                                                value={formData.matricula}
                                                onChange={e => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">Jornada Padrão</label>
                                            <input
                                                type="text"
                                                value={formData.jornada_padrao}
                                                onChange={e => setFormData(prev => ({ ...prev, jornada_padrao: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                                placeholder="Ex: 8h/dia, 44h/semana"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={saving || !formData.nome_completo || !formData.departamento_id || !formData.cargo_id}
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {showDetail && viewingColaborador && (
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
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
                        >
                            <div className="bg-primary-main text-white px-6 py-4 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold">{viewingColaborador.nome_completo}</h2>
                                        <p className="text-sm opacity-80">{(viewingColaborador.cargo as any)?.nome}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[viewingColaborador.status].color}`}>
                                        {statusLabels[viewingColaborador.status].label}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {viewingColaborador.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-neutral-gray400" />
                                            <span className="text-sm">{viewingColaborador.email}</span>
                                        </div>
                                    )}
                                    {viewingColaborador.telefone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-neutral-gray400" />
                                            <span className="text-sm">{viewingColaborador.telefone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold text-neutral-gray700 mb-3">Dados Organizacionais</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-neutral-gray500">Departamento</p>
                                            <p className="font-medium">{(viewingColaborador.departamento as any)?.nome}</p>
                                        </div>
                                        {viewingColaborador.unidade && (
                                            <div>
                                                <p className="text-neutral-gray500">Unidade</p>
                                                <p className="font-medium">{(viewingColaborador.unidade as any)?.nome}</p>
                                            </div>
                                        )}
                                        {viewingColaborador.gestor && (
                                            <div>
                                                <p className="text-neutral-gray500">Gestor</p>
                                                <p className="font-medium">{(viewingColaborador.gestor as any)?.nome_completo}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-semibold text-neutral-gray700 mb-3">Dados Contratuais</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-neutral-gray500">Tipo de Vínculo</p>
                                            <p className="font-medium">{vinculoLabels[viewingColaborador.tipo_vinculo]}</p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-gray500">Data de Admissão</p>
                                            <p className="font-medium">{new Date(viewingColaborador.data_admissao).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        {viewingColaborador.data_desligamento && (
                                            <div>
                                                <p className="text-neutral-gray500">Data de Desligamento</p>
                                                <p className="font-medium">{new Date(viewingColaborador.data_desligamento).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowDetail(false)}>Fechar</Button>
                                <Button variant="primary" onClick={() => { setShowDetail(false); handleEdit(viewingColaborador); }}>
                                    <Edit3 className="w-4 h-4 mr-2" /> Editar
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Change Modal */}
            <AnimatePresence>
                {showStatusModal && editingColaborador && (
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
                                <h2 className="text-lg font-bold text-neutral-gray900">Alterar Status</h2>
                                <button onClick={() => setShowStatusModal(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <p className="text-sm text-neutral-gray600">
                                    Colaborador: <strong>{editingColaborador.nome_completo}</strong>
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Novo Status</label>
                                    <select
                                        value={statusChangeData.status}
                                        onChange={e => setStatusChangeData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                    >
                                        <option value="ativo">Ativo</option>
                                        <option value="afastado">Afastado</option>
                                        <option value="desligado">Desligado</option>
                                    </select>
                                </div>
                                {statusChangeData.status === 'desligado' && (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">Data de Desligamento *</label>
                                        <input
                                            type="date"
                                            value={statusChangeData.data_desligamento}
                                            onChange={e => setStatusChangeData(prev => ({ ...prev, data_desligamento: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancelar</Button>
                                <Button variant="primary" onClick={handleSaveStatus} disabled={saving}>
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
