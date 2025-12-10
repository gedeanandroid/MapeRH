// Payment Service - Abstract interface for payment gateways
// This allows swapping between different providers (Stripe, Asaas, PagSeguro, etc.)

export interface PaymentData {
    planoId: string;
    consultoriaId: string;
    valorCentavos: number;
    pagador: {
        nome: string;
        email: string;
        cpfCnpj: string;
    };
    formaPagamento: 'cartao' | 'boleto' | 'pix';
    cartao?: {
        numero: string;
        nome: string;
        validade: string;
        cvv: string;
    };
}

export interface PaymentResult {
    success: boolean;
    gatewayPaymentId?: string;
    gatewayCustomerId?: string;
    gatewaySubscriptionId?: string;
    status: 'aprovado' | 'pendente' | 'falhou';
    message?: string;
}

export interface RefundResult {
    success: boolean;
    refundedAmount?: number;
    message?: string;
}

// Mock Payment Gateway for development
export const mockPaymentGateway = {
    async createSubscription(data: PaymentData): Promise<PaymentResult> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate 90% success rate
        const success = Math.random() > 0.1;

        if (success) {
            return {
                success: true,
                gatewayPaymentId: `pay_${Date.now()}`,
                gatewayCustomerId: `cus_${Date.now()}`,
                gatewaySubscriptionId: `sub_${Date.now()}`,
                status: 'aprovado',
                message: 'Pagamento aprovado com sucesso',
            };
        } else {
            return {
                success: false,
                status: 'falhou',
                message: 'Cartão recusado. Verifique os dados e tente novamente.',
            };
        }
    },

    async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message?: string }> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            message: 'Assinatura cancelada com sucesso',
        };
    },

    async refundPayment(paymentId: string, amount: number): Promise<RefundResult> {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            success: true,
            refundedAmount: amount,
            message: 'Reembolso processado com sucesso',
        };
    },
};

// Export the active gateway (can be swapped for real implementation)
export const paymentGateway = mockPaymentGateway;
