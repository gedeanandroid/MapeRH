import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BarChart3, Settings, Search, Bell, PieChart, TrendingUp, UserPlus, Building2, Target, Briefcase, Network } from 'lucide-react';

const DashboardMockup: React.FC = () => {
  const [activeSection, setActiveSection] = useState(0);

  // Auto-animate sections
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSection(prev => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: PieChart },
    { name: 'Colaboradores', icon: Users },
    { name: 'Cargos', icon: Briefcase },
    { name: 'Competências', icon: Target },
    { name: 'Estrutura', icon: Network },
  ];

  return (
    <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto">
      {/* Abstract decorative background blobs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-10 -right-10 w-64 h-64 bg-secondary-main/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary-main/30 rounded-full blur-3xl"
      />

      {/* Main Window */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white rounded-xl shadow-2xl border border-neutral-gray200 overflow-hidden flex flex-col h-full z-10"
      >
        {/* Top Bar */}
        <div className="h-12 border-b border-neutral-gray100 flex items-center justify-between px-4 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-6 max-w-xs">
            <div className="bg-neutral-gray50 rounded-md px-3 py-1 flex items-center text-xs text-gray-400 border border-neutral-gray200">
              <Search className="w-3 h-3 mr-2" />
              Buscar colaboradores, cargos...
            </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <Bell className="w-4 h-4" />
            <div className="w-7 h-7 rounded-full bg-primary-main text-white flex items-center justify-center text-xs font-bold">
              JS
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-neutral-gray50">
          {/* Sidebar */}
          <div className="w-14 md:w-44 bg-white border-r border-neutral-gray100 flex flex-col py-3">
            <div className="space-y-1 px-2">
              {menuItems.map((item, i) => (
                <motion.div
                  key={i}
                  animate={{
                    backgroundColor: activeSection === i ? 'rgba(13,71,161,0.1)' : 'transparent',
                    color: activeSection === i ? '#0D47A1' : '#6b7280'
                  }}
                  className={`flex items-center px-2 py-2 rounded-md text-sm cursor-pointer font-medium`}
                >
                  <item.icon className="w-4 h-4 mr-0 md:mr-2 flex-shrink-0" />
                  <span className="hidden md:block truncate text-xs">{item.name}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-auto px-2">
              <div className="flex items-center px-2 py-2 rounded-md text-xs text-gray-500 hover:bg-gray-50 cursor-pointer">
                <Settings className="w-4 h-4 mr-0 md:mr-2" />
                <span className="hidden md:block">Config</span>
              </div>
            </div>
          </div>

          {/* Main Dashboard View */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Colaboradores', val: '1,284', icon: Users, color: 'text-primary-main', bg: 'bg-primary-main/10' },
                { label: 'Cargos', val: '47', icon: Briefcase, color: 'text-secondary-dark', bg: 'bg-secondary-main/20' },
                { label: 'Competências', val: '32', icon: Target, color: 'text-accent-green', bg: 'bg-accent-green/10' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: activeSection === i + 1 ? 1.02 : 1,
                    boxShadow: activeSection === i + 1 ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  className="bg-white p-3 rounded-lg border border-neutral-gray100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">{stat.label}</p>
                      <h4 className="text-xl font-bold text-gray-800">{stat.val}</h4>
                    </div>
                    <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Chart */}
              <motion.div
                animate={{ scale: activeSection === 0 ? 1.01 : 1 }}
                className="col-span-2 bg-white p-3 rounded-lg border border-neutral-gray100 h-36 flex flex-col"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-semibold text-gray-700">Matriz CHA por Cargo</h4>
                  <div className="flex gap-2 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary-main rounded-sm" />Conhecimento</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-accent-green rounded-sm" />Habilidade</span>
                  </div>
                </div>
                <div className="flex-1 flex items-end justify-between space-x-1 px-1 pb-1">
                  {[40, 65, 45, 80, 55, 70, 90, 60].map((h, i) => (
                    <div key={i} className="w-full bg-gray-100 rounded-t-sm relative h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        className="absolute bottom-0 w-full bg-primary-main rounded-t-sm"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Progress Bars */}
              <motion.div
                animate={{ scale: activeSection === 4 ? 1.02 : 1 }}
                className="col-span-1 bg-white p-3 rounded-lg border border-neutral-gray100 h-36"
              >
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Estrutura Org.</h4>
                <div className="space-y-2">
                  {['Filial SP', 'Matriz RJ', 'Filial BH'].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                        <span>{item}</span>
                        <span>{45 + i * 20}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${45 + i * 20}%` }}
                          transition={{ duration: 1.2, delay: 0.8 }}
                          className="h-full bg-accent-green rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardMockup;