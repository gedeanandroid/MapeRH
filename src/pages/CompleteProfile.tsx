import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Loader2, Building2, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const profileSchema = z.object({
    nome_consultoria: z.string().min(3, 'Nome da consultoria é obrigatório'),
    nome_fantasia: z.string().optional(),
    cnpj: z.string().optional(),
    telefone: z.string().min(8, 'Telefone inválido').optional().or(z.literal('')),
    site: z.string().url('URL inválida').optional().or(z.literal('')),
    instagram: z.string().optional(),
    qtd_clientes_estimado: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

export default function CompleteProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [consultoriaId, setConsultoriaId] = useState<string | null>(null);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormInputs>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        const fetchConsultoria = async () => {
            if (!user) return;

            try {
                // Fetch user's consultoria_id
                const { data: userData, error: userError } = await supabase
                    .from('usuarios')
                    .select('consultoria_id')
                    .eq('auth_user_id', user.id)
                    .single();

                if (userError) throw userError;
                if (!userData) throw new Error('Usuario not found');

                setConsultoriaId(userData.consultoria_id);

                // Fetch consultoria details
                const { data: consultoriaData, error: consultoriaError } = await supabase
                    .from('consultorias')
                    .select('*')
                    .eq('id', userData.consultoria_id)
                    .single();

                if (consultoriaError) throw consultoriaError;

                if (consultoriaData) {
                    setValue('nome_consultoria', consultoriaData.nome || '');
                    setValue('nome_fantasia', consultoriaData.nome_fantasia || '');
                    setValue('cnpj', consultoriaData.cnpj || '');
                    setValue('telefone', consultoriaData.telefone || '');
                    setValue('site', consultoriaData.site || '');
                    setValue('instagram', consultoriaData.instagram || '');
                    setValue('qtd_clientes_estimado', consultoriaData.qtd_clientes_estimado || '');
                }

            } catch (error: any) {
                console.error('Error fetching profile:', error);
                setMsg({ type: 'error', text: 'Erro ao carregar dados da consultoria.' });
            } finally {
                setLoading(false);
            }
        };

        fetchConsultoria();
    }, [user, setValue]);

    const onSubmit = async (data: ProfileFormInputs) => {
        if (!consultoriaId) return;
        setSaving(true);
        setMsg(null);

        try {
            const { error } = await supabase
                .from('consultorias')
                .update({
                    nome: data.nome_consultoria,
                    nome_fantasia: data.nome_fantasia,
                    cnpj: data.cnpj,
                    telefone: data.telefone,
                    site: data.site,
                    instagram: data.instagram,
                    qtd_clientes_estimado: data.qtd_clientes_estimado,
                    perfil_completo: true,
                    atualizado_em: new Date().toISOString(),
                })
                .eq('id', consultoriaId);

            if (error) throw error;

            setMsg({ type: 'success', text: 'Perfil da consultoria atualizado com sucesso!' });
            // Redirect or stay? "Redirecionar de volta ao Painel Principal."
            // Assuming Dashboard is at / (for now LandingPage is /, but usually after login it's /dashboard).
            // Since I haven't built dashboard, I'll redirect to / or stay here. 
            // Plan said "Redireciona de volta ao Painel Principal."
            // I'll redirect to / after a short delay.
            setTimeout(() => navigate('/'), 2000);

        } catch (error: any) {
            console.error('Error updating profile:', error);
            setMsg({ type: 'error', text: 'Erro ao salvar perfil.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary-main" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link to="/" className="mr-4 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Building2 className="mr-3 text-primary-main" />
                        Perfil da Consultoria
                    </h1>
                </div>

                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Informações Institucionais</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Complete os dados da sua consultoria para personalizar a experiência.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {msg && (
                                    <div className={`mb-4 px-4 py-3 rounded relative border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                        {msg.text}
                                    </div>
                                )}

                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-4">
                                        <label htmlFor="nome_consultoria" className="block text-sm font-medium text-gray-700">
                                            Nome da Consultoria *
                                        </label>
                                        <input
                                            type="text"
                                            id="nome_consultoria"
                                            {...register('nome_consultoria')}
                                            className="mt-1 focus:ring-primary-main focus:border-primary-main block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        />
                                        {errors.nome_consultoria && <p className="mt-1 text-sm text-red-600">{errors.nome_consultoria.message}</p>}
                                    </div>

                                    <div className="col-span-6 sm:col-span-4">
                                        <label htmlFor="nome_fantasia" className="block text-sm font-medium text-gray-700">
                                            Nome Fantasia
                                        </label>
                                        <input
                                            type="text"
                                            id="nome_fantasia"
                                            {...register('nome_fantasia')}
                                            className="mt-1 focus:ring-primary-main focus:border-primary-main block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        />
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
                                            CNPJ
                                        </label>
                                        <input
                                            type="text"
                                            id="cnpj"
                                            {...register('cnpj')}
                                            className="mt-1 focus:ring-primary-main focus:border-primary-main block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        />
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                                            Telefone / WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            id="telefone"
                                            {...register('telefone')}
                                            className="mt-1 focus:ring-primary-main focus:border-primary-main block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        />
                                    </div>

                                    <div className="col-span-6">
                                        <label htmlFor="site" className="block text-sm font-medium text-gray-700">
                                            Website
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                http://
                                            </span>
                                            <input
                                                type="text"
                                                id="site"
                                                {...register('site')}
                                                className="focus:ring-primary-main focus:border-primary-main flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 px-3 border"
                                                placeholder="www.exemplo.com.br"
                                            />
                                        </div>
                                        {errors.site && <p className="mt-1 text-sm text-red-600">{errors.site.message}</p>}
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                                            Instagram
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                @
                                            </span>
                                            <input
                                                type="text"
                                                id="instagram"
                                                {...register('instagram')}
                                                className="focus:ring-primary-main focus:border-primary-main flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 px-3 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="qtd_clientes_estimado" className="block text-sm font-medium text-gray-700">
                                            Qtd. Clientes
                                        </label>
                                        <select
                                            id="qtd_clientes_estimado"
                                            {...register('qtd_clientes_estimado')}
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="1-5">1 a 5</option>
                                            <option value="6-20">6 a 20</option>
                                            <option value="21-50">21 a 50</option>
                                            <option value="50+">Mais de 50</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-6 -mx-4 -mb-5 sm:-mx-6 sm:-mb-6 rounded-b-lg">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-main hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                                        {saving ? 'Salvando...' : 'Salvar Perfil'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
