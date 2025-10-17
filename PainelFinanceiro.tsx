import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, BarChart2, PlusCircle, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useModal } from '../../contexts/ModalContext';

const PainelFinanceiro: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showAlert } = useModal();
  const [isReceitaModalOpen, setIsReceitaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const openReceitaModal = () => {
    setFormData({ description: '', amount: 0, status: 'Pendente', type: 'Única', dueDate: new Date(), recurrenceMonths: 1 });
    setIsReceitaModalOpen(true);
  };

  const openDespesaModal = () => {
    setFormData({ description: '', amount: 0, status: 'Pendente', type: 'Única', dueDate: new Date(), recurrenceMonths: 1 });
    setIsDespesaModalOpen(true);
  };

  const handleSubmit = (type: 'receita' | 'despesa') => (e: React.FormEvent) => {
    e.preventDefault();
    showAlert({
      title: 'Sucesso!',
      message: `Nova ${type} adicionada com sucesso!`,
      type: 'success'
    });
    if (type === 'receita') setIsReceitaModalOpen(false);
    else setIsDespesaModalOpen(false);
  };

  const summaryCards = [
    { title: 'Contas a Receber (Mês)', value: 7500.50, icon: ArrowUpCircle, color: 'text-green-500' },
    { title: 'Contas a Pagar (Mês)', value: 3250.00, icon: ArrowDownCircle, color: 'text-red-500' },
    { title: 'Saldo Previsto (Mês)', value: 4250.50, icon: DollarSign, color: 'text-blue-500' },
  ];

  const cashFlowOption = {
    backgroundColor: 'transparent',
    title: { text: 'Fluxo de Caixa (Últimos 30 dias)', textStyle: { color: theme === 'dark' ? '#f3f4f6' : '#1f2937', fontSize: 16 } },
    tooltip: { trigger: 'axis', backgroundColor: theme === 'dark' ? '#374151' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb', textStyle: { color: theme === 'dark' ? '#f3f4f6' : '#1f2937' } },
    legend: { data: ['Receitas', 'Despesas'], textStyle: { color: theme === 'dark' ? '#9ca3af' : '#4b5563' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: Array.from({ length: 7 }, (_, i) => `Semana ${i + 1}`), axisLabel: { color: theme === 'dark' ? '#9ca3af' : '#4b5563' } },
    yAxis: { type: 'value', axisLabel: { color: theme === 'dark' ? '#9ca3af' : '#4b5563', formatter: 'R$ {value}' }, splitLine: { lineStyle: { color: theme === 'dark' ? '#374151' : '#e5e7eb' } } },
    series: [
      { name: 'Receitas', type: 'line', smooth: true, data: [1200, 1800, 1500, 2200, 2000, 2500, 2800], lineStyle: { color: '#22c55e' }, itemStyle: { color: '#22c55e' } },
      { name: 'Despesas', type: 'line', smooth: true, data: [800, 900, 1100, 1000, 1300, 1200, 1500], lineStyle: { color: '#ef4444' }, itemStyle: { color: '#ef4444' } }
    ]
  };
  
  const renderModalForm = (type: 'receita' | 'despesa') => (
    <form onSubmit={handleSubmit(type)} className="space-y-4">
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
          <input type="date" value={formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : ''} onChange={e => setFormData(p => ({...p, dueDate: new Date(e.target.value)}))} className="w-full input-style" required />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" checked={formData.type === 'Recorrente'} onChange={e => setFormData(p => ({...p, type: e.target.checked ? 'Recorrente' : 'Única'}))} className="rounded border-light-300 dark:border-dark-600 bg-light-200 dark:bg-dark-900 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm text-light-700 dark:text-dark-300">{type === 'receita' ? 'Receita' : 'Despesa'} Recorrente</span>
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
            <p className="text-xs text-light-500 dark:text-dark-500 mt-1">A {type} será criada para o mesmo dia nos próximos meses.</p>
          </div>
        </motion.div>
      )}
      <div className="flex justify-end pt-4">
        <button type="submit" className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
          <Save className="w-5 h-5" />
          <span>Salvar</span>
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BarChart2 className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-white">Painel Financeiro</h1>
          <p className="text-light-500 dark:text-dark-400">Visão geral da saúde financeira da sua empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-200 dark:border-dark-700"
          >
            <div className="flex items-center space-x-4">
              <card.icon className={`w-8 h-8 ${card.color}`} />
              <div>
                <p className="text-light-500 dark:text-dark-400 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-light-900 dark:text-white mt-1">{formatCurrency(card.value)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-200 dark:border-dark-700"
        >
          <ReactECharts option={cashFlowOption} style={{ height: '350px' }} key={theme} />
        </motion.div>
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-200 dark:border-dark-700"
          >
            <h3 className="text-lg font-semibold text-light-900 dark:text-white mb-4">Acessos Rápidos</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/financeiro/receber')} className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-light-200 dark:hover:bg-dark-700 transition-colors">
                <ArrowUpCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-light-800 dark:text-white">Contas a Receber</p>
                  <p className="text-sm text-light-500 dark:text-dark-400">Ver e gerenciar recebimentos</p>
                </div>
              </button>
              <button onClick={() => navigate('/financeiro/pagar')} className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-light-200 dark:hover:bg-dark-700 transition-colors">
                <ArrowDownCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-semibold text-light-800 dark:text-white">Contas a Pagar</p>
                  <p className="text-sm text-light-500 dark:text-dark-400">Ver e gerenciar despesas</p>
                </div>
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-200 dark:border-dark-700"
          >
            <h3 className="text-lg font-semibold text-light-900 dark:text-white mb-4">Lançamentos</h3>
            <div className="space-y-3">
               <button onClick={openReceitaModal} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 dark:bg-green-600/20 hover:bg-green-200 dark:hover:bg-green-600/30 text-green-700 dark:text-green-300 font-semibold rounded-lg transition-colors">
                <PlusCircle className="w-5 h-5" />
                <span>Adicionar Receita</span>
              </button>
              <button onClick={openDespesaModal} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 dark:bg-red-600/20 hover:bg-red-200 dark:hover:bg-red-600/30 text-red-700 dark:text-red-300 font-semibold rounded-lg transition-colors">
                <PlusCircle className="w-5 h-5" />
                <span>Adicionar Despesa</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Modal isOpen={isReceitaModalOpen} onClose={() => setIsReceitaModalOpen(false)} title="Nova Receita">
        {renderModalForm('receita')}
      </Modal>

      <Modal isOpen={isDespesaModalOpen} onClose={() => setIsDespesaModalOpen(false)} title="Nova Despesa">
        {renderModalForm('despesa')}
      </Modal>
    </div>
  );
};

export default PainelFinanceiro;
