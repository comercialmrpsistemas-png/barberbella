import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Package, Edit, Trash2, Save, Plus, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { formatCurrency } from '../../utils/formatters';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useModal } from '../../contexts/ModalContext';

interface Produto {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  active: boolean;
}

const generateMockProdutos = (count: number): Produto[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    stock: faker.number.int({ min: 0, max: 20 }),
    minStock: faker.number.int({ min: 5, max: 15 }),
    price: parseFloat(faker.commerce.price()),
    active: faker.datatype.boolean(),
  }));
};

const defaultFormState: Partial<Produto> = {
  name: '',
  stock: 0,
  minStock: 10,
  price: 0,
  active: true,
};

const Produtos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>(generateMockProdutos(8));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<Partial<Produto>>(defaultFormState);
  const { getLimit } = useSubscription();
  const { showConfirm, showAlert } = useModal();
  const limit = getLimit('produtos');
  
  // State for the "Add Stock" modal
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [productForStockAdd, setProductForStockAdd] = useState<Produto | null>(null);
  const [addStockQuantity, setAddStockQuantity] = useState('');

  const openModal = (item: Produto | null = null) => {
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
    showConfirm({
      title: editingItem ? 'Confirmar Alterações?' : 'Confirmar Cadastro?',
      message: (
        <div className="text-left text-sm space-y-1">
          <p><strong className="text-light-700 dark:text-dark-300">Nome:</strong> {formData.name}</p>
          <p><strong className="text-light-700 dark:text-dark-300">Estoque:</strong> {formData.stock}</p>
          <p><strong className="text-light-700 dark:text-dark-300">Preço:</strong> {formatCurrency(formData.price || 0)}</p>
        </div>
      ),
      type: 'confirmation',
      onConfirm: () => {
        if (editingItem) {
          setProdutos(produtos.map(p => p.id === editingItem.id ? { ...p, ...formData } as Produto : p));
        } else {
          setProdutos([...produtos, { id: faker.string.uuid(), ...formData } as Produto]);
        }
        closeModal();
        showAlert({ title: 'Salvo!', message: 'Produto salvo com sucesso.', type: 'success' });
      },
    });
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Excluir Produto',
      message: 'Tem certeza que deseja excluir este produto?',
      type: 'warning',
      onConfirm: () => {
        setProdutos(produtos.filter(p => p.id !== id));
        showAlert({ title: 'Excluído', message: 'Produto excluído com sucesso.', type: 'success' });
      }
    });
  };
  
  const handleToggleStatus = (id: string, active: boolean) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, active } : p));
  };
  
  // Opens the dedicated modal for adding stock
  const handleAddStock = (product: Produto) => {
    setProductForStockAdd(product);
    setAddStockQuantity('');
    setIsAddStockModalOpen(true);
  };

  // Confirms and processes the stock addition
  const handleConfirmAddStock = () => {
    if (!productForStockAdd) return;

    const quantity = parseInt(addStockQuantity, 10);
    if (!isNaN(quantity) && quantity > 0) {
      setProdutos(produtos.map(p => 
        p.id === productForStockAdd.id 
        ? { ...p, stock: p.stock + quantity } 
        : p
      ));
      showAlert({ title: 'Sucesso!', message: `Estoque de "${productForStockAdd.name}" atualizado.`, type: 'success' });
      setIsAddStockModalOpen(false);
      setProductForStockAdd(null);
    } else {
      showAlert({ title: 'Erro', message: 'Por favor, insira uma quantidade válida.', type: 'error' });
    }
  };

  return (
    <div>
      <PageHeader
        icon={Package}
        title="Cadastro de Produtos"
        description="Gerencie os produtos para venda e uso"
        buttonLabel="Novo Produto"
        onButtonClick={() => openModal()}
        limit={limit}
        count={produtos.length}
      />

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 overflow-hidden">
        <table className="w-full text-left min-w-[720px]">
          <thead className="bg-light-200 dark:bg-dark-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Estoque</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Estoque Mínimo</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Preço</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Status</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(item => (
              <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                <td className="p-4 text-light-900 dark:text-dark-200">{item.name}</td>
                <td className={`p-4 font-medium ${item.stock <= item.minStock ? 'text-red-500 dark:text-red-400' : 'text-light-500 dark:text-dark-400'}`}>
                  <div className="flex items-center space-x-2">
                    <span>{item.stock}</span>
                    {item.stock <= item.minStock && <AlertTriangle className="w-4 h-4 text-yellow-500" title="Estoque baixo!" />}
                  </div>
                </td>
                <td className="p-4 text-light-500 dark:text-dark-400">{item.minStock}</td>
                <td className="p-4 text-light-500 dark:text-dark-400">{formatCurrency(item.price)}</td>
                <td className="p-4 text-center">
                  <ToggleSwitch 
                    checked={item.active}
                    onChange={(checked) => handleToggleStatus(item.id, checked)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => handleAddStock(item)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-green-500 dark:hover:text-green-400" title="Adicionar Estoque">
                      <Plus className="w-4 h-4" />
                    </button>
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Produto' : 'Novo Produto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome</label>
            <input type="text" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Estoque Atual</label>
              <input type="number" value={formData.stock || 0} onChange={e => setFormData(p => ({...p, stock: Number(e.target.value)}))} className="w-full input-style" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Estoque Mínimo</label>
              <input type="number" value={formData.minStock || 0} onChange={e => setFormData(p => ({...p, minStock: Number(e.target.value)}))} className="w-full input-style" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Preço (R$)</label>
              <input type="number" step="0.01" value={formData.price || 0} onChange={e => setFormData(p => ({...p, price: Number(e.target.value)}))} className="w-full input-style" required />
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

      {/* Modal for adding stock */}
      <Modal 
        isOpen={isAddStockModalOpen} 
        onClose={() => setIsAddStockModalOpen(false)} 
        title={`Adicionar Estoque para "${productForStockAdd?.name}"`}
      >
        <div className="space-y-4">
          <p className="text-sm text-light-500 dark:text-dark-400">Estoque atual: {productForStockAdd?.stock}</p>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
              Quantidade a adicionar
            </label>
            <input
              type="number"
              value={addStockQuantity}
              onChange={(e) => setAddStockQuantity(e.target.value)}
              className="w-full input-style"
              placeholder="Ex: 10"
              autoFocus
            />
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={handleConfirmAddStock} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              <Save className="w-5 h-5" />
              <span>Confirmar</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Produtos;
