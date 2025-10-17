import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronDown,
  ChevronRight,
  X,
  Scissors,
  Store,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { MenuItem, menuItems as baseMenuItems } from './menuConfig';
import ContactFooter from '../common/ContactFooter';

interface SidebarProps {
  isMobileOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, company } = useAuth();
  const { hasAccess } = useSubscription();

  const filterMenuByRole = (menu: MenuItem[]): MenuItem[] => {
    return menu.reduce((acc, item) => {
      const hasRoleAccess = !item.roles || (user && item.roles.includes(user.role));
      if (hasRoleAccess) {
        if (item.submenu) {
          const filteredSubmenu = filterMenuByRole(item.submenu);
          if (filteredSubmenu.length > 0) {
            acc.push({ ...item, submenu: filteredSubmenu });
          }
        } else {
          acc.push(item);
        }
      }
      return acc;
    }, [] as MenuItem[]);
  };

  const menuItems = filterMenuByRole(baseMenuItems);

  const isItemActive = (path?: string) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const hasActiveSubmenu = (submenu?: MenuItem[]) => {
    if (!submenu) return false;
    return submenu.some(item => isItemActive(item.path));
  };
  
  useEffect(() => {
    const activeParent = menuItems.find(item => hasActiveSubmenu(item.submenu));
    if (activeParent && !expandedItems.includes(activeParent.id)) {
      setExpandedItems(prev => [...prev, activeParent.id]);
    }
  }, [location.pathname, menuItems]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isFeatureBlocked = item.feature ? !hasAccess(item.feature) : false;

    if (item.submenu) {
      return (
        <div key={item.id}>
          <button
            onClick={() => !isFeatureBlocked && toggleExpanded(item.id)}
            disabled={isFeatureBlocked}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
              isFeatureBlocked
                ? 'cursor-not-allowed opacity-60'
                : hasActiveSubmenu(item.submenu)
                ? 'text-light-900 dark:text-white'
                : 'text-light-600 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
            {isFeatureBlocked ? (
              <Star className="w-4 h-4 text-yellow-500" />
            ) : (
              expandedItems.includes(item.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <AnimatePresence>
            {!isFeatureBlocked && expandedItems.includes(item.id) && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-8 mt-2 space-y-1 overflow-hidden border-l border-light-300 dark:border-dark-700 pl-4"
              >
                {item.submenu.map(subItem => (
                  <li key={subItem.id}>
                    {renderMenuItem(subItem)}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={isFeatureBlocked ? '#' : (item.path || '#')}
        onClick={(e) => {
          if (isFeatureBlocked) {
            e.preventDefault();
            navigate('/planos');
          } else if (window.innerWidth < 1024) {
            onToggle();
          }
        }}
        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          isFeatureBlocked
            ? 'cursor-not-allowed opacity-60'
            : isItemActive(item.path)
            ? 'bg-blue-600 text-white'
            : 'text-light-600 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-3">
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </div>
        {isFeatureBlocked && <Star className="w-4 h-4 text-yellow-500" />}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-light-300 dark:border-dark-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-light-900 dark:text-white">Barber e Bella</h1>
            <p className="text-sm text-light-500 dark:text-dark-400">Sistema de Gestão</p>
          </div>
        </div>
        <button onClick={onToggle} className="p-2 rounded-lg text-light-600 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700 lg:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {company && (
        <div className="p-4 border-b border-light-300 dark:border-dark-700 flex items-center space-x-3">
          {company.logo_url ? (
            <img src={company.logo_url} alt={`Logo de ${company.name}`} className="w-10 h-10 rounded-md object-contain bg-white p-1"/>
          ) : (
            <div className="w-10 h-10 bg-light-200 dark:bg-dark-700 rounded-md flex items-center justify-center">
              <Store className="w-6 h-6 text-light-500 dark:text-dark-400"/>
            </div>
          )}
          <div>
            <h2 className="font-semibold text-light-800 dark:text-white">{company.name}</h2>
            <p className="text-xs text-light-500 dark:text-dark-400">{company.document}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>{renderMenuItem(item)}</li>
          ))}
        </ul>
      </nav>

      <ContactFooter className="p-4 border-t border-light-300 dark:border-dark-700" />
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
            className="fixed left-0 top-0 z-50 h-full w-80 bg-light-100 dark:bg-dark-800 border-r border-light-300 dark:border-dark-700 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:block fixed left-0 top-0 z-30 h-full w-80 bg-light-100 dark:bg-dark-800 border-r border-light-300 dark:border-dark-700">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
