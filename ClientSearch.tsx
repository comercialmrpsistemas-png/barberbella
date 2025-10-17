import React, { useState, useMemo } from 'react';
import { User, UserPlus, Search, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Client } from '../../types';
import { useModal } from '../../contexts/ModalContext';
import { formatPhone, formatBirthDate, toYYYYMMDD, formatCpf } from '../../utils/formatters';

interface ClientSearchProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ selectedClient, onSelectClient }) => {
  const { clientes, addNewClient } = useAuth();
  const { showAlert } = useModal();
  const [search, setSearch] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', birthDate: '', email: '', cpf: '' });

  const filteredClients = useMemo(() => {
    if (!search) return [];
    return clientes.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
    );
  }, [search, clientes]);

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();

    if (newClient.email && newClient.email.length > 0 && clientes.some(c => c.email?.toLowerCase() === newClient.email.toLowerCase())) {
        showAlert({ title: 'Cliente Existente', message: 'Um cliente com este email já está cadastrado. Por favor, busque pelo cliente existente.', type: 'error' });
        return;
    }
    if (newClient.cpf && newClient.cpf.length > 0 && clientes.some(c => c.cpf === newClient.cpf)) {
        showAlert({ title: 'Cliente Existente', message: 'Um cliente com este CPF já está cadastrado. Por favor, busque pelo cliente existente.', type: 'error' });
        return;
    }

    const birthDateYYYYMMDD = toYYYYMMDD(newClient.birthDate);
    const createdClient = addNewClient({ 
      name: newClient.name, 
      phone: newClient.phone, 
      birthDate: birthDateYYYYMMDD,
      email: newClient.email,
      cpf: newClient.cpf,
    });
    onSelectClient(createdClient as Client);
    setIsClientModalOpen(false);
    setNewClient({ name: '', phone: '', birthDate: '', email: '', cpf: '' });
    setSearch('');
    showAlert({ title: 'Sucesso', message: 'Cliente cadastrado e selecionado!', type: 'success' });
  };

  if (selectedClient) {
    return (
      <div className="bg-light-200 dark:bg-dark-700 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-blue-500" />
          <div>
            <p className="font-bold text-light-900 dark:text-white">{selectedClient.name}</p>
            <p className="text-sm text-light-500 dark:text-dark-400">{selectedClient.phone}</p>
          </div>
        </div>
        <button onClick={() => onSelectClient(null)} className="p-2 rounded-full hover:bg-light-300 dark:hover:bg-dark-600">
          <X className="w-5 h-5 text-light-600 dark:text-dark-300" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-400 dark:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cliente por nome ou telefone (opcional)"
            className="w-full input-style pl-10"
          />
        </div>
        <button onClick={() => setIsClientModalOpen(true)} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" title="Novo Cliente">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {search && filteredClients.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-light-100 dark:bg-dark-800 border border-light-300 dark:border-dark-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => { onSelectClient(client); setSearch(''); }}
              className="p-3 hover:bg-light-200 dark:hover:bg-dark-700 cursor-pointer"
            >
              <p className="font-semibold text-light-900 dark:text-white">{client.name}</p>
              <p className="text-sm text-light-500 dark:text-dark-400">{client.phone}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsClientModalOpen(false)}>
            <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-light-900 dark:text-white">Novo Cliente</h2>
                <form onSubmit={handleSaveClient} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome</label>
                        <input type="text" value={newClient.name} onChange={e => setNewClient(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Email</label>
                        <input type="email" value={newClient.email} onChange={e => setNewClient(p => ({...p, email: e.target.value}))} className="w-full input-style" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Telefone</label>
                            <input type="tel" value={newClient.phone} onChange={e => setNewClient(p => ({...p, phone: formatPhone(e.target.value)}))} className="w-full input-style" maxLength={15} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">CPF</label>
                            <input type="text" value={newClient.cpf} onChange={e => setNewClient(p => ({...p, cpf: formatCpf(e.target.value)}))} className="w-full input-style" placeholder="000.000.000-00" maxLength={14} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Data de Nascimento</label>
                        <input type="text" value={newClient.birthDate} onChange={e => setNewClient(p => ({...p, birthDate: formatBirthDate(e.target.value)}))} className="w-full input-style" placeholder="dd/mm/aaaa" maxLength={10} />
                    </div>
                    <div className="flex justify-end pt-4 gap-2">
                        <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 bg-light-200 dark:bg-dark-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ClientSearch;
