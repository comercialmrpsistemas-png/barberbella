import React, { useState, useMemo } from 'react';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModal } from '../../contexts/ModalContext';

const initialMockAppointments = Array.from({ length: 8 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.recent({ days: 60 }),
  service: faker.helpers.arrayElement(['Corte Masculino', 'Barba', 'Manicure']),
  employee: faker.person.firstName(),
  status: faker.helpers.arrayElement(['concluido', 'cancelado', 'agendado']),
})).sort((a, b) => b.date.getTime() - a.date.getTime());

const statusConfig = {
  agendado: { icon: Clock, color: 'blue', label: 'Agendado' },
  concluido: { icon: CheckCircle, color: 'green', label: 'Concluído' },
  cancelado: { icon: XCircle, color: 'red', label: 'Cancelado' },
};

type Appointment = typeof initialMockAppointments[0];
type StatusFilter = 'todos' | 'agendado' | 'concluido' | 'cancelado';

const MeusAgendamentos: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialMockAppointments);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('todos');
  const { showConfirm, showAlert } = useModal();

  const filteredAppointments = useMemo(() => {
    if (activeFilter === 'todos') {
      return appointments;
    }
    return appointments.filter(apt => apt.status === activeFilter);
  }, [appointments, activeFilter]);

  const handleCancelAppointment = (appointment: Appointment) => {
    showConfirm({
      title: 'Cancelar Agendamento?',
      message: 'Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.',
      type: 'warning',
      onConfirm: () => {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointment.id ? { ...apt, status: 'cancelado' } : apt
          )
        );
        showAlert({
          title: 'Sucesso',
          message: 'Agendamento cancelado com sucesso.',
          type: 'success',
        });
      },
    });
  };

  const filterOptions: { id: StatusFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'agendado', label: 'Agendados' },
    { id: 'concluido', label: 'Concluídos' },
    { id: 'cancelado', label: 'Cancelados' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calendar className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-white">Meus Agendamentos</h1>
          <p className="text-light-500 dark:text-dark-400">Consulte seu histórico de agendamentos</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-light-100 dark:bg-dark-800 p-2 rounded-xl border border-light-200 dark:border-dark-700">
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setActiveFilter(opt.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeFilter === opt.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-light-600 dark:text-dark-300 hover:bg-light-200 dark:hover:bg-dark-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt, index) => {
            const config = statusConfig[apt.status as keyof typeof statusConfig];
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-light-100 dark:bg-dark-800 p-4 rounded-xl border border-light-200 dark:border-dark-700 flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all"
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <p className="font-bold text-lg text-light-900 dark:text-white">{apt.service}</p>
                  <p className="text-sm text-light-500 dark:text-dark-400">com {apt.employee}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:space-x-8">
                  <div className="text-sm text-center sm:text-left">
                    <p className="text-light-700 dark:text-dark-300 capitalize">{format(apt.date, "dd 'de' MMMM", { locale: ptBR })}</p>
                    <p className="text-light-500 dark:text-dark-500">{format(apt.date, "HH:mm")}</p>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-${config.color}-100 dark:bg-${config.color}-600/20 text-${config.color}-800 dark:text-${config.color}-400`}>
                    <config.icon className={`w-4 h-4`} />
                    <span>{config.label}</span>
                    {apt.status === 'agendado' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelAppointment(apt);
                        }}
                        className="ml-1 -mr-1 p-0.5 rounded-full text-red-500/70 hover:bg-red-200 dark:hover:bg-red-900/50 hover:text-red-600"
                        title="Cancelar Agendamento"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-light-100 dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700">
            <Calendar className="w-16 h-16 text-light-400 dark:text-dark-600 mx-auto mb-4"/>
            <h3 className="text-xl font-semibold text-light-800 dark:text-white">Nenhum agendamento encontrado</h3>
            <p className="text-light-500 dark:text-dark-400">Não há agendamentos com o status selecionado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusAgendamentos;
