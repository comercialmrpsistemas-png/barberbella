import React from 'react';
import { Plus, Shield } from 'lucide-react';

interface PageHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
  buttonDisabled?: boolean;
  limit?: number | null;
  count?: number;
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, title, description, buttonLabel, onButtonClick, buttonDisabled = false, limit, count }) => {
  const limitReached = limit !== null && count !== undefined && count >= limit;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div className="flex items-center space-x-3">
        <Icon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-800 dark:text-white">{title}</h1>
          <p className="text-light-500 dark:text-dark-400">{description}</p>
        </div>
      </div>
      <div className="flex flex-col items-start sm:items-end">
        <button
          onClick={onButtonClick}
          disabled={buttonDisabled || limitReached}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {limitReached ? <Shield className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{limitReached ? 'Limite Atingido' : buttonLabel}</span>
        </button>
        {limit !== null && (
          <p className="text-xs text-light-500 dark:text-dark-400 mt-1">
            {count}/{limit} cadastrados
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
