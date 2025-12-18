import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    Building, Users, CreditCard, AlertTriangle,
    TrendingUp, Activity, ArrowRight, Clock
} from 'lucide-react';

interface DashboardStats {
    totalConsultorias: number;
    consultoriasAtivas: number;
    consultoriasTrial: number;
    consultoriasSuspensas: number;
    totalEmpresas: number;
    totalUsuarios: number;
    faturamentoMes: number;
}

interface RecentActivity {
    id: string;
    tipo: string;
    descricao: string;
    tempo: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalConsultorias: 0,
        consultoriasAtivas: 0,
        consultoriasTrial: 0,
        consultoriasSuspensas: 0,
        totalEmpresas: 0,
        totalUsuarios: 0,
        faturamentoMes: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch consultorias count
            const { data: consultorias } = await supabase
                .from('consultorias')
                .select('id, status');

            const totalConsultorias = consultorias?.length || 0;
            const consultoriasAtivas = consultorias?.filter(c => c.status === 'ativo' || !c.status).length || 0;
            const consultoriasTrial = consultorias?.filter(c => c.status === 'trial').length || 0;
            const consultoriasSuspensas = consultorias?.filter(c => c.status === 'suspenso').length || 0;

            // Fetch empresas count
            const { count: totalEmpresas } = await supabase
                .from('empresas_clientes')
                .select('id', { count: 'exact', head: true });

            // Fetch usuarios count
            const { count: totalUsuarios } = await supabase
                .from('usuarios')
                .select('id', { count: 'exact', head: true });

            // Fetch assinaturas for billing
            const { data: assinaturas } = await supabase
                .from('assinaturas')
                .select('valor_cobranca_centavos, status')
                .eq('status', 'ativa');

            const faturamentoMes = assinaturas?.reduce((acc, a) => acc + (a.valor_cobranca_centavos || 0), 0) || 0;

            // Fetch recent audit logs
            const { data: logs } = await supabase
                .from('audit_log')
                .select('id, acao, descricao, criado_em')
                .order('criado_em', { ascending: false })
                .limit(5);

            const activity = logs?.map(log => ({
                id: log.id,
                tipo: log.acao,
                descricao: log.descricao || log.acao,
                tempo: formatTimeAgo(new Date(log.criado_em))
            })) || [];

            setStats({
                totalConsultorias,
                consultoriasAtivas,
                consultoriasTrial,
                consultoriasSuspensas,
                totalEmpresas: totalEmpresas || 0,
                totalUsuarios: totalUsuarios || 0,
                faturamentoMes,
            });

            setRecentActivity(activity);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'agora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
        return `${Math.floor(seconds / 86400)}d atrás`;
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
    };

    const statCards = [
        {
            title: 'Consultorias Ativas',
            value: stats.consultoriasAtivas,
            subtitle: `${stats.totalConsultorias} total`,
            icon: Building,
            color: 'bg-blue-500',
            link: '/admin/consultorias'
        },
        {
            title: 'Empresas Clientes',
            value: stats.totalEmpresas,
            subtitle: 'cadastradas',
            icon: Users,
            color: 'bg-emerald-500',
            link: '/admin/consultorias'
        },
        {
            title: 'Faturamento Mensal',
            value: formatCurrency(stats.faturamentoMes),
            subtitle: 'MRR atual',
            icon: CreditCard,
            color: 'bg-violet-500',
            link: '/admin/financeiro'
        },
        {
            title: 'Em Trial',
            value: stats.consultoriasTrial,
            subtitle: stats.consultoriasSuspensas > 0 ? `${stats.consultoriasSuspensas} suspensas` : 'nenhuma suspensa',
            icon: stats.consultoriasSuspensas > 0 ? AlertTriangle : Activity,
            color: stats.consultoriasSuspensas > 0 ? 'bg-amber-500' : 'bg-cyan-500',
            link: '/admin/consultorias?status=trial'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
                <p className="text-gray-500 mt-1">Visão geral da plataforma MapeRH</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            to={card.link}
                            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                                    <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                                </div>
                                <div className={`${card.color} p-3 rounded-lg`}>
                                    <card.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
                    <div className="space-y-3">
                        <Link
                            to="/admin/usuarios"
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-700">Gerenciar Usuários Globais</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link
                            to="/admin/consultorias"
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Building className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-700">Ver Todas as Consultorias</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link
                            to="/admin/financeiro"
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-700">Painel Financeiro</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </Link>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Atividade Recente</h2>
                        <Link to="/admin/auditoria" className="text-sm text-primary-main hover:underline">
                            Ver tudo
                        </Link>
                    </div>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 truncate">{activity.descricao}</p>
                                        <p className="text-xs text-gray-400">{activity.tempo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">Nenhuma atividade recente</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
