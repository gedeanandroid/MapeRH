import React from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { AlertTriangle, X } from 'lucide-react';

export default function BannerImpersonation() {
    const { isImpersonating, stopImpersonation } = useAuth();

    if (!isImpersonating) return null;

    return (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-md relative z-50">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium text-sm">
                    Você está acessando como outro usuário (Modo Impersonation)
                </span>
            </div>

            <button
                onClick={() => stopImpersonation()}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1 rounded transition-colors flex items-center gap-2"
            >
                <X className="w-4 h-4" />
                Sair do modo impersonation
            </button>
        </div>
    );
}
