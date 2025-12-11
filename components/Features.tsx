import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, Target, Briefcase, Network, UserCog,
  BarChart3, Shield, Brain, FileText, Layers, Settings
} from 'lucide-react';
import { FeatureCardProps } from '../types';

const FeatureCard: React.FC<FeatureCardProps & { index: number }> = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.05 }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-gray100 h-full flex flex-col items-start hover:shadow-xl transition-all group"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-main to-primary-light flex items-center justify-center mb-5 text-white shadow-lg shadow-primary-main/20 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6" strokeWidth={2} />
    </div>
    <h3 className="text-lg font-bold text-neutral-gray900 mb-2">{title}</h3>
    <p className="text-sm text-neutral-gray600 leading-relaxed">{description}</p>
  </motion.div>
);

const Features: React.FC = () => {
  const features = [
    {
      icon: Building2,
      title: "Identidade Empresarial",
      description: "Missão, visão, valores, propósito e EVP. Histórico de versões para evolução da cultura."
    },
    {
      icon: Network,
      title: "Estrutura Organizacional",
      description: "Unidades, filiais, departamentos com hierarquia. Organograma visual da empresa."
    },
    {
      icon: Briefcase,
      title: "Descrição de Cargos",
      description: "Cargos completos com responsabilidades, atividades, requisitos e níveis hierárquicos."
    },
    {
      icon: Target,
      title: "Competências & CHA",
      description: "Biblioteca de competências técnicas, comportamentais e organizacionais com matriz CHA."
    },
    {
      icon: UserCog,
      title: "Gestão de Colaboradores",
      description: "Cadastro completo vinculando colaborador a cargo, departamento e gestor imediato."
    },
    {
      icon: Layers,
      title: "Níveis de Proficiência",
      description: "Defina níveis 1 a 5 com descritores comportamentais para cada competência."
    },
    {
      icon: BarChart3,
      title: "Matriz CHA por Cargo",
      description: "Vincule competências a cargos com nível desejado. Visualize a matriz completa."
    },
    {
      icon: Users,
      title: "Multi-tenant por Design",
      description: "Cada consultoria gerencia várias empresas com isolamento total de dados."
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "RLS por consultoria, autenticação Supabase e criptografia de dados sensíveis."
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-neutral-gray50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary-main font-semibold tracking-wider uppercase text-sm mb-4 bg-primary-main/10 px-4 py-1.5 rounded-full">
            <Layers className="w-4 h-4" />
            Plataforma Completa
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-gray900 mb-4">
            Tudo que sua consultoria <span className="text-primary-main">precisa</span>
          </h2>
          <p className="text-lg text-neutral-gray600 max-w-2xl mx-auto">
            Módulos integrados para gestão completa de RH das empresas clientes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;