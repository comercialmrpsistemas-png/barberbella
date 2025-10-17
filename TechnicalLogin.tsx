import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

interface TechnicalLoginProps {
  onSuccess: () => void;
}

const TechnicalLogin: React.FC<TechnicalLoginProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (username === 'master' && password === 'nico2019') {
        onSuccess();
      } else {
        setError('Credenciais de técnico inválidas.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-light-100 dark:bg-dark-800 rounded-xl p-8 border border-light-300 dark:border-dark-600 max-w-lg mx-auto"
    >
      <div className="flex items-center space-x-4 mb-6">
        <Shield className="w-10 h-10 text-red-500 dark:text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Acesso Restrito</h1>
          <p className="text-light-500 dark:text-dark-400">Esta área requer permissões de técnico.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Usuário Técnico</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full input-style"
            placeholder="master"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full input-style"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-600/20 border border-red-300 dark:border-red-600/50 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <BackButton />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Key className="w-5 h-5" />
            <span>{loading ? 'Verificando...' : 'Autenticar'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TechnicalLogin;
