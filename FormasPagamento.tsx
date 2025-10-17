import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { CreditCard, Edit, Trash2, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { useModal } from '../../contexts/ModalContext';

interface FormaPagamento {
  id: string;
  name: string;
  active: boolean;
}

const mockFormas: FormaPagamento[] = [
  { id: '1', name: 'Dinheiro', active: true },
  { id: '2', name: 'Pix', active: true },
  { id: '3', name: 'Cartão de Crédito', active: true },
  { id: '4', name: 'Cartão de Débito', active: true },
  { id: '5', name: 'Fiado', active: false },
];

const defaultFormState: Partial<FormaPagamento> = {
  name: '',
  active: true,
};

const FormasPagamento: React.FC = () => {
  const [formas, setFormas] = useState<FormaPagamento[]>(mockFormas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FormaPagamento | null>(null);
  const [formData, setFormData] = useState<Partial<FormaPagamento>>(defaultFormState);
  const { showConfirm, showAlert } = useModal();

  const openModal = (item: FormaPagamento | null = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item } : defaultFormState);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(defaultFormState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setFormas(formas.map(c => c.id === editingItem.id ? { ...c, ...formData } as FormaPagamento : c));
    } else {
      setFormas([...formas, { id: faker.string.uuid(), ...formData } as FormaPagamento]);
    }
    closeModal();
    showAlert({ title: 'Salvo!', message: 'Forma de pagamento salva com sucesso.', type: 'success' });
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Excluir Forma de Pagamento',
      message: 'Tem certeza que deseja excluir esta forma de pagamento?',
      type: 'warning',
      onConfirm: () => {
        setFormas(formas.filter(c => c.id !== id));
        showAlert({ title: 'Excluído', message: 'Forma de pagamento excluída com sucesso.', type: 'success' });
      }
    });
  };
  
  const handleToggleStatus = (id: string, active: boolean) => {
    setFormas(formas.map(c => c.id === id ? { ...c, active } : c));
  };

  return (
    <div>
      <PageHeader
        icon={CreditCard}
        title="Formas de Pagamento"
        description="Gerencie as formas de pagamento aceitas"
        buttonLabel="Nova Forma"
        onButtonClick={() => openModal()}
      />

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-light-200 dark:bg-dark-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Status</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {formas.map(item => (
              <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                <td className="p-4 text-light-900 dark:text-dark-200">{item.name}</td>
                <td className="p-4 text-center">
                  <ToggleSwitch 
                    checked={item.active}
                    onChange={(checked) => handleToggleStatus(item.id, checked)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => openModal(item)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-blue-500 dark:hover:text-blue-400" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome</label>
            <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
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

export default FormasPagamento;
