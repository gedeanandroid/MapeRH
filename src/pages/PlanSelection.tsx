import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { Check, Star, ArrowLeft, Loader2, Zap, Building2, Users } from 'lucide-react';
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

export default function PlanSelection() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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

    const formatPrice = (centavos: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(centavos / 100);
    };

    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId);
        navigate(`/checkout?plano=${planId}`);
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
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-neutral-gray600 hover:text-primary-main transition-colors text-sm font-medium mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block p-3 rounded-2xl bg-secondary-main/10 text-secondary-main mb-6">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-gray900 mb-4">
                        Escolha o plano ideal para sua consultoria
                    </h1>
                    <p className="text-xl text-neutral-gray600 max-w-2xl mx-auto">
                        Todos os planos incluem 14 dias grátis. Cancele em até 7 dias e receba 100% de reembolso.
                    </p>
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
                                <div className="absolute top-0 left-0 right-0 bg-secondary-main text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
                                    <Star className="w-4 h-4" />
                                    Mais Popular
                                </div>
                            )}

                            <div className={`p-8 ${plan.recomendado ? 'pt-14' : ''}`}>
                                {/* Plan Name */}
                                <h3 className="text-2xl font-bold text-neutral-gray900 mb-2">
                                    {plan.nome}
                                </h3>
                                <p className="text-neutral-gray600 mb-6">{plan.descricao}</p>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-neutral-gray900">
                                        {formatPrice(plan.preco_mensal_centavos)}
                                    </span>
                                    <span className="text-neutral-gray600">/mês</span>
                                </div>

                                {/* Limits */}
                                <div className="flex gap-4 mb-6 text-sm">
                                    <div className="flex items-center gap-2 text-neutral-gray700">
                                        <Building2 className="w-4 h-4 text-primary-main" />
                                        <span>
                                            {plan.limites.max_empresas === -1
                                                ? 'Ilimitadas'
                                                : `${plan.limites.max_empresas} empresas`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-neutral-gray700">
                                        <Users className="w-4 h-4 text-primary-main" />
                                        <span>
                                            {plan.limites.max_usuarios_cliente === -1
                                                ? 'Ilimitados'
                                                : `${plan.limites.max_usuarios_cliente} usuários`}
                                        </span>
                                    </div>
                                </div>

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
                                    className="w-full !py-4 text-lg"
                                    onClick={() => handleSelectPlan(plan.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Assinar {plan.nome}
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
                        💳 Você pode cancelar em até 7 dias e receber 100% de reembolso do primeiro pagamento.
                    </p>
                    <p className="mt-2">
                        Dúvidas? <a href="#" className="text-primary-main hover:underline">Fale conosco</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
