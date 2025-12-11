import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';

const userSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    role_empresa: z.enum(['admin_empresa', 'gestor', 'visualizador']),
    ativo: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => Promise<void>;
    initialData?: UserFormData;
    title: string;
}

export default function UserFormModal({ isOpen, onClose, onSubmit, initialData, title }: UserFormModalProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            role_empresa: 'admin_empresa',
            ativo: true
        }
    });

    useEffect(() => {
        if (isOpen && initialData) {
            reset(initialData);
        } else if (isOpen) {
            reset({ role_empresa: 'admin_empresa', ativo: true });
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-neutral-gray900">{title}</h2>
                    <button onClick={onClose} className="text-neutral-gray500 hover:text-neutral-gray900 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                            Nome
                        </label>
                        <input
                            {...register('nome')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all"
                            placeholder="Nome completo"
                        />
                        {errors.nome && (
                            <p className="mt-1 text-xs text-red-500">{errors.nome.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                            Email
                        </label>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all"
                            placeholder="email@empresa.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-gray700 mb-1">
                            Papel
                        </label>
                        <select
                            {...register('role_empresa')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all"
                        >
                            <option value="admin_empresa">Admin Empresa (Acesso total)</option>
                            <option value="gestor">Gestor (Acesso parcial)</option>
                            <option value="visualizador">Visualizador (Somente leitura)</option>
                        </select>
                        {errors.role_empresa && (
                            <p className="mt-1 text-xs text-red-500">{errors.role_empresa.message}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="ativo"
                            {...register('ativo')}
                            className="w-4 h-4 text-primary-main border-gray-300 rounded focus:ring-primary-main"
                        />
                        <label htmlFor="ativo" className="text-sm text-neutral-gray700 select-none">
                            Usuário ativo
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-neutral-gray700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-main hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Usuário'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
