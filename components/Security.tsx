import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Lock, Cloud, Server } from 'lucide-react';
import { SecurityItemProps } from '../types';

const SecurityCard: React.FC<SecurityItemProps & { icon: React.ElementType, delay: number }> = ({ text, icon: Icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 border border-gray-100"
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-accent-green" />
    </div>
    <span className="text-lg font-medium text-neutral-gray800">{text}</span>
  </motion.div>
);

const Security: React.FC = () => {
  return (
    <section id="security" className="py-24 relative overflow-hidden">
      {/* Textured Gradient Background */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          background: `
            radial-gradient(at 0% 0%, rgba(235, 232, 216, 1) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(210, 210, 200, 0.5) 0px, transparent 50%),
            #EBE8D8
          `
        }}
      >
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'6\\' height=\\'6\\' viewBox=\\'0 0 6 6\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%239C92AC\\' fill-opacity=\\'0.1\\' fill-rule=\\'evenodd\\'%3E%3Cpath d=\\'M5 0h1L0 6V5zM6 5v1H5z\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
           <div className="inline-block p-3 rounded-2xl bg-primary-main/10 text-primary-main mb-6">
             <ShieldCheck className="w-8 h-8" />
           </div>
           <h2 className="text-3xl md:text-5xl font-bold text-neutral-gray900 mb-6 leading-tight">
             Dados dos seus clientes protegidos com <span className="text-primary-main">máxima segurança</span>
           </h2>
           <p className="text-lg text-neutral-gray600">
             Entendemos que a confiança é o ativo mais valioso de uma consultoria. Por isso, implementamos protocolos de nível bancário para garantir que nenhuma informação sensível seja comprometida.
           </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          <SecurityCard text="Conformidade total com LGPD" icon={ShieldCheck} delay={0.1} />
          <SecurityCard text="Backup automático em nuvem" icon={Cloud} delay={0.2} />
          <SecurityCard text="Dados hospedados no Brasil" icon={Server} delay={0.3} />
          <SecurityCard text="Criptografia de ponta a ponta" icon={Lock} delay={0.4} />
        </div>

      </div>
    </section>
  );
};

export default Security;