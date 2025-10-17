import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Award, Calendar, CheckCircle, XCircle, Clock, Send, ShoppingBag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useModal } from '../../contexts/ModalContext';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

const MeuPlano: React.FC = () => {
  const { user, clientPackages, planos, servicos, cancelClientPackage, requestPlanSubscription, cancelPlanSubscriptionRequest } = useAuth();
  const { showConfirm, showAlert } = useModal();

  const activePackage = clientPackages.find(p => p.clientId === user?.id && (p.status === 'ativo' || p.status === 'em-atraso'));
  const pendingPackage = clientPackages.find(p => p.clientId === user?.id && p.status === 'pendente');
  const planDetails = activePackage ? planos.find(p => p.id === activePackage.planId) : null;

  const handleCancel = () => {
    if (!activePackage) return;
    showConfirm({
      title: 'Cancelar Pacote?',
      message: 'Tem certeza que deseja solicitar o cancelamento do seu pacote? Esta ação será enviada para análise.',
      type: 'warning',
      onConfirm: () => {
        cancelClientPackage(activePackage.id);
        showAlert({ title: 'Solicitação Enviada', message: 'Sua solicitação de cancelamento foi enviada.', type: 'success' });
      }
    });
  };

  const handleRequest = (planId: string) => {
    showConfirm({
      title: 'Confirmar Solicitação?',
      message: 'Você está prestes a solicitar um novo pacote. Deseja continuar?',
      type: 'confirmation',
      onConfirm: () => {
        requestPlanSubscription(planId, false);
        showAlert({ title: 'Solicitação Enviada', message: 'Sua solicitação foi enviada e está aguardando aprovação do estabelecimento.', type: 'success' });
      }
    });
  };

  const handleCancelRequest = () => {
    showConfirm({
      title: 'Cancelar Solicitação?',
      message: 'Tem certeza que deseja cancelar sua solicitação de pacote?',
      type: 'warning',
      onConfirm: () => {
        cancelPlanSubscriptionRequest();
        showAlert({ title: 'Cancelado', message: 'Sua solicitação foi cancelada.', type: 'success' });
      }
    });
  };

  if (activePackage && planDetails) {
    const statusConfig = {
      ativo: { icon: CheckCircle, label: 'Ativo', color: 'text-green-500' },
      'em-atraso': { icon: Clock, label: 'Em Atraso', color: 'text-yellow-500' },
    };
    const currentStatus = statusConfig[activePackage.status as keyof typeof statusConfig];

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Award className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-light-900 dark:text-white">Meu Pacote</h1>
            <p className="text-light-500 dark:text-dark-400">Gerencie seu pacote de serviços.</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-light-200 dark:border-dark-700 pb-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-500 dark:text-blue-400">{planDetails.name}</h2>
              <div className={`flex items-center gap-2 mt-1 font-semibold ${currentStatus.color}`}>
                <currentStatus.icon className="w-5 h-5" />
                <span>{currentStatus.label}</span>
              </div>
            </div>
            <div className="text-sm text-light-500 dark:text-dark-400 mt-2 sm:mt-0 sm:text-right">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Válido até: {format(parseISO(activePackage.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-light-800 dark:text-white mb-4">Consumo de Serviços</h3>
          <div className="space-y-4">
            {planDetails.services.map(planService => {
              const serviceInfo = servicos.find(s => s.id === planService.serviceId);
              if (!serviceInfo) return null;

              const used = user?.planUsage?.[planService.serviceId] || 0;
              const percentage = (used / planService.quantity) * 100;

              return (
                <div key={serviceInfo.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-light-800 dark:text-dark-200">{serviceInfo.name}</span>
                    <span className="text-sm text-light-500 dark:text-dark-400">Usado {used} de {planService.quantity}</span>
                  </div>
                  <div className="w-full bg-light-200 dark:bg-dark-700 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-light-200 dark:border-dark-700 flex justify-end">
              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                  <XCircle className="w-5 h-5"/>
                  Solicitar Cancelamento
              </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (pendingPackage) {
    const pendingPlanDetails = planos.find(p => p.id === pendingPackage.planId);
    return (
      <div className="text-center p-8 bg-light-100 dark:bg-dark-800 rounded-xl">
        <Clock className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-light-800 dark:text-white">Solicitação Pendente</h2>
        <p className="text-light-500 dark:text-dark-400 mt-2">
          Sua solicitação para o pacote <span className="font-semibold text-light-700 dark:text-dark-200">{pendingPlanDetails?.name}</span> está aguardando aprovação do estabelecimento.
        </p>
        <button 
          onClick={handleCancelRequest}
          className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
        >
          <XCircle className="w-5 h-5"/>
          Cancelar Solicitação
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-8 bg-light-100 dark:bg-dark-800 rounded-xl">
        <ShoppingBag className="w-16 h-16 mx-auto text-light-400 dark:text-dark-500 mb-4" />
        <h2 className="text-xl font-bold text-light-800 dark:text-white">Você não possui um pacote ativo.</h2>
        <p className="text-light-500 dark:text-dark-400">Visite nossa barbearia para conhecer e contratar nossos pacotes de serviços!</p>
      </div>
      <div>
        <h2 className="text-xl font-bold text-light-800 dark:text-white mb-4">Pacotes Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planos.map(plan => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700 flex flex-col"
            >
              <h3 className="text-xl font-bold text-blue-500 dark:text-blue-400">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-light-900 dark:text-white my-4">{formatCurrency(plan.price)}<span className="text-base font-normal text-light-500 dark:text-dark-400">/mês</span></p>
              <ul className="space-y-2 text-sm text-light-600 dark:text-dark-300 flex-grow">
                {plan.services.map(s => {
                  const serviceInfo = servicos.find(si => si.id === s.serviceId);
                  return (
                    <li key={s.serviceId} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{s.quantity}x {serviceInfo?.name}</span>
                    </li>
                  )
                })}
              </ul>
              <button 
                onClick={() => handleRequest(plan.id)}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Solicitar Assinatura
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeuPlano;
