import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { Check, Star, ArrowLeft, Loader2, Zap, Building2, User } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Plan {
    id: string;
    nome: string;
    descricao: string;
    preco_mensal_centavos: number;
    limites: {
        max_empresas: number;
        max_usuarios_cliente: number;
    };
    recursos: string[];
    recomendado: boolean;
}

const ANNUAL_DISCOUNT = 0.15; // 15% discount

export default function PlanSelection() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data, error } = await supabase
                    .from('planos')
                    .select('*')
                    .eq('ativo', true)
                    .order('preco_mensal_centavos', { ascending: true });

                if (error) throw error;
                setPlans(data || []);
            } catch (error) {
                console.error('Error fetching plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const getPrice = (basePrice: number) => {
        if (billingCycle === 'anual') {
            return Math.round(basePrice * (1 - ANNUAL_DISCOUNT));
        }
        return basePrice;
    };

    const formatPrice = (centavos: number) => {
        const reais = centavos / 100;
        return reais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const handleSelectPlan = async (plan: Plan) => {
        if (!user || processing) return;

        setProcessing(true);

        try {
            // Get user's consultoria_id
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('consultoria_id')
                .eq('auth_user_id', user.id)
                .single();

            if (userError || !userData) throw new Error('Consultoria não encontrada');

            const consultoriaId = userData.consultoria_id;
            const isAnnual = billingCycle === 'anual';
            const monthlyPrice = getPrice(plan.preco_mensal_centavos);
            const totalPayment = isAnnual ? monthlyPrice * 12 : monthlyPrice;

            // Create subscription directly (no payment for now)
            const now = new Date();
            const reembolsavelAte = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
            const proximaCobranca = isAnnual
                ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // +1 year
                : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

            const { error: assinaturaError } = await supabase
                .from('assinaturas')
                .upsert({
                    consultoria_id: consultoriaId,
                    plano_id: plan.id,
                    status: 'ativa',
                    data_inicio: now.toISOString(),
                    data_proxima_cobranca: proximaCobranca.toISOString(),
                    reembolsavel_ate: reembolsavelAte.toISOString(),
                    valor_cobranca_centavos: totalPayment,
                    gateway: 'pendente',
                }, {
                    onConflict: 'consultoria_id',
                });

            if (assinaturaError) throw assinaturaError;

            // Redirect to dashboard
            navigate('/dashboard');

        } catch (error: any) {
            console.error('Error selecting plan:', error);
            alert('Erro ao selecionar plano. Tente novamente.');
        } finally {
            setProcessing(false);
        }
    };

    const getPlanIcon = (planName: string) => {
        switch (planName) {
            case 'Individual':
                return <User className="w-6 h-6" />;
            case 'Essencial':
                return <Zap className="w-6 h-6" />;
            case 'Estratégico':
                return <Building2 className="w-6 h-6" />;
            default:
                return <Zap className="w-6 h-6" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-8 w-8 text-primary-main" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-gray900 mb-4">
                        Escolha o plano ideal para sua consultoria
                    </h1>
                    <p className="text-xl text-neutral-gray600 max-w-2xl mx-auto mb-8">
                        Todos os planos incluem acesso completo. Cancele quando quiser.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-2 p-1.5 bg-white rounded-full shadow-md border border-gray-100">
                        <button
                            onClick={() => setBillingCycle('mensal')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'mensal'
                                    ? 'bg-primary-main text-white shadow-sm'
                                    : 'text-neutral-gray600 hover:text-neutral-gray900'
                                }`}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setBillingCycle('anual')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'anual'
                                    ? 'bg-primary-main text-white shadow-sm'
                                    : 'text-neutral-gray600 hover:text-neutral-gray900'
                                }`}
                        >
                            Anual
                        </button>
                        {billingCycle === 'anual' && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="ml-2 px-3 py-1.5 bg-accent-green/10 text-accent-green text-xs font-bold rounded-full"
                            >
                                -15% OFF
                            </motion.span>
                        )}
                    </div>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${plan.recomendado
                                    ? 'ring-2 ring-secondary-main scale-105 z-10'
                                    : 'hover:shadow-xl'
                                } transition-all duration-300`}
                        >
                            {/* Recommended Badge */}
                            {plan.recomendado && (
                                <div className="absolute top-0 left-0 right-0 bg-secondary-main text-white text-center py-2 text-sm font-semibold">
                                    Mais Popular
                                </div>
                            )}

                            <div className={`p-8 ${plan.recomendado ? 'pt-14' : ''}`}>
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${plan.recomendado ? 'bg-primary-main text-white' : 'bg-blue-50 text-primary-main'
                                    }`}>
                                    {getPlanIcon(plan.nome)}
                                </div>

                                {/* Plan Name */}
                                <h3 className="text-2xl font-bold text-neutral-gray900 mb-2">
                                    {plan.nome}
                                </h3>

                                {/* Price */}
                                <div className="mb-2">
                                    <span className="text-sm text-neutral-gray500">R$ </span>
                                    <span className="text-5xl font-bold text-neutral-gray900">
                                        {formatPrice(getPrice(plan.preco_mensal_centavos))}
                                    </span>
                                    <span className="text-neutral-gray600">/mês</span>
                                </div>

                                {billingCycle === 'anual' && (
                                    <p className="text-sm text-neutral-gray500 mb-4">
                                        <span className="line-through">R$ {formatPrice(plan.preco_mensal_centavos)}</span>
                                        <span className="text-accent-green ml-2 font-semibold">Economia de 15%</span>
                                    </p>
                                )}

                                <p className="text-neutral-gray600 text-sm mb-6">{plan.descricao}</p>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {plan.recursos.map((recurso, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                                            <span className="text-neutral-gray700 text-sm">{recurso}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Button
                                    variant={plan.recomendado ? 'primary' : 'secondary'}
                                    className="w-full !py-4 text-base font-semibold"
                                    onClick={() => handleSelectPlan(plan)}
                                    disabled={processing}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                            Ativando...
                                        </>
                                    ) : (
                                        'Começar agora'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12 text-sm text-neutral-gray500"
                >
                    <p>
                        📧 Dúvidas? <a href="#" className="text-primary-main hover:underline">Fale conosco</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
