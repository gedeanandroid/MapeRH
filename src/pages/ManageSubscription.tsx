import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { paymentGateway } from '../services/paymentService';
import {
    ArrowLeft, Loader2, CreditCard, Calendar, Shield, AlertTriangle,
    Check, X, Building2, Users, Zap
} from 'lucide-react';
import Button from '../../components/ui/Button';

interface Subscription {
    id: string;
    status: string;
    data_inicio: string;
    data_proxima_cobranca: string;
    reembolsavel_ate: string;
    valor_cobranca_centavos: number;
    plano: {
        id: string;
        nome: string;
        descricao: string;
        preco_mensal_centavos: number;
        limites: {
            max_empresas: number;
            max_usuarios_cliente: number;
        };
        recursos: string[];
    };
}

export default function ManageSubscription() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelType, setCancelType] = useState<'refund' | 'normal'>('normal');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSubscription();
    }, [user]);

    const fetchSubscription = async () => {
        if (!user) return;

        try {
            const { data: userData } = await supabase
                .from('usuarios')
                .select('consultoria_id')
                .eq('auth_user_id', user.id)
                .single();

            if (!userData) throw new Error('User not found');

            const { data, error } = await supabase
                .from('assinaturas')
                .select(`
          *,
          plano:planos(*)
        `)
                .eq('consultoria_id', userData.consultoria_id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setSubscription(data);
        } catch (err) {
            console.error('Error fetching subscription:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (centavos: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(centavos / 100);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const isRefundEligible = () => {
        if (!subscription?.reembolsavel_ate) return false;
        return new Date() <= new Date(subscription.reembolsavel_ate);
    };

    const handleCancelClick = (type: 'refund' | 'normal') => {
        setCancelType(type);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        if (!subscription) return;

        setCancelling(true);
        setMessage(null);

        try {
            // Call gateway to cancel subscription
            await paymentGateway.cancelSubscription(subscription.id);

            // If refund, process refund
            if (cancelType === 'refund' && isRefundEligible()) {
                // Get the first payment
                const { data: pagamento } = await supabase
                    .from('pagamentos')
                    .select('*')
                    .eq('assinatura_id', subscription.id)
                    .eq('tipo', 'primeiro_pagamento')
                    .single();

                if (pagamento) {
                    await paymentGateway.refundPayment(pagamento.gateway_payment_id, pagamento.valor_centavos);

                    // Update payment record
                    await supabase
                        .from('pagamentos')
                        .update({
                            status: 'reembolsado',
                            reembolsado_centavos: pagamento.valor_centavos,
                            data_reembolso: new Date().toISOString(),
                        })
                        .eq('id', pagamento.id);
                }
            }

            // Update subscription status
            await supabase
                .from('assinaturas')
                .update({
                    status: 'cancelada',
                    atualizado_em: new Date().toISOString(),
                })
                .eq('id', subscription.id);

            setMessage({
                type: 'success',
                text: cancelType === 'refund'
                    ? 'Assinatura cancelada e reembolso solicitado com sucesso!'
                    : 'Assinatura cancelada com sucesso.',
            });

            // Refresh subscription data
            await fetchSubscription();
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Erro ao cancelar assinatura.',
            });
        } finally {
            setCancelling(false);
            setShowCancelModal(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-8 w-8 text-primary-main" />
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <Zap className="w-16 h-16 text-neutral-gray400 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-neutral-gray900 mb-4">
                        Você ainda não tem uma assinatura
                    </h1>
                    <p className="text-neutral-gray600 mb-8">
                        Escolha um plano para começar a usar todos os recursos da plataforma.
                    </p>
                    <Link to="/planos">
                        <Button variant="primary" className="!py-4 px-8">
                            Ver planos disponíveis
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        ativa: 'bg-accent-green/10 text-accent-green',
        pendente_pagamento: 'bg-yellow-100 text-yellow-700',
        cancelada: 'bg-red-100 text-red-700',
        expirada: 'bg-gray-100 text-gray-700',
    };

    const statusLabels: Record<string, string> = {
        ativa: 'Ativa',
        pendente_pagamento: 'Pendente',
        cancelada: 'Cancelada',
        expirada: 'Expirada',
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center text-neutral-gray600 hover:text-primary-main transition-colors text-sm font-medium mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o painel
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-neutral-gray900 mb-8 flex items-center gap-3">
                        <CreditCard className="text-primary-main" />
                        Gerenciar Assinatura
                    </h1>

                    {message && (
                        <div className={`mb-6 px-4 py-3 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Current Plan */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-gray900">
                                            {subscription.plano.nome}
                                        </h2>
                                        <p className="text-neutral-gray600">{subscription.plano.descricao}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[subscription.status]}`}>
                                        {statusLabels[subscription.status]}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-primary-main" />
                                        <div>
                                            <p className="text-sm text-neutral-gray600">Empresas</p>
                                            <p className="font-semibold">
                                                {subscription.plano.limites.max_empresas === -1
                                                    ? 'Ilimitadas'
                                                    : `Até ${subscription.plano.limites.max_empresas}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-primary-main" />
                                        <div>
                                            <p className="text-sm text-neutral-gray600">Usuários/empresa</p>
                                            <p className="font-semibold">
                                                {subscription.plano.limites.max_usuarios_cliente === -1
                                                    ? 'Ilimitados'
                                                    : `Até ${subscription.plano.limites.max_usuarios_cliente}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <ul className="space-y-2">
                                    {subscription.plano.recursos.map((recurso, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-neutral-gray700">
                                            <Check className="w-4 h-4 text-accent-green" />
                                            {recurso}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Billing Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="font-bold text-neutral-gray900 mb-4">Informações de Cobrança</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-gray600">Valor mensal</span>
                                        <span className="font-semibold">{formatPrice(subscription.valor_cobranca_centavos)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-gray600">Data de início</span>
                                        <span className="font-semibold">{formatDate(subscription.data_inicio)}</span>
                                    </div>
                                    {subscription.status === 'ativa' && subscription.data_proxima_cobranca && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-gray600">Próxima cobrança</span>
                                            <span className="font-semibold">{formatDate(subscription.data_proxima_cobranca)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Side Panel */}
                        <div className="space-y-6">
                            {/* Refund Eligibility */}
                            {subscription.status === 'ativa' && isRefundEligible() && (
                                <div className="bg-accent-green/5 border border-accent-green/20 rounded-2xl p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Shield className="w-6 h-6 text-accent-green flex-shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-neutral-gray900">Garantia Ativa</h3>
                                            <p className="text-sm text-neutral-gray600">
                                                Você pode cancelar até <strong>{formatDate(subscription.reembolsavel_ate)}</strong> e receber 100% de reembolso.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        className="w-full !border-accent-green !text-accent-green"
                                        onClick={() => handleCancelClick('refund')}
                                    >
                                        Cancelar com reembolso total
                                    </Button>
                                </div>
                            )}

                            {/* Cancel */}
                            {subscription.status === 'ativa' && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="font-bold text-neutral-gray900 mb-4">Cancelar Assinatura</h3>
                                    <p className="text-sm text-neutral-gray600 mb-4">
                                        {isRefundEligible()
                                            ? 'Você também pode cancelar sem solicitar reembolso.'
                                            : 'Ao cancelar, você manterá o acesso até o final do período pago.'}
                                    </p>
                                    <Button
                                        variant="secondary"
                                        className="w-full !border-red-300 !text-red-600"
                                        onClick={() => handleCancelClick('normal')}
                                    >
                                        Cancelar assinatura
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-xl font-bold text-neutral-gray900">Confirmar Cancelamento</h3>
                        </div>
                        <p className="text-neutral-gray600 mb-6">
                            {cancelType === 'refund'
                                ? 'Ao confirmar, sua assinatura será cancelada e o valor do primeiro pagamento será reembolsado. Seu acesso será suspenso imediatamente.'
                                : 'Ao confirmar, sua assinatura será cancelada. Você manterá o acesso até o final do período já pago.'}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                            >
                                Voltar
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 !bg-red-600 hover:!bg-red-700"
                                onClick={handleConfirmCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? <Loader2 className="animate-spin" /> : 'Confirmar'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
