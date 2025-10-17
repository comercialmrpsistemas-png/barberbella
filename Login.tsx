import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Scissors, Eye, EyeOff, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import HomeButton from '../components/common/HomeButton';
import ThemeSwitcher from '../components/common/ThemeSwitcher';
import ContactFooter from '../components/common/ContactFooter';

const LoginLojista: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginLojista, loginDemo } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await loginLojista(formData.email, formData.password);
      if (!success) {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginDemo('lojista');
    } catch (err) {
      setError('Erro ao iniciar demonstração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-950 flex flex-col items-center justify-center p-4 relative transition-colors duration-300">
      <div className="absolute top-6 left-6">
        <HomeButton />
      </div>
      <div className="absolute top-6 right-6">
        <ThemeSwitcher />
      </div>

      <div className="flex-grow flex items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logos */}
          <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <Scissors className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-light-900 dark:text-white">Acesso Lojista</h1>
              <p className="text-lg text-light-500 dark:text-dark-400 mt-2">Gerencie seu estabelecimento</p>
          </div>


          {/* Login Form */}
          <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                  Email/Login
                </label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full input-style"
                  placeholder="Seu email ou login"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full input-style pr-12"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-400 dark:text-dark-400 hover:text-light-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-600/20 border border-red-300 dark:border-red-600/50 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-6">
            <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 py-2 px-6 bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600 text-light-800 dark:text-white font-semibold rounded-lg transition-all"
            >
                <PlayCircle className="w-5 h-5" />
                Acessar Demonstração (Técnico)
            </button>
          </div>

        </motion.div>
      </div>
      
      <ContactFooter className="py-6" />
    </div>
  );
};

export default LoginLojista;
