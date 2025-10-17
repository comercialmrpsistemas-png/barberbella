import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, ShoppingCart, Scissors, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sale } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { useAuth } from '../../contexts/AuthContext';

const MeuHistorico: React.FC = () => {
  const { user, sales, funcionarios } = useAuth();
  const [activeTab, setActiveTab] = useState<'compras' | 'servicos'>('compras');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const clientSales = useMemo(() => {
    if (!user) return [];
    return sales
      .filter(sale => sale.client_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [sales, user]);

  const clientServices = useMemo(() => {
    const services: { id: string, date: string, service: string, employee: string, value: number }[] = [];
    clientSales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.type === 'service') {
          const employeeName = funcionarios.find(f => f.id === item.employeeId)?.name || 'Profissional';
          services.push({
            id: `${sale.id}-${item.id}`,
            date: sale.created_at,
            service: item.name,
            employee: employeeName,
            value: item.price,
          });
        }
      });
    });
    return services;
  }, [clientSales, funcionarios]);

  const renderCompras = () => (
    <div className="space-y-4">
      {clientSales.map((sale, index) => (
        <motion.div
          key={sale.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-light-100 dark:bg-dark-800 p-4 rounded-xl border border-light-200 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex-1 mb-4 sm:mb-0">
            <p className="font-bold text-lg text-light-900 dark:text-white">Compra #{sale.id.substring(0, 8)}</p>
            <p className="text-sm text-light-500 dark:text-dark-400">
              {sale.items.map(item => item.name).join(', ')}
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end sm:space-x-8">
            <div className="text-sm text-center sm:text-left">
              <p className="text-light-700 dark:text-dark-300 capitalize">{format(new Date(sale.created_at), "dd 'de' MMMM", { locale: ptBR })}</p>
              <p className="font-bold text-lg text-green-500 dark:text-green-400">{formatCurrency(sale.total)}</p>
            </div>
            <button onClick={() => setSelectedSale(sale)} className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-900">
              <Eye size={16}/>
              <span>Ver</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderServicos = () => (
    <div className="space-y-4">
      {clientServices.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-light-100 dark:bg-dark-800 p-4 rounded-xl border border-light-200 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex-1 mb-4 sm:mb-0">
            <p className="font-bold text-lg text-light-900 dark:text-white">{item.service}</p>
            <p className="text-sm text-light-500 dark:text-dark-400">com {item.employee}</p>
          </div>
          <div className="text-sm text-left sm:text-right">
            <p className="font-semibold text-green-500 dark:text-green-400">{formatCurrency(item.value)}</p>
            <p className="text-light-700 dark:text-dark-300 capitalize">{format(new Date(item.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <History className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-white">Meu Histórico</h1>
          <p className="text-light-500 dark:text-dark-400">Consulte suas compras e serviços realizados</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-light-100 dark:bg-dark-800 p-2 rounded-xl border border-light-200 dark:border-dark-700">
        <button
          onClick={() => setActiveTab('compras')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'compras' ? 'bg-blue-600 text-white shadow' : 'text-light-600 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700'}`}
        >
          <ShoppingCart size={16}/>
          <span>Minhas Compras</span>
        </button>
        <button
          onClick={() => setActiveTab('servicos')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'servicos' ? 'bg-blue-600 text-white shadow' : 'text-light-600 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700'}`}
        >
          <Scissors size={16}/>
          <span>Serviços Realizados</span>
        </button>
      </div>

      {activeTab === 'compras' ? renderCompras() : renderServicos()}

      <ReceiptModal 
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        sale={selectedSale}
        context="history"
      />
    </div>
  );
};

export default MeuHistorico;
