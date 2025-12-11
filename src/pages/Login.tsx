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

            // Check if user has an active subscription
            if (authData.user) {
                const { data: userData } = await supabase
                    .from('usuarios')
                    .select('consultoria_id')
                    .eq('auth_user_id', authData.user.id)
                    .single();

                if (userData) {
                    const { data: assinatura } = await supabase
                        .from('assinaturas')
                        .select('status')
                        .eq('consultoria_id', userData.consultoria_id)
                        .eq('status', 'ativa')
                        .single();

                    if (assinatura) {
                        navigate('/dashboard');
                    } else {
                        navigate('/planos');
                    }
                } else {
                    navigate('/planos');
                }
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

                {/* Geometric Decor */}
                <div className="absolute top-10 right-10 grid grid-cols-3 gap-2 opacity-20">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-white rounded-sm"></div>
                    ))}
                </div>
                <div className="absolute bottom-10 left-10 opacity-20">
                    <div className="w-24 h-24 border-4 border-white rounded-full"></div>
                    <div className="w-12 h-12 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 w-full max-w-lg">

                    {/* Main Floating Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, rotate: -2 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="absolute top-0 right-0 transform translate-x-12 -translate-y-32 bg-white rounded-2xl p-6 shadow-2xl shadow-black/20 w-64 z-20"
                    >
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Crescimento</p>
                                <p className="text-lg font-bold text-gray-900">+127%</p>
                            </div>
                        </div>
                        <div className="h-24 flex items-end justify-between space-x-2">
                            {[40, 70, 45, 90, 65, 85].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                                    className="w-full bg-primary-light/20 rounded-t-sm relative"
                                >
                                    <div className="absolute bottom-0 w-full bg-accent-green rounded-t-sm" style={{ height: '100%' }}></div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Secondary Floating Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -40, rotate: 2 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="absolute bottom-32 left-0 transform -translate-x-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl w-72 z-10"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-blue-100 text-sm">Empresas Ativas</p>
                                <h4 className="text-3xl font-bold text-white mt-1">42</h4>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-primary-main bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 z-${10 - i}`}>
                                    {i === 3 ? '+8' : ''}
                                    {i !== 3 && <Users className="w-4 h-4 text-gray-400" />}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Central Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-32 text-center"
                    >
                        <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                            Transforme suas ideias<br />em realidade.
                        </h2>
                        <p className="text-blue-100 text-lg max-w-sm mx-auto leading-relaxed">
                            Gestão completa e experiência consistente em todas as plataformas e dispositivos.
                        </p>

                        <div className="flex justify-center mt-8 space-x-2">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            <div className="w-2 h-2 rounded-full bg-white/40"></div>
                            <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Login;
