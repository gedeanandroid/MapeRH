import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Check, ArrowLeft, Building2, Users, TrendingUp, User, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { supabase } from '../lib/supabaseClient';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            if (authData.user) {
                // First check if user is a consultor
                const { data: consultorData } = await supabase
                    .from('usuarios')
                    .select('consultoria_id, role_plataforma')
                    .eq('auth_user_id', authData.user.id)
                    .single();

                if (consultorData) {
                    // User is consultor or superadmin
                    if (consultorData.role_plataforma === 'superadmin') {
                        // Future: redirect to admin console
                        navigate('/dashboard');
                        return;
                    }

                    // Check for active subscription
                    const { data: assinatura } = await supabase
                        .from('assinaturas')
                        .select('status')
                        .eq('consultoria_id', consultorData.consultoria_id)
                        .eq('status', 'ativa')
                        .single();

                    if (assinatura) {
                        navigate('/dashboard');
                    } else {
                        navigate('/planos');
                    }
                    return;
                }

                // Check if user is admin_empresa
                const { data: empresaUserData } = await supabase
                    .from('usuarios_empresa')
                    .select('empresa_cliente_id, ativo, primeiro_login')
                    .eq('auth_user_id', authData.user.id)
                    .single();

                if (empresaUserData) {
                    if (!empresaUserData.ativo) {
                        throw new Error('Sua conta está desativada. Entre em contato com seu consultor.');
                    }

                    // Admin RH goes directly to their workspace
                    navigate(`/workspace/${empresaUserData.empresa_cliente_id}`);
                    return;
                }

                // No user profile found - new consultant going through signup
                navigate('/planos');
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Erro ao realizar login');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-10">
                <Link
                    to="/"
                    className="absolute top-8 left-8 flex items-center text-neutral-gray600 hover:text-primary-main transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full mx-auto"
                >
                    <div className="mb-8">
                        <div className="inline-block p-3 rounded-2xl bg-primary-main/10 text-primary-main mb-6">
                            <span className="text-2xl font-extrabold tracking-tight">
                                ⚡
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-neutral-gray900 mb-3">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-neutral-gray600">
                            Acesse sua conta para gerenciar suas consultorias e clientes.
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={onLogin}>
                        {errorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{errorMsg}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-gray800">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-main transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-neutral-gray900 placeholder-gray-400 focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10 transition-all bg-neutral-gray50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-gray800">
                                Senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-main transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-neutral-gray900 placeholder-gray-400 focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10 transition-all bg-neutral-gray50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-start justify-between pt-2">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-primary-main peer-checked:border-primary-main transition-all"></div>
                                    <Check className="w-3 h-3 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-sm text-neutral-gray600 group-hover:text-neutral-gray800">Lembrar de mim</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-primary-main hover:text-primary-dark hover:underline">
                                Esqueceu a senha?
                            </a>
                        </div>

                        <div className="pt-2">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                                className="w-full !py-4 text-lg shadow-lg shadow-secondary-main/20 hover:shadow-xl hover:shadow-secondary-main/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-gray600">
                            Não tem uma conta?{' '}
                            <Link to="/signup" className="font-semibold text-primary-main hover:text-primary-dark transition-colors hover:underline">
                                Cadastre-se gratuitamente
                            </Link>
                        </p>
                    </div>

                    <div className="mt-12 text-xs text-center text-gray-400">
                        © {new Date().getFullYear()} MapeRH. Todos os direitos reservados.
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Visuals */}
            <div className="hidden lg:flex w-1/2 bg-primary-main relative items-center justify-center overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-light rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-dark rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-secondary-main rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

                {/* Content Container */}
                <div className="relative z-10 w-full max-w-md px-8 flex flex-col items-center">
                    {/* Central Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Gerencie suas<br />consultorias
                        </h2>
                        <p className="text-blue-100 text-lg max-w-sm mx-auto leading-relaxed">
                            Gestão completa de RH para todas as suas empresas clientes.
                        </p>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-xs">Empresas</p>
                                    <p className="text-2xl font-bold text-white">42</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-xs">Colaboradores</p>
                                    <p className="text-2xl font-bold text-white">1.2k</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="bg-white rounded-2xl p-5 col-span-2"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-gray-600 text-sm font-medium">Crescimento mensal</p>
                                <span className="text-accent-green text-sm font-bold">+127%</span>
                            </div>
                            <div className="flex items-end justify-between space-x-2 h-16">
                                {[40, 70, 45, 90, 65, 85, 75].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 0.8, delay: 0.8 + (i * 0.1) }}
                                        className="flex-1 bg-accent-green rounded-t"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Carousel Dots */}
                    <div className="flex justify-center mt-8 space-x-2">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
