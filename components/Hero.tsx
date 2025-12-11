
import React from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import DashboardMockup from './ui/DashboardMockup';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-screen pt-32 pb-20 lg:pt-40 lg:pb-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

        {/* Column 1: Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col space-y-8 z-10"
        >
          <div className="inline-flex items-center space-x-2 bg-primary-main/5 rounded-full px-4 py-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-secondary-main animate-pulse"></span>
            <span className="text-xs font-semibold text-primary-main tracking-wide uppercase">Para Consultores de Elite</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-gray900 leading-[1.1] tracking-tight">
            O sistema de gestão de RH mais completo para consultores que querem <span className="text-primary-main">transformar empresas</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-gray600 leading-relaxed max-w-lg">
            MapeRH é a única plataforma que unifica cultura organizacional, estrutura de cargos e gestão de competências em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" className="group" onClick={() => navigate('/signup')}>
              Experimente grátis por 7 dias
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary">
              Agendar Demo
            </Button>
          </div>

          <p className="text-sm text-neutral-gray400 pt-2">
            * Não requer cartão de crédito para iniciar
          </p>
        </motion.div>

        {/* Column 2: Image/Mockup */}
        <div className="relative z-10">
          <DashboardMockup />
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-gray-50 to-white -z-10 skew-x-12 translate-x-20" />
    </section>
  );
};

export default Hero;
