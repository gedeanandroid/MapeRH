import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { paymentGateway, PaymentData } from '../services/paymentService';
import { ArrowLeft, Loader2, CreditCard, Shield, Lock, Check } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Plan {
    id: string;
    nome: string;
    descricao: string;
    preco_mensal_centavos: number;
}

export default function Checkout() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('plano');

    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        nome: '',
        email: user?.email || '',
        cpfCnpj: '',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: '',
    });

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId) {
                navigate('/planos');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('planos')
                    .select('*')
                    .eq('id', planId)
                    .single();

                if (error) throw error;
                setPlan(data);
            } catch (err) {
                console.error('Error fetching plan:', err);
                navigate('/planos');
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [planId, navigate]);

    const formatPrice = (centavos: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(centavos / 100);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan || !user) return;

        setProcessing(true);
        setError(null);

        try {
            // Get user's consultoria_id
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('consultoria_id')
                .eq('auth_user_id', user.id)
                .single();

            if (userError || !userData) throw new Error('Consultoria não encontrada');

            const consultoriaId = userData.consultoria_id;

            // Call payment gateway
            const paymentData: PaymentData = {
                planoId: plan.id,
                consultoriaId,
                valorCentavos: plan.preco_mensal_centavos,
                pagador: {
                    nome: formData.nome,
                    email: formData.email,
                    cpfCnpj: formData.cpfCnpj,
                },
                formaPagamento: 'cartao',
                cartao: {
                    numero: formData.cardNumber,
                    nome: formData.cardName,
                    validade: formData.cardExpiry,
                    cvv: formData.cardCvv,
                },
            };

            const result = await paymentGateway.createSubscription(paymentData);

            if (!result.success) {
                throw new Error(result.message || 'Erro ao processar pagamento');
            }

            // Create subscription in database
            const now = new Date();
            const reembolsavelAte = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
            const proximaCobranca = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

            const { data: assinatura, error: assinaturaError } = await supabase
                .from('assinaturas')
                .upsert({
                    consultoria_id: consultoriaId,
                    plano_id: plan.id,
                    status: 'ativa',
                    data_inicio: now.toISOString(),
                    data_proxima_cobranca: proximaCobranca.toISOString(),
                    reembolsavel_ate: reembolsavelAte.toISOString(),
                    valor_cobranca_centavos: plan.preco_mensal_centavos,
                    gateway: 'mock',
                    gateway_customer_id: result.gatewayCustomerId,
                    gateway_subscription_id: result.gatewaySubscriptionId,
                }, {
                    onConflict: 'consultoria_id',
                })
                .select()
                .single();

            if (assinaturaError) throw assinaturaError;

            // Create payment record
            const { error: pagamentoError } = await supabase
                .from('pagamentos')
                .insert({
                    assinatura_id: assinatura.id,
                    consultoria_id: consultoriaId,
                    status: 'aprovado',
                    valor_centavos: plan.preco_mensal_centavos,
                    tipo: 'primeiro_pagamento',
                    data_pagamento: now.toISOString(),
                    gateway: 'mock',
                    gateway_payment_id: result.gatewayPaymentId,
                });

            if (pagamentoError) throw pagamentoError;

            // Redirect to success page
            navigate('/assinatura/sucesso');

        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-8 w-8 text-primary-main" />
            </div>
        );
    }

    if (!plan) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    to="/planos"
                    className="inline-flex items-center text-neutral-gray600 hover:text-primary-main transition-colors text-sm font-medium mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para planos
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h1 className="text-2xl font-bold text-neutral-gray900 mb-6 flex items-center gap-3">
                                <CreditCard className="text-primary-main" />
                                Dados do Pagamento
                            </h1>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                                        {error}
                                    </div>
                                )}

                                {/* Billing Info */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-neutral-gray800">Dados do Pagador</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                                Nome Completo
                                            </label>
                                            <input
                                                type="text"
                                                name="nome"
                                                value={formData.nome}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                                CPF/CNPJ
                                            </label>
                                            <input
                                                type="text"
                                                name="cpfCnpj"
                                                value={formData.cpfCnpj}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10"
                                        />
                                    </div>
                                </div>

                                {/* Card Info */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold text-neutral-gray800 flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Dados do Cartão
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                            Número do Cartão
                                        </label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleInputChange}
                                            placeholder="0000 0000 0000 0000"
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                            Nome no Cartão
                                        </label>
                                        <input
                                            type="text"
                                            name="cardName"
                                            value={formData.cardName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                                Validade
                                            </label>
                                            <input
                                                type="text"
                                                name="cardExpiry"
                                                value={formData.cardExpiry}
                                                onChange={handleInputChange}
                                                placeholder="MM/AA"
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                name="cardCvv"
                                                value={formData.cardCvv}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-4 focus:ring-primary-main/10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Legal */}
                                <p className="text-xs text-neutral-gray500">
                                    Ao confirmar o pagamento, você concorda com nossos{' '}
                                    <a href="#" className="text-primary-main hover:underline">Termos de Uso</a> e{' '}
                                    <a href="#" className="text-primary-main hover:underline">Política de Cobrança</a>.
                                    Você poderá cancelar em até 7 dias e receber reembolso de 100%.
                                </p>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={processing}
                                    className="w-full !py-4 text-lg"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>Confirmar Pagamento de {formatPrice(plan.preco_mensal_centavos)}</>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-neutral-gray900 mb-4">Resumo</h2>

                            <div className="space-y-4">
                                <div className="pb-4 border-b">
                                    <p className="font-semibold text-neutral-gray900">{plan.nome}</p>
                                    <p className="text-sm text-neutral-gray600">{plan.descricao}</p>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-neutral-gray600">Plano mensal</span>
                                    <span className="font-semibold">{formatPrice(plan.preco_mensal_centavos)}</span>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary-main">{formatPrice(plan.preco_mensal_centavos)}</span>
                                    </div>
                                    <p className="text-xs text-neutral-gray500 mt-1">Cobrado mensalmente</p>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-accent-green/10 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-sm text-neutral-gray900">Garantia de 7 dias</p>
                                        <p className="text-xs text-neutral-gray600">
                                            Cancele em até 7 dias e receba 100% de reembolso
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
