import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid,
  CalendarPlus,
  DollarSign,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  X,
  ShoppingCart
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const QuickActionButton: React.FC<{ icon: React.ElementType; title: string; path: string; delay: number }> = ({ icon: Icon, title, path, delay }) => {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate(path)}
      className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700 text-center hover:bg-light-200 dark:hover:bg-dark-700 hover:border-blue-500 transition-all duration-300 h-full flex flex-col items-center justify-center"
    >
      <Icon className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-light-800 dark:text-white">{title}</h3>
    </motion.button>
  );
};

const SalesCard: React.FC<{ title: string; value: number; change: number; delay: number }> = ({ title, value, change, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-light-100 dark:bg-dark-800 p-4 rounded-xl border border-light-200 dark:border-dark-700"
  >
    <p className="text-sm text-light-500 dark:text-dark-400">{title}</p>
    <p className="text-2xl font-bold text-light-800 dark:text-white mt-1">{formatCurrency(value)}</p>
    <div className={`flex items-center text-xs mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
      {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
      <span>{change}%</span>
    </div>
  </motion.div>
);

const TopItemsList: React.FC<{ title: string; icon: React.ElementType; data: { name: string; sales: number }[]; activePeriod: 'week' | 'month'; onPeriodChange: (period: 'week' | 'month') => void; delay: number }> = ({ title, icon: Icon, data, activePeriod, onPeriodChange, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700"
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-light-800 dark:text-white flex items-center">
        <Icon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
        {title}
      </h3>
      <div className="flex items-center bg-light-200 dark:bg-dark-700 rounded-lg p-1">
        <button onClick={() => onPeriodChange('week')} className={`px-3 py-1 text-xs rounded-md transition-colors ${activePeriod === 'week' ? 'bg-blue-600 text-white' : 'text-light-600 dark:text-dark-300'}`}>Semana</button>
        <button onClick={() => onPeriodChange('month')} className={`px-3 py-1 text-xs rounded-md transition-colors ${activePeriod === 'month' ? 'bg-blue-600 text-white' : 'text-light-600 dark:text-dark-300'}`}>Mês</button>
      </div>
    </div>
    <ol className="space-y-3">
      {data.map((item, index) => (
        <li key={index} className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="text-light-400 dark:text-dark-500 font-bold w-6">{index + 1}.</span>
            <span className="text-light-700 dark:text-dark-200">{item.name}</span>
          </div>
          <span className="font-semibold text-light-800 dark:text-white">{item.sales} vendas</span>
        </li>
      ))}
    </ol>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { produtos } = useAuth();
  const { addNotification } = useNotification();
  const [topServicesPeriod, setTopServicesPeriod] = useState<'week' | 'month'>('week');
  const [topProductsPeriod, setTopProductsPeriod] = useState<'week' | 'month'>('week');
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);

  const lowStockProducts = useMemo(() => produtos.filter(p => p.stock <= p.minStock), [produtos]);

  useEffect(() => {
    const timer = setTimeout(() => {
        addNotification({
            title: 'Novo Agendamento!',
            message: 'Cliente "Carlos Silva" agendou um Corte para as 14:30.'
        });
    }, 5000);

    return () => clearTimeout(timer);
  }, [addNotification]);

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showLowStockAlert && lowStockProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-r-lg flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="font-bold">Estoque Baixo!</h3>
                <p className="text-sm">{lowStockProducts.length} {lowStockProducts.length === 1 ? 'produto está' : 'produtos estão'} com estoque baixo ou zerado.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/cadastros/produtos" className="text-sm font-semibold hover:underline">
                Ver Produtos
              </Link>
              <button onClick={() => setShowLowStockAlert(false)} className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-500/20">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-xl font-bold text-light-800 dark:text-white mb-4">Atalhos Principais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickActionButton icon={LayoutGrid} title="Painel de Agendamentos" path="/agendamentos" delay={0.1} />
          <QuickActionButton icon={CalendarPlus} title="Novo Agendamento" path="/agendamentos/novo" delay={0.2} />
          <QuickActionButton icon={ShoppingCart} title="Vendas / PDV" path="/vendas" delay={0.3} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-light-800 dark:text-white mb-4 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-green-500" />
          Painel de Vendas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SalesCard title="Vendas do Dia" value={1250.75} change={12} delay={0.4} />
          <SalesCard title="Vendas da Semana" value={6380.20} change={5} delay={0.5} />
          <SalesCard title="Vendas do Mês" value={21750.90} change={-2} delay={0.6} />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-light-800 dark:text-white mb-4 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-purple-500" />
          Vendas de Serviços
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SalesCard title="Serviços do Dia" value={980.00} change={15} delay={0.7} />
          <SalesCard title="Serviços da Semana" value={4950.00} change={8} delay={0.8} />
          <SalesCard title="Serviços do Mês" value={17500.00} change={3} delay={0.9} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopItemsList 
          title="Serviços Mais Vendidos"
          icon={Award}
          data={[{name: 'Corte', sales: 25}, {name: 'Barba', sales: 18}, {name: 'Manicure', sales: 12}]}
          activePeriod={topServicesPeriod}
          onPeriodChange={setTopServicesPeriod}
          delay={1.0}
        />
        <TopItemsList 
          title="Produtos Mais Vendidos"
          icon={Award}
          data={[{name: 'Pomada Modeladora', sales: 15}, {name: 'Óleo para Barba', sales: 10}, {name: 'Shampoo', sales: 8}]}
          activePeriod={topProductsPeriod}
          onPeriodChange={setTopProductsPeriod}
          delay={1.1}
        />
      </div>
    </div>
  );
};

export default Dashboard;
