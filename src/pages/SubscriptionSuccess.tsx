import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Calendar, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function SubscriptionSuccess() {
    const today = new Date();
    const refundDeadline = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextBilling = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-accent-green/10 rounded-full mb-6"
                >
                    <CheckCircle2 className="w-12 h-12 text-accent-green" />
                </motion.div>

                <h1 className="text-3xl font-bold text-neutral-gray900 mb-4">
                    Assinatura Ativada!
                </h1>
                <p className="text-neutral-gray600 mb-8">
                    Parabéns! Sua assinatura foi ativada com sucesso. Você já pode começar a usar todos os recursos da plataforma.
                </p>

                {/* Info Cards */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <Calendar className="w-6 h-6 text-primary-main" />
                        <div className="text-left">
                            <p className="text-sm text-neutral-gray600">Próxima cobrança</p>
                            <p className="font-semibold text-neutral-gray900">{formatDate(nextBilling)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-accent-green/5 rounded-xl border border-accent-green/20">
                        <Shield className="w-6 h-6 text-accent-green" />
                        <div className="text-left">
                            <p className="text-sm text-neutral-gray600">Garantia de reembolso até</p>
                            <p className="font-semibold text-accent-green">{formatDate(refundDeadline)}</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <Link to="/">
                    <Button
                        variant="primary"
                        className="w-full !py-4 text-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Ir para meu painel
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </Link>

                <div className="mt-6">
                    <Link
                        to="/assinatura"
                        className="text-sm text-primary-main hover:underline"
                    >
                        Gerenciar minha assinatura
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
