import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md border-b-4 bg-light-100 dark:bg-dark-700 border-light-300 dark:border-dark-600 text-light-700 dark:text-dark-300 font-semibold text-sm transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0.5 active:border-b-2 active:shadow-sm ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Voltar</span>
    </button>
  );
};

export default BackButton;
