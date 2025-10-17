import React, { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import { Boxes, Edit, Trash2, Save, Scissors, Package } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { formatCurrency } from '../../utils/formatters';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useModal } from '../../contexts/ModalContext';

interface ComboItem {
  id: string;
  name: string;
  duration?: number;
}

interface Combo {
  id: string;
  name: string;
  type: 'service' | 'product';
  items: ComboItem[];
  price: number;
  duration?: number;
  allow_discount: boolean;
  active: boolean;
}

const mockAllServices: ComboItem[] = [
    { id: 'svc1', name: 'Corte Masculino', duration: 30 },
    { id: 'svc2', name: 'Barba', duration: 20 },
    { id: 'svc3', name: 'Sobrancelha', duration: 15 },
    { id: 'svc4', name: 'Manicure Simples', duration: 40 },
];
const mockAllProducts: ComboItem[] = [
    { id: 'prod1', name: 'Pomada Modeladora' },
    { id: 'prod2', name: 'Cera de Cabelo' },
    { id: 'prod3', name: 'Óleo para Barba' },
    { id: 'prod4', name: 'Shampoo Anticaspa' },
];

const mockServiceCombos: Combo[] = [
  { id: 's1', name: 'Combo VIP', type: 'service', items: [mockAllServices[0], mockAllServices[1]], price: 80, duration: 50, allow_discount: true, active: true },
  { id: 's2', name: 'Dia de Beleza', type: 'service', items: [mockAllServices[3], mockAllServices[2]], price: 40, duration: 55, allow_discount: true, active: false },
];

const mockProductCombos: Combo[] = [
  { id: 'p1', name: 'Kit Barba Perfeita', type: 'product', items: [mockAllProducts[2], mockAllProducts[0]], price: 60, allow_discount: true, active: true },
];

const defaultFormState: Partial<Combo> = {
  name: '',
  price: 0,
  items: [],
  allow_discount: true,
  active: true,
};

const Combos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'service' | 'product'>('service');
  const [serviceCombos, setServiceCombos] = useState<Combo[]>(mockServiceCombos);
  const [productCombos, setProductCombos] = useState<Combo[]>(mockProductCombos);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Combo | null>(null);
  const [formData, setFormData] = useState<Partial<Combo>>(defaultFormState);
  
  const { getLimit } = useSubscription();
  const { showConfirm, showAlert } = useModal();
  const limit = getLimit('combos');
  const currentCount = serviceCombos.length + productCombos.length;

  useEffect(() => {
    if (formData.type === 'service' && formData.items) {
      const totalDuration = formData.items.reduce((sum, item) => sum + (item.duration || 0), 0);
      setFormData(p => ({ ...p, duration: totalDuration }));
    }
  }, [formData.items, formData.type]);

  const openModal = (item: Combo | null = null) => {
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
    const comboType = formData.type;
    const list = comboType === 'service' ? serviceCombos : productCombos;
    const setList = comboType === 'service' ? setServiceCombos : setProductCombos;

    if (editingItem) {
      setList(list.map(c => c.id === editingItem.id ? { ...c, ...formData } as Combo : c));
    } else {
      setList([...list, { id: faker.string.uuid(), ...formData } as Combo]);
    }
    closeModal();
    showAlert({ title: 'Salvo!', message: 'Combo salvo com sucesso.', type: 'success' });
  };

  const handleDelete = (id: string, type: 'service' | 'product') => {
    showConfirm({
        title: 'Excluir Combo',
        message: 'Tem certeza que deseja excluir este combo?',
        type: 'warning',
        onConfirm: () => {
            if (type === 'service') {
                setServiceCombos(serviceCombos.filter(c => c.id !== id));
            } else {
                setProductCombos(productCombos.filter(c => c.id !== id));
            }
            showAlert({ title: 'Excluído', message: 'Combo excluído com sucesso.', type: 'success' });
        }
    });
  };
  
  const handleToggleStatus = (id: string, active: boolean, type: 'service' | 'product') => {
    const list = type === 'service' ? serviceCombos : productCombos;
    const setList = type === 'service' ? setServiceCombos : setProductCombos;
    setList(list.map(c => c.id === id ? { ...c, active } : c));
  };
  
  const handleItemChange = (item: ComboItem) => {
    const currentItems = formData.items || [];
    const newItems = currentItems.some(i => i.id === item.id)
      ? currentItems.filter(i => i.id !== item.id)
      : [...currentItems, item];
    setFormData(p => ({ ...p, items: newItems }));
  };

  const ComboTable: React.FC<{ combos: Combo[] }> = ({ combos }) => (
    <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 overflow-hidden">
      <table className="w-full text-left min-w-[640px]">
        <thead className="bg-light-200 dark:bg-dark-700">
          <tr>
            <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
            <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Itens</th>
            {activeTab === 'service' && <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Duração</th>}
            <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Preço</th>
            <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Status</th>
            <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {combos.map(item => (
            <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
              <td className="p-4 text-light-900 dark:text-dark-200">{item.name}</td>
              <td className="p-4 text-light-500 dark:text-dark-400 text-xs">{item.items.map(i => i.name).join(', ')}</td>
              {item.type === 'service' && <td className="p-4 text-light-500 dark:text-dark-400">{item.duration} min</td>}
              <td className="p-4 text-light-500 dark:text-dark-400">{formatCurrency(item.price)}</td>
              <td className="p-4 text-center">
                <ToggleSwitch checked={item.active} onChange={(checked) => handleToggleStatus(item.id, checked, item.type)} />
              </td>
              <td className="p-4">
                <div className="flex justify-center space-x-2">
                  <button onClick={() => openModal(item)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-blue-500 dark:hover:text-blue-400" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id, item.type)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderForm = () => {
    const type = formData.type;
    const availableItems = type === 'service' ? mockAllServices : mockAllProducts;
    const title = type === 'service' ? 'Serviços' : 'Produtos';

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome do Combo</label>
            <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Preço do Combo (R$)</label>
            <input type="number" step="0.01" value={formData.price || 0} onChange={e => setFormData(p => ({...p, price: Number(e.target.value)}))} className="w-full input-style" required />
          </div>
        </div>
        
        {type === 'service' && (
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Duração Total (minutos)</label>
            <input 
              type="number" 
              value={formData.duration || 0} 
              onChange={e => setFormData(p => ({...p, duration: Number(e.target.value)}))}
              className="w-full input-style"
            />
             <p className="text-xs text-light-500 dark:text-dark-400 mt-1">
              Calculado automaticamente, mas pode ser editado.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Itens do Combo ({title})</label>
          <div className="max-h-48 overflow-y-auto bg-light-200 dark:bg-dark-700 p-3 rounded-lg">
            {availableItems.map(item => (
              <label key={item.id} className="flex items-center space-x-2 cursor-pointer p-1">
                <input type="checkbox" checked={(formData.items || []).some(i => i.id === item.id)} onChange={() => handleItemChange(item)} className="rounded border-light-300 dark:border-dark-600 bg-light-50 dark:bg-dark-900 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-light-700 dark:text-dark-300">{item.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-light-700 dark:text-dark-300">Permitir Desconto</label>
          <ToggleSwitch checked={formData.allow_discount ?? true} onChange={checked => setFormData(p => ({...p, allow_discount: checked}))} />
        </div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-light-700 dark:text-dark-300">Ativo</label>
          <ToggleSwitch checked={formData.active ?? true} onChange={checked => setFormData(p => ({...p, active: checked}))} />
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            <Save className="w-5 h-5" />
            <span>Salvar</span>
          </button>
        </div>
      </form>
    );
  };

  return (
    <div>
      <PageHeader
        icon={Boxes}
        title="Cadastro de Combos"
        description="Crie pacotes de produtos e serviços"
        buttonLabel="Novo Combo"
        onButtonClick={() => openModal()}
        limit={limit}
        count={currentCount}
      />

      <div className="mb-6 border-b border-light-300 dark:border-dark-700">
        <nav className="flex space-x-4 -mb-px">
          <button onClick={() => setActiveTab('service')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'service' ? 'border-blue-500 text-blue-500 dark:text-blue-400' : 'border-transparent text-light-500 dark:text-dark-400 hover:text-light-800 dark:hover:text-white hover:border-light-400 dark:hover:border-dark-500'}`}>Combos de Serviços</button>
          <button onClick={() => setActiveTab('product')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'product' ? 'border-blue-500 text-blue-500 dark:text-blue-400' : 'border-transparent text-light-500 dark:text-dark-400 hover:text-light-800 dark:hover:text-white hover:border-light-400 dark:hover:border-dark-500'}`}>Combos de Produtos</button>
        </nav>
      </div>

      {activeTab === 'service' ? <ComboTable combos={serviceCombos} /> : <ComboTable combos={productCombos} />}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Combo' : 'Novo Combo'}>
        {!formData.type ? (
          <div className="space-y-4">
            <h3 className="text-center text-light-900 dark:text-white font-semibold">O que você deseja criar?</h3>
            <button onClick={() => setFormData(p => ({ ...p, type: 'service' }))} className="w-full flex flex-col items-center justify-center p-6 bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600 rounded-lg border border-light-300 dark:border-dark-600 transition-colors">
              <Scissors className="w-10 h-10 text-blue-500 dark:text-blue-400 mb-2" />
              <span className="text-lg font-semibold text-light-900 dark:text-white">Combo de Serviços</span>
            </button>
            <button onClick={() => setFormData(p => ({ ...p, type: 'product' }))} className="w-full flex flex-col items-center justify-center p-6 bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600 rounded-lg border border-light-300 dark:border-dark-600 transition-colors">
              <Package className="w-10 h-10 text-purple-500 dark:text-purple-400 mb-2" />
              <span className="text-lg font-semibold text-light-900 dark:text-white">Combo de Produtos</span>
            </button>
          </div>
        ) : renderForm()}
      </Modal>
    </div>
  );
};

export default Combos;
