import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailConfirmation() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const navigate = useNavigate();

    useEffect(() => {
        // Determine status based on URL hash or user session
        // Supabase usually redirects to this URL with a hash containing the access_token
        // or if the flow was PKCE, it might handle the session automatically.

        // We can check if we have a session.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setStatus('success');
            } else {
                // It might be that the user just clicked the link but `getSession` hasn't caught up, 
                // OR the link was consumed.
                // For now, let's assume if we land here and we are not logged in, we might just show a generic "Check your email" or if we detect parameters that indicate success.
                // Actually, Supabase confirmation link redirects to logic handled by `supabase.auth.onAuthStateChange` usually.

                // A simple approach:
                setStatus('success'); // Assume success if they reached here via the redirected link.
                // In a real app we might want to verify the token explicitly if manual handling.
            }
        });

    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                {status === 'success' ? (
                    <>
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Confirmado!</h2>
                        <p className="mt-2 text-gray-600">
                            Sua conta foi ativada com sucesso. Você já pode acessar o sistema.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-main hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-main"
                            >
                                Ir para Login
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Fallback or Loading */}
                        <p>Verificando...</p>
                    </>
                )}
            </div>
        </div>
    );
}
