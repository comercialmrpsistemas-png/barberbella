import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ClientPackage } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { XCircle, Search, Trash2, RotateCcw } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

const PlanosCancelados: React.FC = () => {
    const { clientPackages, setClientPackages } = useAuth(); // Assuming setClientPackages is exposed for this mock UI
    const { showConfirm, showAlert } = useModal();
    const [searchTerm, setSearchTerm] = useState('');

    const canceledPackages = useMemo(() => {
        return clientPackages
            .filter(p => p.status === 'cancelado')
            .filter(p => p.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [clientPackages, searchTerm]);

    const handleReactivate = (pkg: ClientPackage) => {
        showConfirm({
            title: 'Reativar Pacote?',
            message: `Deseja reativar o pacote "${pkg.planName}" para o cliente ${pkg.clientName}?`,
            type: 'confirmation',
            onConfirm: () => {
                // This is a mock implementation. In a real app, you'd call a context function.
                // setClientPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, status: 'ativo' } : p));
                showAlert({ title: 'Reativado!', message: 'O pacote foi reativado com sucesso.', type: 'success' });
            }
        });
    };

    const handleDeletePermanently = (pkg: ClientPackage) => {
        showConfirm({
            title: 'Excluir Definitivamente?',
            message: `Esta ação removerá permanentemente a solicitação de cancelamento de ${pkg.clientName}. Deseja continuar?`,
            type: 'warning',
            onConfirm: () => {
                // This is a mock implementation.
                // setClientPackages(prev => prev.filter(p => p.id !== pkg.id));
                showAlert({ title: 'Excluído!', message: 'O registro foi removido.', type: 'success' });
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-light-100 dark:bg-dark-800 p-4 rounded-lg border border-light-200 dark:border-dark-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-400 dark:text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome do cliente..."
                        className="w-full input-style pl-10"
                    />
                </div>
            </div>

            {canceledPackages.length > 0 ? (
                canceledPackages.map(pkg => (
                    <div key={pkg.id} className="bg-light-100 dark:bg-dark-800 p-4 rounded-lg border border-light-200 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <p className="font-bold text-light-900 dark:text-white">{pkg.clientName}</p>
                            <p className="text-sm text-light-600 dark:text-dark-300">{pkg.planName}</p>
                            <p className="text-xs text-light-500 dark:text-dark-400 mt-1">
                                Solicitação de cancelamento em: {format(parseISO(pkg.requestDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleReactivate(pkg)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
                                title="Reativar Pacote"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeletePermanently(pkg)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                                title="Excluir Solicitação"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12">
                    <XCircle className="w-12 h-12 mx-auto text-light-400 dark:text-dark-500 mb-2" />
                    <h3 className="text-lg font-semibold text-light-800 dark:text-white">Nenhuma solicitação de cancelamento</h3>
                    <p className="text-sm text-light-500 dark:text-dark-400">Não há pacotes com cancelamento solicitado no momento.</p>
                </div>
            )}
        </div>
    );
};

export default PlanosCancelados;
