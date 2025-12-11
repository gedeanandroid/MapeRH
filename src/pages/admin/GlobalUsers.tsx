import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import { Search, Loader2, UserCog, Building2, User } from 'lucide-react';
import Button from '../../../components/ui/Button';

interface GlobalUser {
    id: string;
    nome: string;
    email: string;
    role: string;
    type: 'consultor' | 'usuario_empresa';
    company_name?: string;
}

export default function GlobalUsers() {
    const { impersonateUser } = useAuth();
    const [users, setUsers] = useState<GlobalUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            // 1. Fetch Consultors
            const { data: consultors } = await supabase
                .from('usuarios')
                .select('id, nome, email, role_plataforma');

            // 2. Fetch Company Users
            const { data: companyUsers } = await supabase
                .from('usuarios_empresa')
                .select(`
                    id, 
                    nome, 
                    email, 
                    role_empresa, 
                    empresas_clientes (nome)
                `);

            const mappedConsultors: GlobalUser[] = (consultors || []).map(c => ({
                id: c.id,
                nome: c.nome,
                email: c.email,
                role: c.role_plataforma || 'consultor',
                type: 'consultor'
            }));

            const mappedCompanyUsers: GlobalUser[] = (companyUsers || []).map((u: any) => ({
                id: u.id,
                nome: u.nome,
                email: u.email,
                role: u.role_empresa,
                type: 'usuario_empresa',
                company_name: Array.isArray(u.empresas_clientes)
                    ? u.empresas_clientes[0]?.nome
                    : u.empresas_clientes?.nome
            }));

            setUsers([...mappedConsultors, ...mappedCompanyUsers]);

        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async (userId: string, userName: string) => {
        if (!confirm(`Tem certeza que deseja assumir a identidade de ${userName}?`)) return;

        setImpersonatingId(userId);
        try {
            await impersonateUser(userId, `Acesso administrativo via Painel Global`);
        } catch (error: any) {
            alert(error.message);
            setImpersonatingId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Usuários Globais</h1>
                <p className="text-gray-500">Gerenciamento e acesso a todos os usuários da plataforma</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar usuários..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-main"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin w-8 h-8 text-primary-main" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Usuário</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Tipo</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Empresa</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => (
                                <tr key={`${user.type}-${user.id}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.type === 'consultor' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {user.type === 'consultor' ? <UserCog className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.nome}</div>
                                                <div className="text-gray-500 text-xs">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.type === 'consultor' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                            {user.type === 'consultor' ? 'Plataforma' : 'Cliente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 capitalize">
                                        {user.role}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {user.company_name ? (
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3 h-3 text-gray-400" />
                                                {user.company_name}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role !== 'superadmin' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="!py-1 !text-xs"
                                                onClick={() => handleImpersonate(user.id, user.nome)}
                                                disabled={!!impersonatingId}
                                            >
                                                {impersonatingId === user.id ? (
                                                    <Loader2 className="animate-spin w-3 h-3 mr-1" />
                                                ) : (
                                                    <UserCog className="w-3 h-3 mr-1" />
                                                )}
                                                Acessar
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
