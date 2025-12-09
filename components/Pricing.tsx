import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, User, Zap, Rocket, Crown, Sparkles, Phone, Wrench } from 'lucide-react';
import Button from './ui/Button';

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Individual",
      price: 97,
      description: "Ideal para consultores independentes começando",
      icon: User,
      features: [
        "Até 3 empresas ativas",
        "1 usuário",
        "Todos os módulos inclusos",
        "Suporte por chat",
        "Relatórios com logo personalizado"
      ],
      highlight: false,
      buttonVariant: "secondary" as const
    },
    {
      name: "Essencial",
      price: 247,
      description: "Perfeito para consultores estabelecidos",
      icon: Zap,
      features: [
        "Até 15 empresas ativas",
        "Até 3 usuários",
        "Todos os módulos inclusos",
        "Suporte prioritário",
        "Relatórios avançados",
        "Integrações via API"
      ],
      highlight: true,
      buttonVariant: "primary" as const
    },
    {
      name: "Estratégico",
      price: 497,
      description: "Para consultorias em crescimento acelerado",
      icon: Rocket,
      features: [
        "Até 50 empresas ativas",
        "Até 10 usuários",
        "Todos os módulos inclusos",
        "Suporte dedicado",
        "Treinamento personalizado",
        "Consultoria estratégica",
        "White-label disponível"
      ],
      highlight: false,
      buttonVariant: "secondary" as const
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-neutral-gray50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-accent-green/10 text-accent-green px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          >
            <span>💰</span>
            <span>Investimento que se Paga</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-neutral-gray900 mb-6"
          >
            Planos que se <span className="text-primary-main">adaptam</span> ao seu negócio
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-neutral-gray600 max-w-2xl mx-auto mb-10"
          >
            Todos os planos incluem <strong>acesso completo a todos os módulos</strong>. A diferenciação é feita pelo número de empresas ativas e usuários.
          </motion.p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex relative shadow-sm">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative z-10 ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Mensal
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative z-10 ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Anual
              </button>
              
              {/* Sliding Background */}
              <motion.div 
                className="absolute top-1 bottom-1 bg-primary-main rounded-md shadow-sm"
                initial={false}
                animate={{ 
                  left: billingCycle === 'monthly' ? '4px' : '50%', 
                  width: billingCycle === 'monthly' ? 'calc(50% - 6px)' : 'calc(50% - 6px)',
                  x: billingCycle === 'monthly' ? 0 : 2
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
            {billingCycle === 'yearly' && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold text-accent-green bg-accent-green/10 px-2 py-1 rounded-md"
              >
                -15% OFF
              </motion.span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl p-8 border ${plan.highlight ? 'border-primary-main shadow-xl scale-105 z-10' : 'border-gray-100 shadow-lg hover:shadow-xl transition-shadow'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-main text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  Mais Popular
                </div>
              )}

              <div className="flex flex-col items-center text-center mb-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.highlight ? 'bg-primary-main text-white' : 'bg-primary-main/10 text-primary-main'}`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center text-gray-900 mb-2">
                  <span className="text-sm text-gray-500 mr-1">R$</span>
                  <span className="text-4xl font-extrabold tracking-tight">
                    {billingCycle === 'yearly' ? Math.floor(plan.price * 0.85) : plan.price}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/mês</span>
                </div>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-accent-green mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600 text-left">{feature}</span>
                  </div>
                ))}
              </div>

              <Button variant={plan.buttonVariant} className="w-full">
                Começar Teste Grátis
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary-main to-primary-dark rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-main/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10 flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-secondary-main rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-secondary-main/20 text-neutral-gray900">
              <Crown className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold mb-2">Plano Enterprise</h3>
            <p className="text-xl font-medium text-blue-100 mb-4">+50 Empresas Ativas • Usuários Ilimitados</p>
            <p className="text-blue-100/80 max-w-2xl">
              Negociação personalizada conforme a necessidade da sua consultoria. Inclui todos os benefícios dos planos anteriores mais recursos exclusivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center mb-3 text-secondary-main font-semibold">
                <Sparkles className="w-5 h-5 mr-2" />
                Recursos Exclusivos
              </div>
              <p className="text-sm text-blue-100/80">Funcionalidades premium desenvolvidas sob demanda para sua operação.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center mb-3 text-secondary-main font-semibold">
                <Phone className="w-5 h-5 mr-2" />
                Consultoria Dedicada
              </div>
              <p className="text-sm text-blue-100/80">Especialista exclusivo para acompanhar o sucesso da sua conta.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center mb-3 text-secondary-main font-semibold">
                <Wrench className="w-5 h-5 mr-2" />
                Customizações
              </div>
              <p className="text-sm text-blue-100/80">Adaptação do sistema para processos específicos da sua metodologia.</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="secondary" className="border-none hover:bg-white text-primary-main">
              Falar com Especialista
              <span className="ml-2">→</span>
            </Button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Pricing;
