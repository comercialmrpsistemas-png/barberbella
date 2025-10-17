import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Star, Edit, Trash2, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { useModal } from '../../contexts/ModalContext';

interface Especialidade {
  id: string;
  name: string;
  active: boolean;
}

const mockEspecialidades: Especialidade[] = [
  { id: '1', name: 'Barbeiro', active: true },
  { id: '2', name: 'Manicure', active: true },
  { id: '3', name: 'Cabelereira', active: true },
  { id: '4', name: 'Podóloga', active: false },
  { id: '5', name: 'Quiropraxia', active: true },
  { id: '6', name: 'Esteticista', active: true },
];

const defaultFormState: Partial<Especialidade> = {
  name: '',
  active: true,
};

const Especialidades: React.FC = () => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>(mockEspecialidades);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Especialidade | null>(null);
  const [formData, setFormData] = useState<Partial<Especialidade>>(defaultFormState);
  const { showConfirm, showAlert } = useModal();

  const openModal = (item: Especialidade | null = null) => {
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
      setEspecialidades(especialidades.map(c => c.id === editingItem.id ? { ...c, ...formData } as Especialidade : c));
    } else {
      setEspecialidades([...especialidades, { id: faker.string.uuid(), ...formData } as Especialidade]);
    }
    closeModal();
    showAlert({ title: 'Salvo!', message: 'Especialidade salva com sucesso.', type: 'success' });
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Excluir Especialidade',
      message: 'Tem certeza que deseja excluir esta especialidade?',
      type: 'warning',
      onConfirm: () => {
        setEspecialidades(especialidades.filter(c => c.id !== id));
        showAlert({ title: 'Excluído', message: 'Especialidade excluída com sucesso.', type: 'success' });
      }
    });
  };
  
  const handleToggleStatus = (id: string, active: boolean) => {
    setEspecialidades(especialidades.map(c => c.id === id ? { ...c, active } : c));
  };

  return (
    <div>
      <PageHeader
        icon={Star}
        title="Cadastro de Especialidades"
        description="Gerencie as especialidades dos seus funcionários"
        buttonLabel="Nova Especialidade"
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
            {especialidades.map(item => (
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Especialidade' : 'Nova Especialidade'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome da Especialidade</label>
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

export default Especialidades;
