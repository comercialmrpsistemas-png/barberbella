import React from 'react';
import { Menu } from 'lucide-react';
import ThemeSwitcher from '../common/ThemeSwitcher';
import UserProfileMenu from '../common/UserProfileMenu';

interface ClienteHeaderProps {
  onMenuToggle: () => void;
}

const ClienteHeader: React.FC<ClienteHeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="bg-light-100 dark:bg-dark-800 border-b border-light-200 dark:border-dark-700 px-4 sm:px-6 py-3 transition-colors">
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
          <ThemeSwitcher />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default ClienteHeader;
