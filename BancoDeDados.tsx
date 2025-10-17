import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Cloud, Server, Save, AlertTriangle, Power, PowerOff } from 'lucide-react';
import Modal from '../../components/common/Modal';

type DbName = 'SQLite' | 'Supabase' | 'WordPress';

interface DbOption {
  name: DbName;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const dbOptions: DbOption[] = [
  {
    name: 'SQLite',
    icon: Database,
    title: 'SQLite (Local)',
    description: 'Banco de dados local, armazenado no navegador. Ideal para simplicidade, testes e demonstração. Não requer configuração.',
    color: 'text-green-500 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-500/10',
    borderColor: 'border-green-500'
  },
  {
    name: 'Supabase',
    icon: Cloud,
    title: 'Supabase (Nuvem)',
    description: 'Plataforma open-source com banco de dados Postgres, autenticação e APIs automáticas. Recomendado para produção.',
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-500/10',
    borderColor: 'border-blue-500'
  },
  {
    name: 'WordPress',
    icon: Server,
    title: 'WordPress (Externo)',
    description: 'Integre com um banco de dados de uma instalação WordPress existente para sincronizar clientes e outros dados.',
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-500/10',
    borderColor: 'border-gray-500'
  }
];

const BancoDeDados: React.FC = () => {
  const [activeDb, setActiveDb] = useState<DbName | null>('SQLite');
  const [configuringDb, setConfiguringDb] = useState<DbName | null>(null);
  const [configuredDbs, setConfiguredDbs] = useState<DbName[]>(['SQLite']);

  const [supabaseConfig, setSupabaseConfig] = useState({ url: '', anonKey: '' });
  const [wordpressConfig, setWordpressConfig] = useState({ url: '', user: '', password: '' });

  const handleActivationRequest = (dbName: DbName) => {
    if (dbName === activeDb) return;

    if (dbName === 'SQLite' || configuredDbs.includes(dbName)) {
      const confirmActivation = window.confirm(
        `Você tem certeza que deseja ativar o banco de dados ${dbName}? A fonte de dados atual (${activeDb || 'Nenhuma'}) será desativada.`
      );
      if (confirmActivation) {
        setActiveDb(dbName);
      }
    } else {
      setConfiguringDb(dbName);
    }
  };

  const handleDeactivationRequest = () => {
    if (!activeDb) return;
    const confirmDeactivation = window.confirm(
      `Tem certeza que deseja desativar o banco de dados ${activeDb}? O sistema pode não funcionar corretamente sem uma fonte de dados ativa.`
    );
    if (confirmDeactivation) {
      setActiveDb(null);
    }
  };

  const handleSaveConfig = () => {
    if (!configuringDb) return;

    if (configuringDb === 'Supabase' && (!supabaseConfig.url || !supabaseConfig.anonKey)) {
      alert('Por favor, preencha todos os campos da configuração do Supabase.');
      return;
    }
    if (configuringDb === 'WordPress' && (!wordpressConfig.url || !wordpressConfig.user || !wordpressConfig.password)) {
      alert('Por favor, preencha todos os campos da configuração do WordPress.');
      return;
    }

    const confirmActivation = window.confirm(
      `Você tem certeza que deseja salvar e ativar o banco de dados ${configuringDb}? A fonte de dados atual será desativada.`
    );

    if (confirmActivation) {
      setConfiguredDbs(prev => [...new Set([...prev, configuringDb])]);
      setActiveDb(configuringDb);
      console.log(`Configurações para ${configuringDb} salvas e ativadas:`, configuringDb === 'Supabase' ? supabaseConfig : wordpressConfig);
    }
    
    setConfiguringDb(null);
  };

  const renderModalContent = () => {
    if (configuringDb === 'Supabase') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Project URL</label>
            <input 
              type="text" 
              value={supabaseConfig.url}
              onChange={(e) => setSupabaseConfig(p => ({...p, url: e.target.value}))}
              className="w-full input-style" 
              placeholder="https://exemplo.supabase.co"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Anon Key</label>
            <input 
              type="text" 
              value={supabaseConfig.anonKey}
              onChange={(e) => setSupabaseConfig(p => ({...p, anonKey: e.target.value}))}
              className="w-full input-style" 
              placeholder="Sua chave anônima pública"
            />
          </div>
        </div>
      );
    }
    if (configuringDb === 'WordPress') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">URL do Site WordPress</label>
            <input 
              type="text" 
              value={wordpressConfig.url}
              onChange={(e) => setWordpressConfig(p => ({...p, url: e.target.value}))}
              className="w-full input-style" 
              placeholder="https://seusite.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Usuário (ou Email)</label>
            <input 
              type="text" 
              value={wordpressConfig.user}
              onChange={(e) => setWordpressConfig(p => ({...p, user: e.target.value}))}
              className="w-full input-style" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Senha de Aplicativo</label>
            <input 
              type="password" 
              value={wordpressConfig.password}
              onChange={(e) => setWordpressConfig(p => ({...p, password: e.target.value}))}
              className="w-full input-style" 
            />
          </div>
        </div>
      );
    }
    return null;
  };

  const getStatus = (dbName: DbName): { text: string; color: string } => {
    if (activeDb === dbName) return { text: 'Ativo', color: 'bg-green-500 text-green-100' };
    if (configuredDbs.includes(dbName)) return { text: 'Pronto para ativar', color: 'bg-blue-500 text-blue-100' };
    return { text: 'Requer Configuração', color: 'bg-yellow-500 text-yellow-100' };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Database className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Configuração do Banco de Dados</h1>
          <p className="text-light-500 dark:text-dark-400">Gerencie a fonte de dados do sistema (acesso restrito ao técnico)</p>
        </div>
      </div>

      {!activeDb && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-r-lg flex items-center space-x-4"
        >
          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 flex-shrink-0" />
          <div>
            <h3 className="font-bold">Nenhum Banco de Dados Ativo!</h3>
            <p className="text-sm mt-1">O sistema pode não funcionar corretamente. Por favor, ative uma fonte de dados.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dbOptions.map((option, index) => {
          const isActive = activeDb === option.name;
          const status = getStatus(option.name);
          return (
            <motion.div
              key={option.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-light-100 dark:bg-dark-800 rounded-xl border-2 ${isActive ? option.borderColor : 'border-light-300 dark:border-dark-600'} flex flex-col justify-between transition-all duration-300 overflow-hidden`}
            >
              <div className={`p-6 ${option.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <option.icon className={`w-10 h-10 ${option.color}`} />
                    <h2 className="text-xl font-bold text-light-900 dark:text-dark-200">{option.title}</h2>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                <p className="text-light-500 dark:text-dark-400 text-sm mt-4 min-h-[60px]">
                  {option.description}
                </p>
              </div>

              <div className="p-4 bg-light-200 dark:bg-dark-700/50 flex items-center justify-end space-x-3">
                <button
                  onClick={() => option.name !== 'SQLite' && setConfiguringDb(option.name)}
                  className={`text-sm text-light-700 dark:text-dark-300 ${option.name !== 'SQLite' ? 'hover:text-light-900 dark:hover:text-white' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={option.name === 'SQLite'}
                  title={option.name === 'SQLite' ? 'SQLite não requer configuração' : 'Configurar conexão'}
                >
                  Configurar
                </button>
                {isActive ? (
                  <button
                    onClick={handleDeactivationRequest}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    <PowerOff className="w-4 h-4" />
                    <span>Desativar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivationRequest(option.name)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    <Power className="w-4 h-4" />
                    <span>Ativar</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg flex items-start space-x-3 mt-8">
        <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-yellow-900 dark:text-yellow-200">Atenção, Usuário Técnico!</h3>
          <p className="text-sm mt-1">Alterar a fonte de dados pode causar perda de informações se não for feito corretamente. Realize um backup completo antes de qualquer migração.</p>
        </div>
      </div>

      <Modal 
        isOpen={!!configuringDb} 
        onClose={() => setConfiguringDb(null)} 
        title={`Configurar ${configuringDb}`}
      >
        {renderModalContent()}
        <div className="flex justify-end pt-6">
          <button
            onClick={handleSaveConfig}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Salvar e Ativar</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BancoDeDados;
