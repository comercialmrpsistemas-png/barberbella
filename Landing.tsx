import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, Store, User } from 'lucide-react';
import ThemeSwitcher from '../components/common/ThemeSwitcher';
import ContactFooter from '../components/common/ContactFooter';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-950 flex flex-col items-center justify-center p-4 relative transition-colors duration-300">
      <div className="absolute top-6 right-6">
        <ThemeSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-4 shadow-lg">
          <Scissors className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-light-900 dark:text-white mb-2">Barber e Bella</h1>
        <p className="text-xl text-light-500 dark:text-gray-400">Seu sistema de gerenciamento completo</p>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Lojista */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/login/lojista')}
          className="bg-light-100 dark:bg-dark-800 rounded-2xl p-8 border-2 border-light-200 dark:border-dark-700 cursor-pointer flex flex-col items-center text-center"
        >
          <Store className="w-16 h-16 text-blue-500 dark:text-blue-400 mb-4" />
          <h2 className="text-3xl font-bold text-light-900 dark:text-white mb-2">Sou Lojista</h2>
          <p className="text-light-500 dark:text-gray-400">Acesse o painel de gerenciamento do seu estabelecimento.</p>
        </motion.div>

        {/* Card Cliente */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/login/cliente')}
          className="bg-light-100 dark:bg-dark-800 rounded-2xl p-8 border-2 border-light-200 dark:border-dark-700 cursor-pointer flex flex-col items-center text-center"
        >
          <User className="w-16 h-16 text-green-500 dark:text-green-400 mb-4" />
          <h2 className="text-3xl font-bold text-light-900 dark:text-white mb-2">Sou Cliente</h2>
          <p className="text-light-500 dark:text-gray-400">Faça seus agendamentos e consulte seu histórico.</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-16"
      >
        <ContactFooter />
      </motion.div>
    </div>
  );
};

export default Landing;
