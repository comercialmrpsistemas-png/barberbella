import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, PlusCircle, User, Scissors, X, Package, Store, BrainCircuit, Ticket, History, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ContactFooter from '../common/ContactFooter';

const menuItems = [
  { id: 'dashboard-cliente', label: 'Dashboard', icon: Home, path: '/cliente/dashboard' },
  { id: 'meus-agendamentos', label: 'Meus Agendamentos', icon: Calendar, path: '/cliente/agendamentos' },
  { id: 'novo-agendamento', label: 'Novo Agendamento', icon: PlusCircle, path: '/cliente/novo-agendamento' },
  { id: 'meus-pacotes', label: 'Pacotes', icon: Award, path: '/cliente/meus-pacotes' },
  { id: 'meus-vouchers', label: 'Meus Vouchers', icon: Ticket, path: '/cliente/meus-vouchers' },
  { id: 'meu-historico', label: 'Meu Histórico', icon: History, path: '/cliente/historico' },
  { id: 'produtos', label: 'Produtos', icon: Package, path: '/cliente/produtos' },
  { id: 'atendimento-ia', label: 'Atendimento IA', icon: BrainCircuit, path: '/cliente/atendimento-ia' },
  { id: 'meu-perfil', label: 'Meu Perfil', icon: User, path: '/cliente/perfil' },
];

interface ClienteSidebarProps {
  isMobileOpen: boolean;
  onToggle: () => void;
}

const ClienteSidebar: React.FC<ClienteSidebarProps> = ({ isMobileOpen, onToggle }) => {
  const location = useLocation();
  const { company } = useAuth();

  const isItemActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-light-200 dark:border-dark-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-light-900 dark:text-white">Área do Cliente</h1>
        </div>
        <button onClick={onToggle} className="p-2 rounded-lg text-light-600 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700 lg:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>

      {company && (
        <div className="p-4 border-b border-light-200 dark:border-dark-700 flex items-center space-x-3">
          {company.logo_url ? (
            <img src={company.logo_url} alt={`Logo de ${company.name}`} className="w-10 h-10 rounded-md object-contain bg-white p-1"/>
          ) : (
            <div className="w-10 h-10 bg-light-200 dark:bg-dark-700 rounded-md flex items-center justify-center">
              <Store className="w-6 h-6 text-light-500 dark:text-dark-400"/>
            </div>
          )}
          <div>
            <p className="text-xs text-light-500 dark:text-dark-400">Bem-vindo a</p>
            <h2 className="font-semibold text-light-800 dark:text-white">{company.name}</h2>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                onClick={() => { if (isMobileOpen) onToggle(); }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isItemActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-light-700 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <ContactFooter className="p-4 border-t border-light-200 dark:border-dark-700" />
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-light-100 dark:bg-dark-800 border-r border-light-200 dark:border-dark-700 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
      <aside className="hidden lg:block fixed left-0 top-0 z-30 h-full w-72 bg-light-100 dark:bg-dark-800 border-r border-light-200 dark:border-dark-700">
        {sidebarContent}
      </aside>
    </>
  );
};

export default ClienteSidebar;
