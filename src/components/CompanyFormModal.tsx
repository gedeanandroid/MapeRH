import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Button from '../../components/ui/Button';
import { EmpresaCliente } from '../contexts/WorkspaceContext';

interface CompanyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    company?: EmpresaCliente | null;
    consultoriaId: string;
}

const SEGMENTOS = [
    'Indústria',
    'Serviços',
    'Varejo',
    'Tecnologia',
    'Saúde',
    'Educação',
    'Financeiro',
    'Agronegócio',
    'Construção',
    'Outro',
];

const TAMANHOS = [
    { value: 'ate_20', label: 'Até 20 colaboradores' },
    { value: '20_100', label: '20 a 100 colaboradores' },
    { value: '100_mais', label: 'Mais de 100 colaboradores' },
];

export default function CompanyFormModal({
    isOpen,
    onClose,
    onSuccess,
    company,
    consultoriaId,
}: CompanyFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        nome_fantasia: '',
        cnpj: '',
        email_contato: '',
        telefone: '',
        segmento: '',
        tamanho_estimado: '',
    });

    const isEditing = !!company;

    useEffect(() => {
        if (company) {
            setFormData({
                nome: company.nome || '',
                nome_fantasia: company.nome_fantasia || '',
                cnpj: company.cnpj || '',
                email_contato: company.email_contato || '',
                telefone: company.telefone || '',
                segmento: company.segmento || '',
                tamanho_estimado: company.tamanho_estimado || '',
            });
        } else {
            setFormData({
                nome: '',
                nome_fantasia: '',
                cnpj: '',
                email_contato: '',
                telefone: '',
                segmento: '',
                tamanho_estimado: '',
            });
        }
    }, [company, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.nome.trim()) {
                throw new Error('Nome da empresa é obrigatório');
            }

            if (formData.email_contato && !formData.email_contato.includes('@')) {
                throw new Error('Email inválido');
            }

            const data = {
                ...formData,
                nome: formData.nome.trim(),
                nome_fantasia: formData.nome_fantasia.trim() || null,
                cnpj: formData.cnpj.trim() || null,
                email_contato: formData.email_contato.trim() || null,
                telefone: formData.telefone.trim() || null,
                segmento: formData.segmento || null,
                tamanho_estimado: formData.tamanho_estimado || null,
                consultoria_id: consultoriaId,
                atualizado_em: new Date().toISOString(),
            };

            if (isEditing && company) {
                const { error: updateError } = await supabase
                    .from('empresas_clientes')
                    .update(data)
                    .eq('id', company.id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('empresas_clientes')
                    .insert(data);

                if (insertError) throw insertError;
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar empresa');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-main/10 rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary-main" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-gray900">
                                {isEditing ? 'Editar empresa' : 'Cadastrar empresa cliente'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                Nome da empresa *
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Ex: ABC Indústria Ltda"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/10"
                            />
                        </div>

                        {/* Nome Fantasia */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                Nome fantasia
                            </label>
                            <input
                                type="text"
                                name="nome_fantasia"
                                value={formData.nome_fantasia}
                                onChange={handleChange}
                                placeholder="Ex: ABC Indústria"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/10"
                            />
                        </div>

                        {/* CNPJ */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                CNPJ
                            </label>
                            <input
                                type="text"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleChange}
                                placeholder="00.000.000/0000-00"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/10"
                            />
                        </div>

                        {/* Email and Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                    Email de contato
                                </label>
                                <input
                                    type="email"
                                    name="email_contato"
                                    value={formData.email_contato}
                                    onChange={handleChange}
                                    placeholder="contato@empresa.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                    Telefone
                                </label>
                                <input
                                    type="text"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    placeholder="(00) 0000-0000"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/10"
                                />
                            </div>
                        </div>

                        {/* Segment and Size */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                    Segmento
                                </label>
                                <select
                                    name="segmento"
                                    value={formData.segmento}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/10 bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    {SEGMENTOS.map(seg => (
                                        <option key={seg} value={seg}>{seg}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                                    Tamanho
                                </label>
                                <select
                                    name="tamanho_estimado"
                                    value={formData.tamanho_estimado}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/10 bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    {TAMANHOS.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                        Salvando...
                                    </>
                                ) : (
                                    isEditing ? 'Salvar alterações' : 'Cadastrar empresa'
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
