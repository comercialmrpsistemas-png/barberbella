import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TechnicalLogin from '../../pages/Configuracoes/TechnicalLogin';

const TechnicalAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTechAuthenticated, setIsTechAuthenticated] = useState(false);

  if (user?.role === 'tecnico') {
    return <>{children}</>;
  }

  if (isTechAuthenticated) {
    return <>{children}</>;
  }

  const handleSuccess = () => {
    setIsTechAuthenticated(true);
  };

  return <TechnicalLogin onSuccess={handleSuccess} />;
};

export default TechnicalAuthGuard;
