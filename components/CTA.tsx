
import React from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface CTAProps {
  onSignupClick?: () => void;
}

const CTA: React.FC<CTAProps> = ({ onSignupClick }) => {
  return (
    <section className="py-24 bg-accent-teal text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-main/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-8"
        >
          Eleve sua consultoria de RH para o próximo nível
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 mb-12 text-lg text-gray-200"
        >
          {["14 dias grátis - cancele quando quiser", "Importe seus clientes atuais em minutos", "Suporte dedicado para consultores"].map((item, i) => (
             <div key={i} className="flex items-center space-x-2">
               <CheckCircle2 className="w-5 h-5 text-secondary-main flex-shrink-0" />
               <span>{item}</span>
             </div>
          ))}
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.3 }}
        >
          <Button 
            variant="primary" 
            className="text-lg px-10 py-4 shadow-xl shadow-secondary-main/20 hover:shadow-2xl hover:shadow-secondary-main/40 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignupClick}
          >
            Começar agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="mt-4 text-sm text-gray-400">Junte-se a mais de 500 consultorias que usam MapeRH</p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;