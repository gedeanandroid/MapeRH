import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { useWorkspace, EmpresaCliente } from '../contexts/WorkspaceContext';
import {
    Building2, Plus, Search, LogOut, Settings, CreditCard,
    MoreVertical, Edit2, Archive, ArrowRight, Users, Briefcase,
    AlertCircle, Zap, UserCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import CompanyFormModal from '../components/CompanyFormModal';
import LoadingScreen from '../components/LoadingScreen';

interface Consultoria {
    id: string;
    nome: string;
    perfil_completo: boolean;
}

interface Assinatura {
    status: string;
    plano: {
        nome: string;
        limites: {
            max_empresas: number;
        };
    } | null;
}

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const { setEmpresaAtiva } = useWorkspace();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [consultoria, setConsultoria] = useState<Consultoria | null>(null);
    const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
    const [empresas, setEmpresas] = useState<EmpresaCliente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState<EmpresaCliente | null>(null);
    const [consultoriaId, setConsultoriaId] = useState<string | null>(null);
    const [primeiroLoginConcluido, setPrimeiroLoginConcluido] = useState(true);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;

        try {
            // Get user's consultoria
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('consultoria_id, nome, primeiro_login_concluido')
                .eq('auth_user_id', user.id)
                .single();

            if (userError) throw userError;
            setConsultoriaId(userData.consultoria_id);
            setPrimeiroLoginConcluido(userData.primeiro_login_concluido ?? false);

            // Get consultoria details
            const { data: consultoriaData } = await supabase
                .from('consultorias')
                .select('id, nome, perfil_completo')
                .eq('id', userData.consultoria_id)
                .single();

            setConsultoria(consultoriaData);

            // Get subscription
            const { data: assinaturaData } = await supabase
                .from('assinaturas')
                .select('status, plano:planos(nome, limites)')
                .eq('consultoria_id', userData.consultoria_id)
                .single();

            setAssinatura(assinaturaData);

            // Get client companies
            await fetchEmpresas(userData.consultoria_id);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresas = async (consId?: string) => {
        const id = consId || consultoriaId;
        if (!id) return;

        const { data, error } = await supabase
            .from('empresas_clientes')
            .select('*')
            .eq('consultoria_id', id)
            .eq('status', 'ativa')
            .order('criado_em', { ascending: false });

        if (!error && data) {
            setEmpresas(data);
        }
    };

    const handleEnterWorkspace = (empresa: EmpresaCliente) => {
        setEmpresaAtiva(empresa);
        navigate(`/workspace/${empresa.id}`);
    };

    const handleEditCompany = (empresa: EmpresaCliente) => {
        setEditingCompany(empresa);
        setShowModal(true);
    };

    const handleInactivateCompany = async (empresa: EmpresaCliente) => {
        if (!confirm(`Tem certeza que deseja inativar "${empresa.nome}"?`)) return;

        const { error } = await supabase
            .from('empresas_clientes')
            .update({ status: 'inativa', atualizado_em: new Date().toISOString() })
            .eq('id', empresa.id);

        if (!error) {
            await fetchEmpresas();
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingCompany(null);
    };

    const handleModalSuccess = () => {
        handleModalClose();
        fetchEmpresas();
    };

    const filteredEmpresas = empresas.filter(e =>
        e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const canAddMoreCompanies = () => {
        if (!assinatura?.plano?.limites?.max_empresas) return true;
        if (assinatura.plano.limites.max_empresas === -1) return true;
        return empresas.length < assinatura.plano.limites.max_empresas;
    };

    const hasActiveSubscription = assinatura && assinatura.status === 'ativa';
    const needsProfileCompletion = consultoria && !consultoria.perfil_completo;

    // Redirect to plan selection if no active subscription
    useEffect(() => {
        if (!loading && !hasActiveSubscription) {
            navigate('/planos');
        }
    }, [loading, hasActiveSubscription, navigate]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-main rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-neutral-gray900">
                                    {consultoria?.nome || 'Minha Consultoria'}
                                </h1>
                                <p className="text-xs text-neutral-gray500">Painel do Consultor</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {assinatura && (
                                <Link
                                    to="/assinatura"
                                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-main/10 text-primary-main rounded-lg text-sm font-medium hover:bg-primary-main/20 transition-colors"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    {assinatura.plano?.nome || 'Ver plano'}
                                </Link>
                            )}
                            <Link
                                to="/complete-profile"
                                className="p-2 text-neutral-gray500 hover:text-neutral-gray700 transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={signOut}
                                className="p-2 text-neutral-gray500 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Completion Banner */}
                {needsProfileCompletion && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <UserCheck className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900">Complete seu perfil</h3>
                                    <p className="text-sm text-blue-700">Adicione mais informações sobre sua consultoria para personalizar sua experiência.</p>
                                </div>
                            </div>
                            <Link to="/complete-profile">
                                <Button
                                    variant="secondary"
                                    className="!border-blue-300 !text-blue-700 hover:!bg-blue-100 whitespace-nowrap"
                                >
                                    Completar perfil
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-neutral-gray900 mb-2">
                        Olá, bem-vindo de volta! 👋
                    </h2>
                    <p className="text-neutral-gray600">
                        Gerencie suas empresas clientes e acesse os workspaces de RH.
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-main/10 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-primary-main" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-gray900">{empresas.length}</p>
                                <p className="text-sm text-neutral-gray600">Empresas ativas</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-secondary-main/10 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-secondary-main" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-gray900">
                                    {assinatura?.plano?.nome || 'Sem plano'}
                                </p>
                                <p className="text-sm text-neutral-gray600">Plano atual</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-accent-green" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-gray900">
                                    {assinatura?.plano?.limites?.max_empresas === -1
                                        ? '∞'
                                        : assinatura?.plano?.limites?.max_empresas || 0}
                                </p>
                                <p className="text-sm text-neutral-gray600">Limite de empresas</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Companies Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-xl font-bold text-neutral-gray900">Empresas Clientes</h3>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar empresa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/10"
                                />
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => setShowModal(true)}
                                disabled={!canAddMoreCompanies()}
                                className="whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar empresa
                            </Button>
                        </div>
                    </div>

                    {/* Empty State */}
                    {empresas.length === 0 ? (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-neutral-gray900 mb-2">
                                Nenhuma empresa cadastrada
                            </h4>
                            <p className="text-neutral-gray600 mb-6 max-w-md mx-auto">
                                Comece cadastrando sua primeira empresa cliente para acessar o workspace de RH.
                            </p>
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Cadastrar primeira empresa
                            </Button>
                        </div>
                    ) : (
                        /* Company Cards */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredEmpresas.map((empresa, index) => (
                                    <motion.div
                                        key={empresa.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                                    >
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-main/10 rounded-lg flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-primary-main" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-neutral-gray900">{empresa.nome}</h4>
                                                        {empresa.nome_fantasia && (
                                                            <p className="text-xs text-neutral-gray500">{empresa.nome_fantasia}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="relative group/menu">
                                                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 min-w-[140px]">
                                                        <button
                                                            onClick={() => handleEditCompany(empresa)}
                                                            className="w-full px-4 py-2 text-left text-sm text-neutral-gray700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleInactivateCompany(empresa)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                            Inativar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-sm text-neutral-gray600 mb-4">
                                                {empresa.segmento && <p>📁 {empresa.segmento}</p>}
                                                {empresa.cnpj && <p>🏢 {empresa.cnpj}</p>}
                                            </div>

                                            <Button
                                                variant="secondary"
                                                className="w-full"
                                                onClick={() => handleEnterWorkspace(empresa)}
                                            >
                                                Entrar no workspace
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Company Form Modal */}
            <CompanyFormModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                company={editingCompany}
                consultoriaId={consultoriaId || ''}
            />
        </div>
    );
}
