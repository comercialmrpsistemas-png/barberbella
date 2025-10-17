import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { menuItems } from '../../components/Layout/menuConfig';

const Agendamentos: React.FC = () => {
  const location = useLocation();
  const agendamentosMenu = menuItems.find(item => item.id === 'agendamentos')?.submenu;

  return (
    <div>
      <div className="mb-6 border-b border-light-300 dark:border-dark-700">
        <nav className="flex space-x-4 -mb-px overflow-x-auto">
          {agendamentosMenu?.map(item => (
            <NavLink
              key={item.id}
              to={item.path || '#'}
              end={item.path === '/agendamentos'}
              className={({ isActive }) =>
                `whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-light-500 dark:text-dark-400 hover:text-light-800 dark:hover:text-white hover:border-light-400 dark:hover:border-dark-500'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default Agendamentos;
