import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, X, Layers, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { useNotification } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSubscription } from '../../contexts/SubscriptionContext';
import UserProfileMenu from '../common/UserProfileMenu';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { isDemo } = useAuth();
  const { notifications, clearNotifications } = useNotification();
  const { planDetails } = useSubscription();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <header className="bg-light-100 dark:bg-dark-800 border-b border-light-300 dark:border-dark-700 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-light-600 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isDemo && (
            <div className="px-3 py-1 bg-yellow-400 text-yellow-800 text-sm font-semibold rounded-full hidden sm:block">
              Modo Demonstração
            </div>
          )}
          
          <div className="flex items-center gap-1 bg-light-200 dark:bg-dark-700 p-1 rounded-lg">
            <Link to="/planos" className="px-3 py-1 text-sm font-semibold rounded-md flex items-center gap-2 hover:bg-light-100 dark:hover:bg-dark-800 transition-colors text-light-800 dark:text-white">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Planos</span>
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-light-100 dark:bg-dark-800 rounded-md shadow-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold text-light-800 dark:text-white capitalize">{planDetails.name}</span>
            </div>
          </div>

          <ThemeSwitcher />

          {/* Notification Bell */}
          <div className="relative">
            <button
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="relative p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700"
                title="Notificações"
            >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-light-100 dark:ring-dark-800" />
                )}
            </button>
            <AnimatePresence>
                {isPopoverOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-light-100 dark:bg-dark-800 rounded-xl shadow-lg border border-light-300 dark:border-dark-700 z-50"
                    >
                        <div className="p-4 flex justify-between items-center border-b border-light-300 dark:border-dark-700">
                            <h3 className="font-semibold text-light-900 dark:text-white">Notificações</h3>
                            <button onClick={() => setIsPopoverOpen(false)} className="p-1 rounded-full hover:bg-light-200 dark:hover:bg-dark-700"><X className="w-4 h-4"/></button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div key={notif.id} className="p-4 border-b border-light-200 dark:border-dark-700 hover:bg-light-200 dark:hover:bg-dark-700">
                                        <p className="font-semibold text-sm text-light-800 dark:text-white">{notif.title}</p>
                                        <p className="text-xs text-light-500 dark:text-dark-400">{notif.message}</p>
                                        <p className="text-xs text-light-400 dark:text-dark-500 mt-1">{formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: ptBR })}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="p-8 text-center text-sm text-light-500 dark:text-dark-400">Nenhuma nova notificação.</p>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <div className="p-2 border-t border-light-300 dark:border-dark-700">
                                <button onClick={() => { clearNotifications(); setIsPopoverOpen(false); }} className="w-full text-center text-sm text-blue-500 dark:text-blue-400 font-semibold py-2 rounded-lg hover:bg-light-200 dark:hover:bg-dark-700">
                                    Marcar todas como lidas
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
