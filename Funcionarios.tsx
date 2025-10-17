import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Briefcase, Edit, Trash2, Save, Clock, Percent } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { formatPhone } from '../../utils/formatters';
import { BusinessHours } from '../../types';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useModal } from '../../contexts/ModalContext';

interface Funcionario {
  id: string;
  name: string;
  phone: string;
  specialties: string[];
  commission_products: number;
  commission_services: number;
  commission_combos: number;
  schedule: BusinessHours[];
  active: boolean;
}

const mockSpecialties = ['Barbeiro', 'Manicure', 'Esteticista', 'Cabelereira'];
const weekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

const defaultSchedule = (): BusinessHours[] => weekDays.map(day => ({
  day,
  start_time: '09:00',
  end_time: '18:00',
  break_start: '12:00',
  break_end: '13:00',
  active: !['Sábado', 'Domingo'].includes(day),
}));

const generateMockFuncionarios = (count: number): Funcionario[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    specialties: faker.helpers.arrayElements(mockSpecialties, { min: 1, max: 2 }),
    commission_products: faker.number.int({ min: 5, max: 15 }),
    commission_services: faker.number.int({ min: 20, max: 50 }),
    commission_combos: faker.number.int({ min: 10, max: 25 }),
    schedule: defaultSchedule(),
    active: faker.datatype.boolean(),
  }));
};

const defaultFormState: Partial<Funcionario> = {
  name: '',
  phone: '',
  specialties: [],
  commission_products: 10,
  commission_services: 40,
  commission_combos: 20,
  schedule: defaultSchedule(),
  active: true,
};

const Funcionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(generateMockFuncionarios(1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Funcionario | null>(null);
  const [formData, setFormData] = useState<Partial<Funcionario>>(defaultFormState);
  const { getLimit } = useSubscription();
  const { showConfirm, showAlert } = useModal();
  const limit = getLimit('funcionarios');

  const openModal = (item: Funcionario | null = null) => {
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
      setFuncionarios(funcionarios.map(c => c.id === editingItem.id ? { ...c, ...formData } as Funcionario : c));
    } else {
      setFuncionarios([...funcionarios, { id: faker.string.uuid(), ...formData } as Funcionario]);
    }
    closeModal();
    showAlert({ title: 'Salvo!', message: 'Funcionário salvo com sucesso.', type: 'success' });
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Excluir Funcionário',
      message: 'Tem certeza que deseja excluir este funcionário?',
      type: 'warning',
      onConfirm: () => {
        setFuncionarios(funcionarios.filter(c => c.id !== id));
        showAlert({ title: 'Excluído', message: 'Funcionário excluído com sucesso.', type: 'success' });
      }
    });
  };
  
  const handleToggleStatus = (id: string, active: boolean) => {
    setFuncionarios(funcionarios.map(c => c.id === id ? { ...c, active } : c));
  };
  
  const handleSpecialtyChange = (specialty: string) => {
    const currentSpecialties = formData.specialties || [];
    const newSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty];
    setFormData(p => ({ ...p, specialties: newSpecialties }));
  };

  const handleScheduleChange = (index: number, field: keyof BusinessHours, value: string | boolean) => {
    const newSchedule = [...(formData.schedule || [])];
    (newSchedule[index] as any)[field] = value;
    setFormData(p => ({ ...p, schedule: newSchedule }));
  };

  return (
    <div>
      <PageHeader
        icon={Briefcase}
        title="Cadastro de Funcionários"
        description="Gerencie os funcionários e suas comissões"
        buttonLabel="Novo Funcionário"
        onButtonClick={() => openModal()}
        limit={limit}
        count={funcionarios.length}
      />

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 overflow-hidden">
        <table className="w-full text-left min-w-[720px]">
          <thead className="bg-light-200 dark:bg-dark-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Especialidades</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Status</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(item => (
              <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                <td className="p-4 text-light-900 dark:text-dark-200">{item.name}</td>
                <td className="p-4 text-light-500 dark:text-dark-400">{item.specialties.join(', ')}</td>
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Funcionário' : 'Novo Funcionário'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Telefone</label>
              <input type="tel" value={formatPhone(formData.phone || '')} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="w-full input-style" maxLength={15} required />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Especialidades</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-light-200 dark:bg-dark-700 p-3 rounded-lg">
              {mockSpecialties.map(spec => (
                <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={(formData.specialties || []).includes(spec)}
                    onChange={() => handleSpecialtyChange(spec)}
                    className="rounded border-light-300 dark:border-dark-600 bg-light-50 dark:bg-dark-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-light-700 dark:text-dark-300">{spec}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-light-900 dark:text-dark-200 mb-3 flex items-center"><Percent className="w-4 h-4 mr-2" />Comissões</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Produtos (%)</label>
                <input type="number" value={formData.commission_products || 0} onChange={e => setFormData(p => ({...p, commission_products: Number(e.target.value)}))} className="w-full input-style" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Serviços (%)</label>
                <input type="number" value={formData.commission_services || 0} onChange={e => setFormData(p => ({...p, commission_services: Number(e.target.value)}))} className="w-full input-style" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Combos (%)</label>
                <input type="number" value={formData.commission_combos || 0} onChange={e => setFormData(p => ({...p, commission_combos: Number(e.target.value)}))} className="w-full input-style" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold text-light-900 dark:text-dark-200 mb-3 flex items-center"><Clock className="w-4 h-4 mr-2" />Jornada de Trabalho</h3>
            <div className="space-y-3 bg-light-200 dark:bg-dark-700 p-4 rounded-lg">
              {formData.schedule?.map((hour, index) => (
                <div key={hour.day} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                  <div className="col-span-12 sm:col-span-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={hour.active}
                        onChange={(e) => handleScheduleChange(index, 'active', e.target.checked)}
                        className="rounded border-light-300 dark:border-dark-600 bg-light-50 dark:bg-dark-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-light-700 dark:text-dark-300">{hour.day}</span>
                    </label>
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input type="time" value={hour.start_time} onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)} disabled={!hour.active} className="w-full input-style py-1 text-sm disabled:opacity-50" />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input type="time" value={hour.end_time} onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)} disabled={!hour.active} className="w-full input-style py-1 text-sm disabled:opacity-50" />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input type="time" value={hour.break_start || ''} onChange={(e) => handleScheduleChange(index, 'break_start', e.target.value)} disabled={!hour.active} className="w-full input-style py-1 text-sm disabled:opacity-50" />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input type="time" value={hour.break_end || ''} onChange={(e) => handleScheduleChange(index, 'break_end', e.target.value)} disabled={!hour.active} className="w-full input-style py-1 text-sm disabled:opacity-50" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-light-500 dark:text-dark-500 mt-2">Os horários de trabalho devem respeitar o funcionamento da empresa.</p>
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

export default Funcionarios;
