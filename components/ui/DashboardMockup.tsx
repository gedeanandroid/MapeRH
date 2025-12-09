import React from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, Settings, Search, Bell, PieChart, TrendingUp, UserPlus } from 'lucide-react';

const DashboardMockup: React.FC = () => {
  return (
    <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto perspective-1000">
      {/* Abstract decorative background blobs */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondary-main/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary-main/20 rounded-full blur-3xl" />

      {/* Main Window */}
      <motion.div 
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white rounded-xl shadow-2xl border border-neutral-gray200 overflow-hidden flex flex-col h-full z-10"
      >
        {/* Top Bar */}
        <div className="h-14 border-b border-neutral-gray100 flex items-center justify-between px-4 bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-8 max-w-sm">
             <div className="bg-neutral-gray50 rounded-md px-3 py-1.5 flex items-center text-xs text-gray-400 border border-neutral-gray200">
               <Search className="w-3 h-3 mr-2" />
               Buscar colaboradores, cargos...
             </div>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <Bell className="w-4 h-4" />
            <div className="w-8 h-8 rounded-full bg-primary-light text-white flex items-center justify-center text-xs font-bold">
              JS
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-neutral-gray50">
          {/* Sidebar */}
          <div className="w-16 md:w-48 bg-white border-r border-neutral-gray100 flex flex-col py-4">
             <div className="space-y-1 px-2">
               {['Dashboard', 'Colaboradores', 'Cargos', 'Avaliações', 'Recrutamento'].map((item, i) => (
                 <div key={i} className={`flex items-center px-3 py-2 rounded-md text-sm cursor-pointer ${i === 0 ? 'bg-primary-main/10 text-primary-main font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <div className="w-4 h-4 mr-0 md:mr-3">
                      {i === 0 && <PieChart className="w-4 h-4" />}
                      {i === 1 && <Users className="w-4 h-4" />}
                      {i === 2 && <BarChart3 className="w-4 h-4" />}
                      {i === 3 && <TrendingUp className="w-4 h-4" />}
                      {i === 4 && <UserPlus className="w-4 h-4" />}
                    </div>
                    <span className="hidden md:block">{item}</span>
                 </div>
               ))}
             </div>
             <div className="mt-auto px-2">
                <div className="flex items-center px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
                  <Settings className="w-4 h-4 mr-0 md:mr-3" />
                  <span className="hidden md:block">Configurações</span>
                </div>
             </div>
          </div>

          {/* Main Dashboard View */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Colaboradores', val: '1,284', icon: Users, color: 'text-primary-main', bg: 'bg-primary-main/10' },
                { label: 'Vagas Abertas', val: '23', icon: UserPlus, color: 'text-secondary-dark', bg: 'bg-secondary-main/20' },
                { label: 'Avaliações Pendentes', val: '12', icon: BarChart3, color: 'text-accent-green', bg: 'bg-accent-green/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-gray100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <h4 className="text-2xl font-bold text-gray-800">{stat.val}</h4>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm border border-neutral-gray100 h-48 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold text-gray-700">Competências por Departamento</h4>
                </div>
                <div className="flex-1 flex items-end justify-between space-x-2 px-2 pb-2">
                   {[40, 65, 45, 80, 55, 70, 90, 60, 75].map((h, i) => (
                     <div key={i} className="w-full bg-primary-light/20 rounded-t-sm relative group">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className="absolute bottom-0 w-full bg-primary-main rounded-t-sm hover:bg-primary-dark transition-colors"
                        />
                     </div>
                   ))}
                </div>
              </div>
              <div className="col-span-1 bg-white p-4 rounded-lg shadow-sm border border-neutral-gray100 h-48">
                 <h4 className="text-sm font-semibold text-gray-700 mb-4">Cultura</h4>
                 <div className="space-y-3">
                    {['Inovação', 'Liderança', 'Foco no Cliente'].map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{skill}</span>
                          <span>{85 + i * 5}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${85 + i * 5}%` }}
                            transition={{ duration: 1.2, delay: 0.8 }}
                            className="h-full bg-accent-green rounded-full" 
                          />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardMockup;