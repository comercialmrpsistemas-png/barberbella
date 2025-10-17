import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Scissors, Edit, Trash2, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { formatCurrency } from '../../utils/formatters';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useModal } from '../../contexts/ModalContext';

// Mock data for specialties to be used in the form
const mockEspecialidades = [
  { id: '1', name: 'Barbeiro' },
  { id: '2', name: 'Manicure' },
  { id: '3', name: 'Cabelereira' },
  { id: '4', name: 'Podóloga' },
  { id: '5', name: 'Quiropraxia' },
  { id: '6', name: 'Esteticista' },
];

interface Servico {
  id: string;
  name: string;
  duration: number; // em minutos
  price: number;
  active: boolean;
  specialty_ids: string[];
}

const mockServicos: Servico[] = [
    { id: '1', name: 'Corte Masculino', duration: 30, price: 40, active: true, specialty_ids: ['1', '3'] },
    { id: '2', name: 'Barba', duration: 20, price: 30, active: true, specialty_ids: ['1'] },
    { id: '3', name: 'Corte + Barba', duration: 50, price: 65, active: true, specialty_ids: ['1'] },
    { id: '4', name: 'Sobrancelha', duration: 15, price: 20, active: true, specialty_ids: ['6'] },
    { id: '5', name: 'Pintura de Cabelo', duration: 60, price: 80, active: false, specialty_ids: ['3'] },
    { id: '6', name: 'Manicure Simples', duration: 40, price: 25, active: true, specialty_ids: ['2'] },
];

const defaultFormState: Partial<Servico> = {
  name: '',
  duration: 30,
  price: 0,
  active: true,
  specialty_ids: [],
};

const Servicos: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>(mockServicos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Servico | null>(null);
  const [formData, setFormData] = useState<Partial<Servico>>(defaultFormState);
  const { getLimit } = useSubscription();
  const { showConfirm, showAlert } = useModal();
  const limit = getLimit('servicos');

  const openModal = (item: Servico | null = null) => {
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
      setServicos(servicos.map(s => s.id === editingItem.id ? { ...s, ...formData } as Servico : s));
    } else {
      setServicos([...servicos, { id: faker.string.uuid(), ...formData } as Servico]);
    }
    closeModal();
    showAlert({ title: 'Salvo!', message: 'Serviço salvo com sucesso.', type: 'success' });
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Excluir Serviço',
      message: 'Tem certeza que deseja excluir este serviço?',
      type: 'warning',
      onConfirm: () => {
        setServicos(servicos.filter(s => s.id !== id));
        showAlert({ title: 'Excluído', message: 'Serviço excluído com sucesso.', type: 'success' });
      }
    });
  };
  
  const handleToggleStatus = (id: string, active: boolean) => {
    setServicos(servicos.map(s => s.id === id ? { ...s, active } : s));
  };

  const handleSpecialtyChange = (specialtyId: string) => {
    const currentIds = formData.specialty_ids || [];
    const newIds = currentIds.includes(specialtyId)
        ? currentIds.filter(id => id !== specialtyId)
        : [...currentIds, specialtyId];
    setFormData(p => ({ ...p, specialty_ids: newIds }));
  };

  return (
    <div>
      <PageHeader
        icon={Scissors}
        title="Cadastro de Serviços"
        description="Gerencie os serviços oferecidos"
        buttonLabel="Novo Serviço"
        onButtonClick={() => openModal()}
        limit={limit}
        count={servicos.length}
      />

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 overflow-hidden">
        <table className="w-full text-left min-w-[720px]">
          <thead className="bg-light-200 dark:bg-dark-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Especialidades</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Duração</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Preço</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Status</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map(item => (
              <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                <td className="p-4 text-light-900 dark:text-dark-200">{item.name}</td>
                <td className="p-4 text-light-500 dark:text-dark-400 text-xs">
                  {item.specialty_ids.map(id => mockEspecialidades.find(e => e.id === id)?.name).join(', ')}
                </td>
                <td className="p-4 text-light-500 dark:text-dark-400">{item.duration} min</td>
                <td className="p-4 text-light-500 dark:text-dark-400">{formatCurrency(item.price)}</td>
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome do Serviço</label>
            <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Duração (minutos)</label>
              <input type="number" value={formData.duration || 0} onChange={e => setFormData(p => ({...p, duration: Number(e.target.value)}))} className="w-full input-style" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Preço (R$)</label>
              <input type="number" step="0.01" value={formData.price || 0} onChange={e => setFormData(p => ({...p, price: Number(e.target.value)}))} className="w-full input-style" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Especialidades Requeridas</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-light-200 dark:bg-dark-700 p-3 rounded-lg">
              {mockEspecialidades.map(spec => (
                <label key={spec.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.specialty_ids || []).includes(spec.id)}
                    onChange={() => handleSpecialtyChange(spec.id)}
                    className="rounded border-light-300 dark:border-dark-600 bg-light-50 dark:bg-dark-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-light-700 dark:text-dark-300">{spec.name}</span>
                </label>
              ))}
            </div>
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

export default Servicos;
