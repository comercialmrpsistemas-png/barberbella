import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';

const AniversariantesConfig: React.FC = () => {
  const { vouchers, birthdayConfig, updateBirthdayConfig, company } = useAuth();
  const { showAlert } = useModal();
  const [message, setMessage] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessage(birthdayConfig.message);
    setSelectedVoucher(birthdayConfig.voucherId);
  }, [birthdayConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateBirthdayConfig({ message, voucherId: selectedVoucher });
      showAlert({ title: 'Sucesso!', message: 'Configurações de aniversário salvas com sucesso!', type: 'success' });
      setLoading(false);
    }, 1000);
  };

  const finalMessagePreview = () => {
    if (!company) return message;
    let preview = message
      .replace('{empresa}', company.name)
      .replace('{cliente}', 'Fulano');
    
    const voucher = vouchers.find(v => v.id === selectedVoucher);
    if (voucher) {
      preview += `\n\nUse o código *${voucher.code}* para resgatar seu presente!`;
    }
    return preview;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Gift className="w-8 h-8 text-pink-500 dark:text-pink-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Mensagem de Aniversário</h1>
          <p className="text-light-500 dark:text-dark-400">Configure a mensagem e o voucher para os aniversariantes do mês.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
              Mensagem Padrão
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full input-style"
              rows={4}
              placeholder="Ex: A {empresa} te deseja um feliz aniversário, {cliente}!"
            />
            <p className="text-xs text-light-500 dark:text-dark-400 mt-1">
              Use <code className="bg-light-200 dark:bg-dark-700 px-1 rounded">{'{empresa}'}</code> para o nome da empresa e <code className="bg-light-200 dark:bg-dark-700 px-1 rounded">{'{cliente}'}</code> para o nome do cliente.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
              Voucher de Aniversário (Opcional)
            </label>
            <select
              value={selectedVoucher || ''}
              onChange={(e) => setSelectedVoucher(e.target.value || null)}
              className="w-full input-style"
            >
              <option value="">Nenhum voucher</option>
              {vouchers.filter(v => v.eligibility === 'birthday_month').map(voucher => (
                <option key={voucher.id} value={voucher.id}>
                  {voucher.name} - {voucher.code}
                </option>
              ))}
            </select>
            <p className="text-xs text-light-500 dark:text-dark-400 mt-1">
              Apenas vouchers com a regra "Aniversariante do Mês" são listados.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-light-300 dark:border-dark-600">
            <h4 className="text-sm font-semibold text-light-800 dark:text-dark-200 mb-2">Pré-visualização da Mensagem:</h4>
            <div className="p-3 bg-light-200 dark:bg-dark-700 rounded-lg text-sm text-light-700 dark:text-dark-300 whitespace-pre-wrap">
              {finalMessagePreview()}
            </div>
          </div>

        </motion.div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AniversariantesConfig;
