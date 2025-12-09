import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Search, Command } from 'lucide-react';
import { IntelligencePrompt } from '../types';

const Intelligence: React.FC = () => {
  const prompts: IntelligencePrompt[] = [
    { id: '1', text: "Criar estrutura de cargos para novo cliente" },
    { id: '2', text: "Comparar salários com mercado regional" },
    { id: '3', text: "Definir competências para cargo de gerente" },
    { id: '4', text: "Revisar missão e valores da empresa X" },
    { id: '5', text: "Montar plano de carreira completo" },
  ];

  return (
    <section id="intelligence" className="py-24 bg-accent-teal text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-secondary-main" />
            <span className="text-sm font-medium text-white">MapeRH Intelligence</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Você tem desafios de RH, <br/>
            <span className="text-secondary-main">o MapeRH tem as soluções</span>
          </h2>
        </motion.div>

        {/* Intelligence Interface Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl bg-neutral-gray900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl"
        >
          <div className="bg-neutral-gray900 rounded-xl overflow-hidden border border-white/5">
            {/* Header of fake browser/app */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 text-center text-xs text-gray-500 font-mono">MapeRH AI Assistant</div>
            </div>

            {/* Chat/Command Area */}
            <div className="p-8 md:p-12 flex flex-col items-center">
               <div className="w-16 h-16 bg-primary-main rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-main/40">
                 <Sparkles className="w-8 h-8 text-white" />
               </div>
               
               <h3 className="text-2xl font-medium text-white mb-8 text-center">Como posso ajudar sua consultoria hoje?</h3>

               {/* Search Input */}
               <div className="w-full max-w-lg relative mb-8 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-secondary-main transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-main/50 focus:bg-white/15 transition-all text-lg"
                    placeholder="Digite sua necessidade..."
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Command className="w-4 h-4" />
                      <span className="text-xs">K</span>
                    </div>
                  </div>
               </div>

               {/* Suggestions */}
               <div className="flex flex-wrap justify-center gap-3">
                 {prompts.map((prompt) => (
                   <motion.button
                     key={prompt.id}
                     whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                     whileTap={{ scale: 0.95 }}
                     className="bg-white/5 border border-white/10 text-gray-300 text-sm px-4 py-2 rounded-lg hover:text-white transition-colors cursor-pointer text-left flex items-center group"
                   >
                     {prompt.text}
                     <ArrowRight className="w-3 h-3 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-secondary-main" />
                   </motion.button>
                 ))}
               </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Intelligence;