import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

interface CashOperationModalProps {
  type: 'sangria' | 'suprimento';
  isOpen: boolean;
  onClose: () => void;
}

const CashOperationModal: React.FC<CashOperationModalProps> = ({ type, isOpen, onClose }) => {
  const { showAlert } = useModal();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const config = {
    sangria: {
      title: 'Sangria de Caixa',
      description: 'Retirada de valor do caixa.',
      icon: ArrowDown,
      color: 'red',
    },
    suprimento: {
      title: 'Suprimento de Caixa',
      description: 'Adição de valor ao caixa.',
      icon: ArrowUp,
      color: 'green',
    },
  };

  const { title, description, icon: Icon, color } = config[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showAlert({ title: 'Erro', message: 'Por favor, insira um valor válido.', type: 'error' });
      return;
    }
    showAlert({ title: 'Sucesso', message: `${title} de R$ ${amount} registrada com sucesso.`, type: 'success' });
    onClose();
    setAmount('');
    setReason('');
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
        className="bg-light-100 dark:bg-dark-800 rounded-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-light-300 dark:border-dark-700 flex justify-between items-center">
          <h2 className={`font-semibold text-lg text-light-900 dark:text-white flex items-center gap-2`}>
            <Icon className={`w-6 h-6 text-${color}-500`} />
            {title}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-700"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-light-500 dark:text-dark-400">{description}</p>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Valor (R$)</label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-400 dark:text-dark-500"/>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full input-style pl-10"
                    required
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Motivo (Opcional)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="w-full input-style"
              placeholder="Ex: Pagamento de fornecedor"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className={`w-full py-3 bg-${color}-600 text-white font-bold rounded-lg hover:bg-${color}-700 transition-colors`}
            >
              Confirmar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CashOperationModal;
