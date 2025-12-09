import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Target } from 'lucide-react';
import { FeatureCardProps } from '../types';

const FeatureCard: React.FC<FeatureCardProps & { index: number }> = ({ icon: Icon, title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -10, transition: { duration: 0.2 } }}
    className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-gray100 h-full flex flex-col items-start hover:shadow-xl transition-shadow"
  >
    <div className="w-14 h-14 rounded-full bg-primary-main/10 flex items-center justify-center mb-6 text-primary-main">
      <Icon className="w-7 h-7" strokeWidth={2} />
    </div>
    <h3 className="text-2xl font-bold text-neutral-gray900 mb-3">{title}</h3>
    <p className="text-neutral-gray600 leading-relaxed">{description}</p>
  </motion.div>
);

const Features: React.FC = () => {
  const features = [
    {
      icon: Building2,
      title: "Cultura Organizacional Completa",
      description: "Defina e gerencie missão, visão e valores de todas as empresas clientes em um único sistema."
    },
    {
      icon: Users,
      title: "Estrutura de Cargos e Salários",
      description: "Crie e mantenha planos de cargos e salários alinhados com o mercado e a realidade de cada cliente."
    },
    {
      icon: Target,
      title: "Gestão de Competências",
      description: "Mapeie e desenvolva todas as competências organizacionais necessárias para o sucesso das empresas."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-main font-semibold tracking-wider uppercase text-sm mb-2 block">Diferenciais Exclusivos</span>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-gray900">Por que MapeRH?</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;