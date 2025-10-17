import React, { useState, useMemo } from 'react';
import { faker } from '@faker-js/faker';
import { ArrowDownCircle, Edit, Trash2, Save, CheckCircle, Filter, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { format, parseISO } from 'date-fns';
import DateRangePicker from '../../components/common/DateRangePicker';
import { motion } from 'framer-motion';
import BackButton from '../../components/common/BackButton';
import { useModal } from '../../contexts/ModalContext';

interface Conta {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: 'Pendente' | 'Paga';
  type: 'Única' | 'Recorrente';
  recurrenceMonths?: number;
  paymentDate?: string;
  paymentMethod?: string;
}

const generateMockContas = (count: number): Conta[] => {
  return Array.from({ length: count }, () => {
    const status = faker.helpers.arrayElement(['Pendente', 'Paga']);
    return {
      id: faker.string.uuid(),
      description: faker.finance.transactionDescription(),
      amount: parseFloat(faker.finance.amount(50, 1000)),
      dueDate: faker.date.between({ from: new Date(2025, 0, 1), to: new Date(2025, 2, 31) }),
      status: status,
      type: faker.helpers.arrayElement(['Única', 'Recorrente']),
      paymentDate: status === 'Paga' ? format(faker.date.recent(), 'yyyy-MM-dd') : undefined,
      paymentMethod: status === 'Paga' ? faker.helpers.arrayElement(['Pix', 'Boleto']) : undefined,
    };
  }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};

const mockFormasPagamento = ['Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto'];

const defaultFormState: Partial<Conta> = {
  description: '',
  amount: 0,
  status: 'Pendente',
  type: 'Única',
  dueDate: new Date(),
  recurrenceMonths: 1,
};

const ContasPagar: React.FC = () => {
  const [contas, setContas] = useState<Conta[]>(generateMockContas(15));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);
  const [formData, setFormData] = useState<Partial<Conta>>(defaultFormState);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmingConta, setConfirmingConta] = useState<Conta | null>(null);
  const [paymentInfo, setPaymentInfo] = useState({ date: format(new Date(), 'yyyy-MM-dd'), method: mockFormasPagamento[0] });

  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: 'todos' });
  const { showAlert, showConfirm } = useModal();

  const filteredContas = useMemo(() => {
    return contas.filter(conta => {
      if (filters.status !== 'todos' && conta.status.toLowerCase() !== filters.status) {
        return false;
      }
      const dueDate = new Date(conta.dueDate);
      if (filters.startDate && dueDate < new Date(filters.startDate + 'T00:00:00')) {
        return false;
      }
      if (filters.endDate && dueDate > new Date(filters.endDate + 'T23:59:59')) {
        return false;
      }
      return true;
    });
  }, [contas, filters]);

  const openModal = (conta: Conta | null = null) => {
    setEditingConta(conta);
    setFormData(conta ? { ...defaultFormState, ...conta } : defaultFormState);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingConta(null);
    setFormData(defaultFormState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConta) {
      setContas(contas.map(c => c.id === editingConta.id ? { ...c, ...formData } as Conta : c));
      showAlert({ title: 'Sucesso', message: 'Conta atualizada com sucesso!', type: 'success' });
    } else {
      setContas([...contas, { id: faker.string.uuid(), ...formData, dueDate: formData.dueDate || new Date() } as Conta]);
      showAlert({ title: 'Sucesso', message: 'Nova despesa adicionada!', type: 'success' });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Excluir Conta',
      message: 'Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.',
      type: 'warning',
      onConfirm: () => {
        setContas(contas.filter(c => c.id !== id));
        showAlert({ title: 'Excluído', message: 'A conta foi excluída com sucesso.', type: 'success' });
      }
    });
  };

  const openConfirmModal = (conta: Conta) => {
    setConfirmingConta(conta);
    setPaymentInfo({ date: format(new Date(), 'yyyy-MM-dd'), method: mockFormasPagamento[0] });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!confirmingConta) return;
    setContas(contas.map(c => 
      c.id === confirmingConta.id 
      ? { ...c, status: 'Paga', paymentDate: paymentInfo.date, paymentMethod: paymentInfo.method } 
      : c
    ));
    setIsConfirmModalOpen(false);
    setConfirmingConta(null);
    showAlert({ title: 'Sucesso', message: 'Pagamento confirmado com sucesso!', type: 'success' });
  };
  
  const handleRevertPayment = () => {
    if (!editingConta) return;
    showConfirm({
      title: 'Reverter Pagamento?',
      message: 'Tem certeza que deseja reverter este pagamento? A conta voltará ao status "Pendente".',
      type: 'warning',
      onConfirm: () => {
        setContas(contas.map(c => 
          c.id === editingConta.id 
          ? { ...c, status: 'Pendente', paymentDate: undefined, paymentMethod: undefined } 
          : c
        ));
        closeModal();
        showAlert({ title: 'Sucesso', message: 'Pagamento revertido com sucesso.', type: 'success' });
      }
    });
  };

  return (
    <div>
      <div className="mb-4">
        <BackButton to="/financeiro" />
      </div>
      <PageHeader
        icon={ArrowDownCircle}
        title="Contas a Pagar"
        description="Gerencie suas despesas e pagamentos"
        buttonLabel="Nova Despesa"
        onButtonClick={() => openModal()}
      />

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 mb-6">
        <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <DateRangePicker 
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(d) => setFilters(p => ({...p, startDate: d}))}
            onEndDateChange={(d) => setFilters(p => ({...p, endDate: d}))}
          />
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="paga">Paga</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-300 dark:border-dark-600 overflow-hidden">
        <table className="w-full text-left min-w-[720px]">
          <thead className="bg-light-200 dark:bg-dark-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Descrição</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Vencimento</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Valor</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300">Status</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Pagar</th>
              <th className="p-4 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredContas.map(conta => (
              <tr key={conta.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                <td className="p-4 text-light-900 dark:text-dark-200">{conta.description}</td>
                <td className="p-4 text-light-500 dark:text-dark-400">{format(conta.dueDate, 'dd/MM/yyyy')}</td>
                <td className="p-4 text-red-500 dark:text-red-400 font-medium">{formatCurrency(conta.amount)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${conta.status === 'Paga' ? 'bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-600/20 text-yellow-800 dark:text-yellow-400'}`}>
                    {conta.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {conta.status === 'Pendente' ? (
                    <button 
                      onClick={() => openConfirmModal(conta)} 
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Pagar
                    </button>
                  ) : (
                    <span className="text-light-500 dark:text-dark-500 text-xs italic">Pago</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => openModal(conta)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-blue-500 dark:hover:text-blue-400" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(conta.id)} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingConta ? 'Editar Despesa' : 'Nova Despesa'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Descrição</label>
            <input type="text" value={formData.description || ''} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="w-full input-style" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Valor (R$)</label>
              <input type="number" step="0.01" value={formData.amount || 0} onChange={e => setFormData(p => ({...p, amount: Number(e.target.value)}))} className="w-full input-style" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Data de Vencimento</label>
              <input type="date" value={formData.dueDate ? format(parseISO(formData.dueDate.toISOString()), 'yyyy-MM-dd') : ''} onChange={e => setFormData(p => ({...p, dueDate: new Date(e.target.value + 'T00:00:00')}))} className="w-full input-style" required />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={formData.type === 'Recorrente'} onChange={e => setFormData(p => ({...p, type: e.target.checked ? 'Recorrente' : 'Única'}))} className="rounded border-light-300 dark:border-dark-600 bg-light-200 dark:bg-dark-900 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-light-700 dark:text-dark-300">Despesa Recorrente</span>
            </label>
          </div>
           {formData.type === 'Recorrente' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Repetir por (meses)</label>
                <input type="number" min="1" value={formData.recurrenceMonths || 1} onChange={e => setFormData(p => ({...p, recurrenceMonths: Number(e.target.value)}))} className="w-full input-style" />
                <p className="text-xs text-light-500 dark:text-dark-500 mt-1">A despesa será criada para o mesmo dia nos próximos meses.</p>
              </div>
            </motion.div>
          )}
          <div className="flex justify-between items-center pt-4">
            {editingConta && editingConta.status === 'Paga' && (
              <button
                type="button"
                onClick={handleRevertPayment}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-600/20 hover:bg-yellow-200 dark:hover:bg-yellow-600/30 text-yellow-800 dark:text-yellow-300 font-semibold rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reverter Pagamento</span>
              </button>
            )}
            <button type="submit" className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors ml-auto">
              <Save className="w-5 h-5" />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Pagamento">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Data do Pagamento</label>
            <input type="date" value={paymentInfo.date} onChange={e => setPaymentInfo(p => ({...p, date: e.target.value}))} className="w-full input-style" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Forma de Pagamento</label>
            <select value={paymentInfo.method} onChange={e => setPaymentInfo(p => ({...p, method: e.target.value}))} className="w-full input-style">
              {mockFormasPagamento.map(method => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={handleConfirmPayment} className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
              <CheckCircle className="w-5 h-5" />
              <span>Confirmar</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContasPagar;
