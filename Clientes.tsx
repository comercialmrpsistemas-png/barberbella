import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Users, Edit, Trash2, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { formatPhone, formatBirthDate, toYYYYMMDD, toDDMMYYYY, formatCpf } from '../../utils/formatters';
import { Client } from '../../types';
import { format } from 'date-fns';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';

const generateMockClientes = (count: number): Client[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    cpf: formatCpf(faker.string.numeric(11)),
    birthDate: format(faker.date.past({ years: 30, refDate: '2000-01-01' }), 'yyyy-MM-dd'),
    active: faker.datatype.boolean(),
    company_id: 'demo-company',
  }));
};

const defaultFormState: Partial<Client> = {
  name: '',
  phone: '',
  email: '',
  cpf: '',
  birthDate: '',
  active: true,
};

const Clientes: React.FC = () => {
  const { clientes: allClientesFromContext } = useAuth();
  const [clientes, setClientes] = useState<Client[]>(allClientesFromContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>(defaultFormState);
  const [maskedBirthDate, setMaskedBirthDate] = useState('');
  const { getLimit } = useSubscription();
  const { showConfirm, showAlert } = useModal();
  const clientLimit = getLimit('clientes');

  const openModal = (cliente: Client | null = null) => {
    setEditingCliente(cliente);
    if (cliente) {
        setFormData({ ...cliente });
        setMaskedBirthDate(toDDMMYYYY(cliente.birthDate));
    } else {
        setFormData(defaultFormState);
        setMaskedBirthDate('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
    setFormData(defaultFormState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const birthDateYYYYMMDD = toYYYYMMDD(maskedBirthDate);
    const finalData = { ...formData, birthDate: birthDateYYYYMMDD };

    if (editingCliente) {
      const emailExists = allClientesFromContext.some(c => c.id !== editingCliente.id && c.email?.toLowerCase() === finalData.email?.toLowerCase() && finalData.email);
      const cpfExists = allClientesFromContext.some(c => c.id !== editingCliente.id && c.cpf === finalData.cpf && finalData.cpf);

      if (emailExists) {
        showAlert({ title: 'Erro de Validação', message: 'Este email já está em uso por outro cliente.', type: 'error' });
        return;
      }
      if (cpfExists) {
        showAlert({ title: 'Erro de Validação', message: 'Este CPF já está em uso por outro cliente.', type: 'error' });
        return;
      }

      setClientes(clientes.map(c => c.id === editingCliente.id ? { ...c, ...finalData } as Client : c));
      closeModal();
      showAlert({ title: 'Salvo!', message: 'Cliente atualizado com sucesso.', type: 'success' });

    } else {
      const existingByCpf = allClientesFromContext.find(c => c.cpf === finalData.cpf && finalData.cpf && finalData.cpf.length > 0);
      const existingByEmail = allClientesFromContext.find(c => c.email?.toLowerCase() === finalData.email?.toLowerCase() && finalData.email && finalData.email.length > 0);

      if (existingByCpf) {
        showConfirm({
          title: 'Cliente Duplicado',
          message: `Já existe um cliente com este CPF (${existingByCpf.name}). Deseja atualizar os dados dele com as novas informações?`,
          type: 'warning',
          onConfirm: () => {
            const updatedClient = { ...existingByCpf, ...finalData };
            setClientes(clientes.map(c => c.id === existingByCpf.id ? updatedClient : c));
            closeModal();
            showAlert({ title: 'Atualizado!', message: 'Os dados do cliente existente foram atualizados.', type: 'success' });
          }
        });
        return;
      }

      if (existingByEmail) {
        showAlert({ title: 'Erro de Validação', message: 'Este email já está cadastrado.', type: 'error' });
        return;
      }

      setClientes([...clientes, { id: faker.string.uuid(), company_id: 'demo-company', ...finalData } as Client]);
      closeModal();
      showAlert({ title: 'Salvo!', message: 'Cliente salvo com sucesso.', type: 'success' });
    }
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Excluir Cliente',
      message: 'Tem certeza que deseja excluir este cliente?',
      type: 'warning',
      onConfirm: () => {
        setClientes(clientes.filter(c => c.id !== id));
        showAlert({ title: 'Excluído', message: 'Cliente excluído com sucesso.', type: 'success' });
      }
    });
  };
  
  const handleToggleStatus = (id: string, active: boolean) => {
    setClientes(clientes.map(c => c.id === id ? { ...c, active } : c));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formattedPhone }));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaskedBirthDate(formatBirthDate(e.target.value));
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, cpf: formatCpf(e.target.value) }));
  };

  return (
    <div>
      <PageHeader
        icon={Users}
        title="Cadastro de Clientes"
        description="Gerencie os clientes da sua barbearia"
        buttonLabel="Novo Cliente"
        onButtonClick={() => openModal()}
        limit={clientLimit}
        count={clientes.length}
      />

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 overflow-hidden">
        <table className="w-full text-left min-w-[720px]">
          <thead className="bg-light-200 dark:bg-dark-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Email</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">CPF</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Telefone</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Aniversário</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Status</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                <td className="p-4 text-light-900 dark:text-dark-200">{cliente.name}</td>
                <td className="p-4 text-light-500 dark:text-dark-400">{cliente.email || '-'}</td>
                <td className="p-4 text-light-500 dark:text-dark-400">{cliente.cpf || '-'}</td>
                <td className="p-4 text-light-500 dark:text-dark-400">{formatPhone(cliente.phone)}</td>
                <td className="p-4 text-light-500 dark:text-dark-400">
                  {toDDMMYYYY(cliente.birthDate) || '-'}
                </td>
                <td className="p-4 text-center">
                  <ToggleSwitch 
                    checked={cliente.active}
                    onChange={(checked) => handleToggleStatus(cliente.id, checked)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => openModal(cliente)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-blue-500 dark:hover:text-blue-400" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cliente.id)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCliente ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Email</label>
              <input type="email" value={formData.email || ''} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="w-full input-style" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">CPF</label>
              <input type="text" value={formData.cpf || ''} onChange={handleCpfChange} className="w-full input-style" placeholder="000.000.000-00" maxLength={14} />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Telefone</label>
              <input type="tel" value={formData.phone || ''} onChange={handlePhoneChange} className="w-full input-style" maxLength={15} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Data de Nascimento</label>
            <input 
              type="text" 
              value={maskedBirthDate} 
              onChange={handleBirthDateChange} 
              className="w-full input-style"
              placeholder="dd/mm/aaaa"
              maxLength={10}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300">Ativo</label>
            <ToggleSwitch
              checked={formData.active ?? true}
              onChange={checked => setFormData(p => ({...p, active: checked}))}
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              <Save className="w-5 h-5" />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;
