import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Database, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

const Backup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState('2025-01-20 14:30:00');
  const { showAlert, showConfirm } = useModal();

  const handleBackup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const data = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        company_data: {},
        employees: [],
        clients: [],
        services: [],
        products: [],
        appointments: [],
        sales: []
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-barber-bela-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleString('pt-BR'));
      showAlert({ title: 'Sucesso', message: 'Backup realizado com sucesso!', type: 'success' });
    } catch (error) {
      showAlert({ title: 'Erro', message: 'Ocorreu um erro ao realizar o backup.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    showConfirm({
      title: 'Atenção!',
      message: 'A restauração irá substituir todos os dados atuais. Esta ação não pode ser desfeita. Deseja continuar?',
      type: 'warning',
      onConfirm: async () => {
        setLoading(true);
        try {
          const text = await file.text();
          JSON.parse(text); // Validar se é um JSON
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          showAlert({ title: 'Sucesso', message: 'Dados restaurados com sucesso!', type: 'success' });
        } catch (error) {
          showAlert({ title: 'Erro', message: 'Erro ao restaurar dados. Verifique se o arquivo é válido.', type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Database className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Backup e Restauração</h1>
          <p className="text-light-500 dark:text-dark-400">Faça backup dos seus dados e restaure quando necessário</p>
        </div>
      </div>

      {/* Status do Último Backup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600"
      >
        <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Status do Backup
        </h2>
        <div className="flex items-center justify-between p-4 bg-light-200 dark:bg-dark-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
            <div>
              <p className="text-light-900 dark:text-dark-200 font-medium">Último backup realizado</p>
              <p className="text-light-500 dark:text-dark-400 text-sm">{lastBackup}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-light-500 dark:text-dark-400">Próximo backup automático</p>
            <p className="text-light-900 dark:text-dark-200">Hoje às 23:00</p>
          </div>
        </div>
      </motion.div>

      {/* Realizar Backup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600"
      >
        <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Realizar Backup
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-600/50 rounded-lg">
            <p className="text-blue-800 dark:text-blue-400 text-sm">
              <strong>O que será incluído no backup:</strong>
            </p>
            <ul className="text-blue-700 dark:text-blue-300 text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Dados da empresa, funcionários, clientes, produtos, serviços e agendamentos.</li>
            </ul>
          </div>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>{loading ? 'Realizando backup...' : 'Baixar Backup Completo'}</span>
          </button>
        </div>
      </motion.div>

      {/* Restaurar Backup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600"
      >
        <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Restaurar Backup
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-red-100 dark:bg-red-600/20 border border-red-200 dark:border-red-600/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-red-800 dark:text-red-400 text-sm font-medium">Atenção!</p>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  A restauração irá substituir todos os dados atuais do sistema. 
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>
          <div className="border-2 border-dashed border-light-300 dark:border-dark-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-light-400 dark:text-dark-400 mx-auto mb-4" />
            <p className="text-light-700 dark:text-dark-300 mb-2">Selecione o arquivo de backup</p>
            <p className="text-light-500 dark:text-dark-500 text-sm mb-4">Apenas arquivos .json são aceitos</p>
            <label className="inline-flex items-center space-x-2 px-4 py-2 bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600 text-light-800 dark:text-white rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Escolher Arquivo</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-blue-500 dark:text-blue-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 dark:border-blue-400"></div>
                <span>Restaurando dados...</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Backup;
