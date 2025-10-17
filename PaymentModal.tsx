import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { useModal } from '../../contexts/ModalContext';

interface PaymentModalProps {
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onCompleteSale: (payments: { method: string; amount: number }[]) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, isOpen, onClose, onCompleteSale }) => {
  const { formasPagamento } = useAuth();
  const { showAlert } = useModal();
  const [payments, setPayments] = useState<{ method: string; amount: number }[]>([]);
  
  const activePaymentMethods = useMemo(() => formasPagamento.filter(f => f.active), [formasPagamento]);
  const [currentPayment, setCurrentPayment] = useState({ method: activePaymentMethods[0]?.name || 'Dinheiro', amount: '' });

  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const remaining = useMemo(() => total - totalPaid, [total, totalPaid]);

  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      const firstActiveMethod = activePaymentMethods[0]?.name || 'Dinheiro';
      setCurrentPayment({ method: firstActiveMethod, amount: total > 0 ? total.toFixed(2) : '' });
    }
  }, [isOpen, total, activePaymentMethods]);

  useEffect(() => {
     setCurrentPayment(prev => ({ ...prev, amount: remaining > 0 ? remaining.toFixed(2) : '' }));
  }, [remaining]);


  const handleAddPayment = () => {
    const amount = parseFloat(currentPayment.amount);
    if (isNaN(amount) || amount <= 0) return;

    setPayments([...payments, { method: currentPayment.method, amount }]);
  };
  
  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleQuickPay = (method: string) => {
    if (remaining <= 0 && payments.length > 0) {
        onCompleteSale(payments);
        return;
    };
    const finalPayments = [...payments, { method, amount: remaining }];
    onCompleteSale(finalPayments);
  };

  const handleFinalize = () => {
    let finalPayments = [...payments];
    const currentAmount = parseFloat(currentPayment.amount);

    if (!isNaN(currentAmount) && currentAmount > 0) {
      finalPayments.push({ method: currentPayment.method, amount: currentAmount });
    }
    
    const finalTotalPaid = finalPayments.reduce((sum, p) => sum + p.amount, 0);

    if (finalTotalPaid < total) {
      showAlert({
        title: 'Valor Insuficiente',
        message: `O valor pago (${formatCurrency(finalTotalPaid)}) é menor que o total da venda (${formatCurrency(total)}).`,
        type: 'error',
      });
      return;
    }

    onCompleteSale(finalPayments);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-light-100 dark:bg-dark-800 rounded-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-light-300 dark:border-dark-700 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-light-900 dark:text-white flex items-center gap-2"><DollarSign className="w-6 h-6 text-green-500"/>Pagamento</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-700"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-light-500 dark:text-dark-400">Total da Venda</p>
            <p className="text-4xl font-bold text-green-500 dark:text-green-400">{formatCurrency(total)}</p>
          </div>

          <div className="space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-light-200 dark:bg-dark-700 p-2 rounded-lg">
                <p className="text-sm text-light-800 dark:text-white">{p.method}</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-light-900 dark:text-white">{formatCurrency(p.amount)}</p>
                  <button onClick={() => handleRemovePayment(i)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-light-50 dark:bg-dark-900/50 p-3 rounded-lg space-y-2">
            <p className="text-sm font-medium text-center text-light-700 dark:text-dark-300">Adicionar Pagamento</p>
            <div className="flex gap-2">
              <select 
                value={currentPayment.method}
                onChange={e => setCurrentPayment(p => ({...p, method: e.target.value}))}
                className="input-style py-2"
              >
                {activePaymentMethods.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
              </select>
              <input
                type="number"
                value={currentPayment.amount}
                onChange={e => setCurrentPayment(p => ({...p, amount: e.target.value}))}
                placeholder="Valor"
                className="input-style py-2 w-32"
              />
              <button onClick={handleAddPayment} className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"><Plus className="w-5 h-5"/></button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activePaymentMethods.map(forma => (
                <button 
                    key={forma.id}
                    onClick={() => handleQuickPay(forma.name)} 
                    className="py-2 px-3 text-sm bg-light-200 dark:bg-dark-700 rounded-lg hover:bg-light-300 dark:hover:bg-dark-600 truncate text-light-800 dark:text-dark-200"
                    title={`Pagar ${formatCurrency(remaining)} com ${forma.name}`}
                >
                    {forma.name}
                </button>
              ))}
          </div>
          
          <div className="text-center pt-2">
            <p className={`text-lg font-bold ${remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {remaining > 0 ? `Faltam: ${formatCurrency(remaining)}` : `Troco: ${formatCurrency(Math.abs(remaining))}`}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-light-300 dark:border-dark-700">
          <button
            onClick={handleFinalize}
            disabled={remaining > 0 && !currentPayment.amount}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            Confirmar Pagamento
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;
