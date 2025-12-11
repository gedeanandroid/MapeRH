import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import { auditService } from '../../services/auditService';
import WorkspaceLayout from '../../components/WorkspaceLayout';
import {
    Users, Plus, Search, Loader2, Edit3, X, Mail,
    UserCheck, UserX, Key, AlertTriangle
} from 'lucide-react';
import Button from '../../../components/ui/Button';

interface UsuarioEmpresa {
    id: string;
    auth_user_id: string;
    nome: string;
    email: string;
    role_empresa: string;
    ativo: boolean;
    primeiro_login: boolean;
    criado_em: string;
}

const roleLabels: Record<string, { label: string; color: string }> = {
    admin_empresa: { label: 'Admin RH', color: 'bg-primary-main/10 text-primary-main' },
    gestor: { label: 'Gestor', color: 'bg-blue-100 text-blue-700' },
    visualizador: { label: 'Visualizador', color: 'bg-gray-100 text-gray-600' }
};

export default function CompanyUsers() {
    const { empresaId } = useParams<{ empresaId: string }>();
    const { user, userProfile } = useAuth();
    const [usuarios, setUsuarios] = useState<UsuarioEmpresa[]>([]);
    const [empresaNome, setEmpresaNome] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<UsuarioEmpresa | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUser, setResetUser] = useState<UsuarioEmpresa | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        role_empresa: 'admin_empresa',
        senha: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [empresaId]);

    const fetchData = async () => {
        if (!empresaId) return;

        try {
            // Get empresa name
            const { data: empresaData } = await supabase
                .from('empresas_clientes')
                .select('nome')
                .eq('id', empresaId)
                .single();
            if (empresaData) setEmpresaNome(empresaData.nome);

            // Get usuarios
            const { data: usuariosData } = await supabase
                .from('usuarios_empresa')
                .select('*')
                .eq('empresa_cliente_id', empresaId)
                .order('nome');
            if (usuariosData) setUsuarios(usuariosData);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nome: '',
            email: '',
            role_empresa: 'admin_empresa',
            senha: ''
        });
        setError(null);
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, senha: password }));
    };

    const handleSave = async () => {
        if (!empresaId || !userProfile) return;

        if (!formData.nome || !formData.email) {
            setError('Preencha nome e e-mail.');
            return;
        }

        if (!editingUser && !formData.senha) {
            setError('Defina uma senha inicial.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            if (editingUser) {
                // Update existing user
                const oldData = { nome: editingUser.nome, role_empresa: editingUser.role_empresa };

                await supabase
                    .from('usuarios_empresa')
                    .update({
                        nome: formData.nome,
                        role_empresa: formData.role_empresa,
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', editingUser.id);

                // Audit log
                await auditService.logUpdate(
                    { id: userProfile.id, type: userProfile.role!, name: userProfile.nome, email: userProfile.email },
                    { consultoriaId: userProfile.consultoriaId!, empresaClienteId: empresaId },
                    'usuarios_empresa',
                    editingUser.id,
                    oldData,
                    { nome: formData.nome, role_empresa: formData.role_empresa }
                );

                setSuccess('Usuário atualizado com sucesso!');
            } else {
                // Create new user via Edge Function
                const { data: newUser, error: funcError } = await supabase.functions.invoke('invite-user', {
                    body: {
                        email: formData.email,
                        password: formData.senha,
                        nome: formData.nome,
                        role_empresa: formData.role_empresa,
                        empresa_id: empresaId,
                        consultoria_id: userProfile.consultoriaId
                    }
                });

                if (funcError) throw new Error(funcError.message || 'Erro ao chamar função de convite');
                // The edge function might return an error structure in the body even if status is 200 ok for infrastructure, 
                // but usually invokes throws on 400/500 if configured, or returns data.error.
                // Checking if data has error property if the function wraps it.
                if (newUser && newUser.error) throw new Error(newUser.error);

                // Audit log
                await auditService.logInsert(
                    { id: userProfile.id, type: userProfile.role!, name: userProfile.nome, email: userProfile.email },
                    { consultoriaId: userProfile.consultoriaId!, empresaClienteId: empresaId },
                    'usuarios_empresa',
                    newUser.id,
                    { nome: formData.nome, email: formData.email, role_empresa: formData.role_empresa }
                );

                setSuccess(`Usuário criado com sucesso! Senha temporária: ${formData.senha}`);
            }

            setShowForm(false);
            setEditingUser(null);
            resetForm();
            await fetchData();
        } catch (error: any) {
            console.error('Error saving user:', error);
            setError(error.message || 'Erro ao salvar usuário.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (usuario: UsuarioEmpresa) => {
        if (!userProfile) return;

        try {
            await supabase
                .from('usuarios_empresa')
                .update({ ativo: !usuario.ativo, atualizado_em: new Date().toISOString() })
                .eq('id', usuario.id);

            // Audit log
            await auditService.logUpdate(
                { id: userProfile.id, type: userProfile.role!, name: userProfile.nome, email: userProfile.email },
                { consultoriaId: userProfile.consultoriaId!, empresaClienteId: empresaId! },
                'usuarios_empresa',
                usuario.id,
                { ativo: usuario.ativo },
                { ativo: !usuario.ativo }
            );

            await fetchData();
        } catch (error) {
            console.error('Error toggling user:', error);
        }
    };

    const handleResetPassword = async () => {
        if (!resetUser) return;

        try {
            await supabase.auth.resetPasswordForEmail(resetUser.email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            setSuccess(`E-mail de redefinição enviado para ${resetUser.email}`);
            setShowResetModal(false);
            setResetUser(null);
        } catch (error: any) {
            setError(error.message || 'Erro ao enviar e-mail de redefinição.');
        }
    };

    const filteredUsuarios = usuarios.filter(u =>
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Only consultors can access this page
    if (userProfile?.role === 'admin_empresa') {
        return (
            <WorkspaceLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <p className="text-neutral-gray600">Você não tem permissão para acessar esta página.</p>
                    </div>
                </div>
            </WorkspaceLayout>
        );
    }

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
                        <h1 className="text-3xl font-bold text-neutral-gray900">Usuários da Empresa</h1>
                        <p className="text-neutral-gray600 mt-1">
                            Gerencie os usuários que podem acessar o workspace de <strong>{empresaNome}</strong>
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingUser(null);
                            resetForm();
                            generatePassword();
                            setShowForm(true);
                        }}
                        className="!py-2"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Admin RH
                    </Button>
                </div>

                {/* Success/Error Messages */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
                        >
                            {success}
                            <button onClick={() => setSuccess(null)} className="float-right">×</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-white rounded-xl shadow-md">
                    {/* Search */}
                    <div className="p-4 border-b">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nome ou e-mail..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="p-4">
                        {filteredUsuarios.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-neutral-gray400 mx-auto mb-4" />
                                <p className="text-neutral-gray600">
                                    {usuarios.length === 0 ? 'Nenhum usuário cadastrado' : 'Nenhum usuário encontrado'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredUsuarios.map(usuario => (
                                    <div
                                        key={usuario.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${usuario.ativo ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${usuario.ativo ? 'bg-primary-main/10' : 'bg-gray-200'}`}>
                                                <span className={`font-semibold ${usuario.ativo ? 'text-primary-main' : 'text-gray-500'}`}>
                                                    {usuario.nome.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className={`font-medium ${usuario.ativo ? 'text-neutral-gray900' : 'text-gray-500'}`}>
                                                    {usuario.nome}
                                                </p>
                                                <p className="text-sm text-neutral-gray500">{usuario.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleLabels[usuario.role_empresa]?.color || 'bg-gray-100'}`}>
                                                {roleLabels[usuario.role_empresa]?.label || usuario.role_empresa}
                                            </span>

                                            {!usuario.ativo && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    Inativo
                                                </span>
                                            )}

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(usuario);
                                                        setFormData({
                                                            nome: usuario.nome,
                                                            email: usuario.email,
                                                            role_empresa: usuario.role_empresa,
                                                            senha: ''
                                                        });
                                                        setShowForm(true);
                                                    }}
                                                    className="p-1.5 text-neutral-gray500 hover:text-primary-main"
                                                    title="Editar"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setResetUser(usuario);
                                                        setShowResetModal(true);
                                                    }}
                                                    className="p-1.5 text-neutral-gray500 hover:text-yellow-600"
                                                    title="Redefinir senha"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(usuario)}
                                                    className={`p-1.5 ${usuario.ativo ? 'text-neutral-gray500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}`}
                                                    title={usuario.ativo ? 'Desativar' : 'Ativar'}
                                                >
                                                    {usuario.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                        >
                            <div className="border-b px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-neutral-gray900">
                                    {editingUser ? 'Editar Usuário' : 'Novo Admin RH'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-neutral-gray500 hover:text-neutral-gray700">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">E-mail *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        disabled={!!editingUser}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-gray700 mb-1">Papel</label>
                                    <select
                                        value={formData.role_empresa}
                                        onChange={e => setFormData(prev => ({ ...prev, role_empresa: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                                    >
                                        <option value="admin_empresa">Admin RH</option>
                                        <option value="gestor">Gestor</option>
                                        <option value="visualizador">Visualizador</option>
                                    </select>
                                </div>

                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">Senha Inicial *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.senha}
                                                onChange={e => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main font-mono"
                                            />
                                            <Button variant="secondary" onClick={generatePassword} type="button">
                                                Gerar
                                            </Button>
                                        </div>
                                        <p className="text-xs text-neutral-gray500 mt-1">
                                            Anote esta senha para informar ao usuário.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={saving || !formData.nome || !formData.email}
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Salvar'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Password Modal */}
            <AnimatePresence>
                {showResetModal && resetUser && (
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
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-6 h-6 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-gray900 mb-2">Redefinir Senha</h3>
                                <p className="text-sm text-neutral-gray600">
                                    Enviar e-mail de redefinição de senha para <strong>{resetUser.email}</strong>?
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary" className="flex-1" onClick={() => setShowResetModal(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" className="flex-1" onClick={handleResetPassword}>
                                    Enviar E-mail
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </WorkspaceLayout>
    );
}
