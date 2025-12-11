import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { userService } from '../services/userService';
import { Database } from '../lib/database.types';
import UserFormModal from '../components/UserFormModal';
import { Plus, User, Search, Edit2, Shield, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';

type UsuarioEmpresa = Database['public']['Tables']['usuarios_empresa']['Row'];

export default function UserManagement() {
    const { empresaAtiva } = useWorkspace();
    const { userProfile } = useAuth();
    const [users, setUsers] = useState<UsuarioEmpresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UsuarioEmpresa | undefined>(undefined);

    const loadUsers = async () => {
        if (!empresaAtiva) return;
        setLoading(true);
        try {
            const data = await userService.listUsuariosEmpresa(empresaAtiva.id);
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [empresaAtiva?.id]);

    const handleCreateUser = async (data: any) => {
        if (!empresaAtiva || !userProfile?.consultoriaId) return;

        // Mock auth_user_id for now as we don't have a real invite flow yet
        // In a real app, this would call a backend function to create auth user
        // For verify purpose, I will use a placeholder or random uuid if DB allows (it won't, FK constraint)
        // Hmm, this is a blocker for "Creating" a user purely from frontend without Backend/Edge Function.
        // But wait, I can use a known auth user ID if I have one, or fail.
        // Actually, the user requirement is Implementation.
        // For now, I will assume I can't easily create a NEW auth user from client.
        // But I will implement the UI logic.
        // To make it work, I might need to skip the actual INSERT if it fails due to FK.
        // OR, I can ask the user if they want me to create an Edge Function?
        // But let's try to proceed with the UI code first. 
        // I'll alert the user that "Invite" functionality needs an Edge Function or Backend logic.

        alert('Funcionalidade de convite requer integração com Auth (Edge Function). O registro será tentado, mas pode falhar sem um auth_user_id válido.');

        try {
            await userService.createUsuarioEmpresa({
                ...data,
                consultoria_id: userProfile.consultoriaId,
                empresa_cliente_id: empresaAtiva.id,
                auth_user_id: '00000000-0000-0000-0000-000000000000', // Placeholder, will fail FK
                nome: data.nome,
                email: data.email,
                role_empresa: data.role_empresa,
            });
            await loadUsers();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Erro ao criar usuário. Verifique se o backend está configurado para convites.');
        }
    };

    // NOTE: Real implementation requires Supabase Edge Function to invite user by email.

    const filteredUsers = users.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-gray900">Gestão de Usuários</h1>
                    <p className="text-sm text-neutral-gray500 mt-1">
                        Gerencie o acesso à empresa {empresaAtiva?.nome}
                    </p>
                </div>
                <button
                    onClick={() => { setSelectedUser(undefined); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray500 uppercase tracking-wider">Papel</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-gray500 uppercase tracking-wider">Data Criação</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-gray500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-gray500">
                                        Carregando usuários...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-gray500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-main/10 flex items-center justify-center text-primary-main">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-neutral-gray900">{user.nome}</div>
                                                    <div className="flex items-center gap-1 text-xs text-neutral-gray500">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-neutral-gray400" />
                                                <span className="text-sm text-neutral-gray700 capitalize">
                                                    {user.role_empresa.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.ativo ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                    <XCircle className="w-3 h-3" />
                                                    Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-gray500">
                                            {new Date(user.criado_em || '').toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                className="p-2 text-neutral-gray400 hover:text-primary-main transition-colors"
                                                onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateUser}
                title={selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
                initialData={selectedUser ? {
                    nome: selectedUser.nome,
                    email: selectedUser.email,
                    role_empresa: selectedUser.role_empresa as any,
                    ativo: selectedUser.ativo || false
                } : undefined}
            />
        </div>
    );
}
