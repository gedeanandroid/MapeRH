import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import {
    LayoutDashboard, Users, Building, LogOut, Shield,
    CreditCard, FileText, Settings, UserCog, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout() {
    const { userProfile, signOut } = useAuth();
    const location = useLocation();

    const menuSections = [
        {
            title: 'Operações',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
                { icon: Building, label: 'Consultorias', path: '/admin/consultorias' },
                { icon: Users, label: 'Usuários Globais', path: '/admin/usuarios' },
            ]
        },
        {
            title: 'Financeiro',
            items: [
                { icon: CreditCard, label: 'Painel Financeiro', path: '/admin/financeiro' },
            ]
        },
        {
            title: 'Sistema',
            items: [
                { icon: UserCog, label: 'Usuários Internos', path: '/admin/internos' },
                { icon: FileText, label: 'Auditoria', path: '/admin/auditoria' },
                { icon: Settings, label: 'Configurações', path: '/admin/configuracoes' },
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-main/20 p-2 rounded-lg">
                            <Shield className="w-6 h-6 text-primary-main" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">MapeRH</h1>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Console Admin</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                    {menuSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.path ||
                                        (item.path !== '/admin' && location.pathname.startsWith(item.path));
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                                                ? 'bg-primary-main text-white font-medium'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-main to-primary-dark flex items-center justify-center">
                            <span className="font-semibold text-sm text-white">{userProfile?.nome?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{userProfile?.nome}</p>
                            <p className="text-xs text-emerald-400 truncate flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Superadmin
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2 w-full text-left text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
