import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Scissors, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPhone, formatBirthDate, toYYYYMMDD, formatCpf } from '../../utils/formatters';
import HomeButton from '../../components/common/HomeButton';
import ThemeSwitcher from '../../components/common/ThemeSwitcher';
import ContactFooter from '../../components/common/ContactFooter';

const CadastroCliente: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', birthDate: '', cpf: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerCliente, clientes } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (formData.email && clientes.some(c => c.email?.toLowerCase() === formData.email.toLowerCase())) {
        setError('Este email já está cadastrado. Tente fazer login.');
        return;
    }
    if (formData.cpf && formData.cpf.length > 0 && clientes.some(c => c.cpf === formData.cpf)) {
        setError('Este CPF já está cadastrado. Tente fazer login.');
        return;
    }

    setLoading(true);
    setError('');
    try {
      const birthDateYYYYMMDD = toYYYYMMDD(formData.birthDate);
      const success = await registerCliente(formData.name, formData.email, formData.phone, formData.password, birthDateYYYYMMDD, formData.cpf);
      if (success) {
        navigate('/cliente/dashboard');
      } else {
        setError('Não foi possível realizar o cadastro. Tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mb-4">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-light-900 dark:text-white mb-2">Crie sua Conta</h1>
            <p className="text-light-500 dark:text-dark-400">É rápido e fácil!</p>
          </div>

          <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome Completo</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full input-style" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full input-style" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Telefone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: formatPhone(e.target.value) }))} className="w-full input-style" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">CPF</label>
                  <input type="text" value={formData.cpf} onChange={(e) => setFormData(p => ({ ...p, cpf: formatCpf(e.target.value) }))} className="w-full input-style" placeholder="000.000.000-00" maxLength={14} />
                </div>
              </div>
               <div>
                  <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Data de Nascimento</label>
                  <input 
                    type="text" 
                    value={formData.birthDate} 
                    onChange={(e) => setFormData(p => ({ ...p, birthDate: formatBirthDate(e.target.value) }))} 
                    className="w-full input-style" 
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Senha</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} className="w-full input-style pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-400 dark:text-dark-400 hover:text-light-800 dark:hover:text-white">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-light-500 dark:text-dark-400 mt-1">A senha deve ter no mínimo 6 caracteres.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Confirmar Senha</label>
                <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full input-style" required />
              </div>
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-600/20 border border-red-300 dark:border-red-600/50 rounded-lg text-red-700 dark:text-red-400 text-sm">{error}</div>
              )}
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all">
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
            <div className="text-center mt-4">
              <Link to="/login/cliente" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
                Já tem uma conta? Faça login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <ContactFooter className="py-6" />
    </div>
  );
};

export default CadastroCliente;
