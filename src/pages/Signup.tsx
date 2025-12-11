import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, User, Check, Sparkles, Users, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';

const signupSchema = z.object({
    fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
});

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormInputs>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormInputs) => {
        setIsLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                    },
                },
            });

            if (error) {
                throw error;
            }

            setSuccessMsg('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.');
        } catch (error: any) {
            setErrorMsg(error.message || 'Ocorreu um erro ao criar a conta.');
        } finally {
            setIsLoading(false);
        }
    };

    if (successMsg) {
        return (
            <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
                {/* Left Side - Success Message */}
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
                        className="max-w-md w-full mx-auto text-center"
                    >
                        <div className="inline-block p-4 rounded-full bg-accent-green/10 text-accent-green mb-6">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-neutral-gray900 mb-4">
                            Conta Criada!
                        </h1>
                        <p className="text-neutral-gray600 mb-8">
                            {successMsg}
                        </p>
                        <Link to="/login">
                            <Button
                                variant="primary"
                                className="!py-4 px-8 text-lg shadow-lg shadow-secondary-main/20"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Ir para Login
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Right Side - Visuals */}
                <div className="hidden lg:flex w-1/2 bg-secondary-main relative items-center justify-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary-light rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-dark rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative z-10 text-center"
                    >
                        <Sparkles className="w-24 h-24 text-white mx-auto mb-6" />
                        <h2 className="text-4xl font-bold text-white mb-4">Bem-vindo!</h2>
                        <p className="text-white/80 text-lg max-w-sm mx-auto">
                            Sua jornada para transformar a gestão de RH começa agora.
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

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
                        <div className="inline-block p-3 rounded-2xl bg-secondary-main/10 text-secondary-main mb-6">
                            <span className="text-2xl font-extrabold tracking-tight">
                                🚀
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-neutral-gray900 mb-3">
                            Crie sua conta de consultor
                        </h1>
                        <p className="text-neutral-gray600">
                            Preencha os dados abaixo para transformar a gestão de RH dos seus clientes.
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        {errorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl relative" role="alert">
                                <span className="block sm:inline">{errorMsg}</span>
                            </div>
                        )}

                        {/* Nome Completo */}
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-gray800">
                                Nome Completo
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-main transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Seu nome"
                                    {...register('fullName')}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-neutral-gray900 placeholder-gray-400 focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10 transition-all bg-neutral-gray50 focus:bg-white"
                                />
                            </div>
                            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
                        </div>

                        {/* Email */}
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
                                    placeholder="seu@email.com"
                                    {...register('email')}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-neutral-gray900 placeholder-gray-400 focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10 transition-all bg-neutral-gray50 focus:bg-white"
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        {/* Senha */}
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
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 8 caracteres"
                                    {...register('password')}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-neutral-gray900 placeholder-gray-400 focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10 transition-all bg-neutral-gray50 focus:bg-white"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-main transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                        </div>

                        {/* Confirmar Senha */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-gray800">
                                Confirmar Senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-main transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Repita sua senha"
                                    {...register('confirmPassword')}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-neutral-gray900 placeholder-gray-400 focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10 transition-all bg-neutral-gray50 focus:bg-white"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Termos */}
                        <div className="flex items-start pt-2">
                            <label className="flex items-start space-x-2 cursor-pointer group">
                                <div className="relative flex items-center mt-0.5">
                                    <input type="checkbox" className="peer sr-only" {...register('terms')} />
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-primary-main peer-checked:border-primary-main transition-all"></div>
                                    <Check className="w-3 h-3 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-sm text-neutral-gray600 group-hover:text-neutral-gray800 leading-tight">
                                    Li e aceito os <a href="#" className="text-primary-main hover:underline">Termos de Uso</a> e <a href="#" className="text-primary-main hover:underline">Política de Privacidade</a>
                                </span>
                            </label>
                        </div>
                        {errors.terms && <p className="text-sm text-red-600">{errors.terms.message}</p>}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                className="w-full !py-4 text-lg shadow-lg shadow-secondary-main/20 hover:shadow-xl hover:shadow-secondary-main/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Criar conta gratuita'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-neutral-gray600">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="font-semibold text-primary-main hover:text-primary-dark transition-colors hover:underline">
                                Faça login
                            </Link>
                        </p>
                    </div>

                    <div className="mt-12 text-xs text-center text-gray-400">
                        © {new Date().getFullYear()} MapeRH. Todos os direitos reservados.
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Visuals */}
            <div className="hidden lg:flex w-1/2 bg-secondary-main relative items-center justify-center overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary-light rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-dark rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-primary-main rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

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
                <div className="relative z-10 w-full max-w-md px-8 flex flex-col items-center">
                    {/* Central Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                            Comece sua<br />jornada agora.
                        </h2>
                        <p className="text-yellow-100 text-lg max-w-sm mx-auto leading-relaxed">
                            Junte-se a centenas de consultores que já transformam a gestão de RH.
                        </p>
                    </motion.div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {/* Trial Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-yellow-100 text-sm">O que você ganha</p>
                                    <h4 className="text-xl font-bold text-white mt-1">7 dias grátis</h4>
                                </div>
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <ul className="space-y-2 text-white/80 text-sm">
                                <li className="flex items-center space-x-2">
                                    <Check className="w-4 h-4 text-accent-green" />
                                    <span>Sem cartão de crédito</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Check className="w-4 h-4 text-accent-green" />
                                    <span>Acesso completo</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Check className="w-4 h-4 text-accent-green" />
                                    <span>Suporte dedicado</span>
                                </li>
                            </ul>
                        </motion.div>

                        {/* Consultants Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-white rounded-2xl p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary-main/10 flex items-center justify-center text-secondary-main">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Consultores</p>
                                        <p className="text-lg font-bold text-gray-900">+500</p>
                                    </div>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-primary-light to-primary-main flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                        +496
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Carousel Dots */}
                    <div className="flex justify-center mt-8 space-x-2">
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        <div className="w-2 h-2 rounded-full bg-white/40"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
