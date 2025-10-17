import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, User, Scissors as ScissorsIcon, Briefcase, Eye, Edit, Trash2 } from 'lucide-react';
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isPast, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { faker } from '@faker-js/faker';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { useModal } from '../../contexts/ModalContext';

// --- Mock Data ---
const mockFuncionarios = [
  { id: 'func1', name: 'Barbeiro Zé' },
  { id: 'func2', name: 'Manicure Ana' },
  { id: 'func3', name: 'Esteticista Carla' },
];

const mockClientes = Array.from({ length: 10 }, () => ({ id: faker.string.uuid(), name: faker.person.fullName() }));

const mockServicos = [
  { id: 'serv1', name: 'Corte', duration: 30, price: 40 },
  { id: 'serv2', name: 'Barba', duration: 20, price: 30 },
  { id: 'serv3', name: 'Manicure', duration: 40, price: 25 },
  { id: 'serv4', name: 'Limpeza de Pele', duration: 60, price: 80 },
];

const generateMockAppointmentsForMonth = (month: Date) => {
  const appointments = [];
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  for (const day of days) {
    const numAppointments = faker.number.int({ min: 0, max: 7 });
    for (let i = 0; i < numAppointments; i++) {
      const randomFunc = faker.helpers.arrayElement(mockFuncionarios);
      const randomClient = faker.helpers.arrayElement(mockClientes);
      const randomService = faker.helpers.arrayElement(mockServicos);
      const hour = faker.number.int({ min: 8, max: 17 });
      const minute = faker.helpers.arrayElement([0, 15, 30, 45]);
      const startTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);

      if (isPast(startTime) && !isSameDay(startTime, new Date())) continue;

      appointments.push({
        id: faker.string.uuid(),
        startTime: startTime,
        endTime: addMinutes(startTime, randomService.duration),
        employee: randomFunc,
        client: randomClient,
        service: randomService,
        status: faker.helpers.arrayElement(['agendado', 'concluido']),
      });
    }
  }
  // Add overlapping appointment for testing
  const todayAt10 = new Date();
  todayAt10.setHours(10, 0, 0, 0);
  if (!isPast(todayAt10)) {
    appointments.push({ id: 'overlap1', startTime: todayAt10, endTime: addMinutes(todayAt10, 60), employee: mockFuncionarios[0], client: mockClientes[0], service: mockServicos[3], status: 'agendado' });
    appointments.push({ id: 'overlap2', startTime: todayAt10, endTime: addMinutes(todayAt10, 40), employee: mockFuncionarios[1], client: mockClientes[1], service: mockServicos[2], status: 'agendado' });
  }

  return appointments;
};

const statusConfig = {
  agendado: { icon: Clock, color: 'bg-blue-600', borderColor: 'border-blue-400', label: 'Agendado' },
  concluido: { icon: CheckCircle, color: 'bg-green-600', borderColor: 'border-green-400', label: 'Concluído' },
  cancelado: { icon: XCircle, color: 'bg-red-600', borderColor: 'border-red-400', label: 'Cancelado' },
};
// --- End Mock Data ---

const PainelAgendamentos: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [layout, setLayout] = useState<'side' | 'top'>('side');
  const { showConfirm, showAlert } = useModal();

  // Modal states
  const [actionTarget, setActionTarget] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    setAppointments(generateMockAppointmentsForMonth(currentMonth));
  }, [currentMonth]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => 
        isSameDay(apt.startTime, selectedDate) && apt.status !== 'cancelado'
    );
  }, [appointments, selectedDate]);

  const displayedAppointments = useMemo(() => {
    if (employeeFilter === 'all') {
      return filteredAppointments;
    }
    return filteredAppointments.filter(apt => apt.employee.id === employeeFilter);
  }, [filteredAppointments, employeeFilter]);

  const appointmentLanes = useMemo(() => {
    const sorted = [...displayedAppointments].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    if (sorted.length === 0) return [];

    const lanes: any[][] = [];

    sorted.forEach(apt => {
        let placed = false;
        for (const lane of lanes) {
            const lastInLane = lane[lane.length - 1];
            if (apt.startTime >= lastInLane.endTime) {
                lane.push(apt);
                placed = true;
                break;
            }
        }
        if (!placed) {
            lanes.push([apt]);
        }
    });

    return lanes;
  }, [displayedAppointments]);

  const handleAppointmentClick = (apt: any) => {
    setActionTarget(apt);
  };

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true);
  };

  const handleEdit = () => {
    navigate('/agendamentos/novo', { state: { appointmentToEdit: actionTarget } });
    setActionTarget(null);
  };
  
  const handleCancelAppointment = () => {
    if (!actionTarget) return;
    showConfirm({
      title: 'Cancelar Agendamento?',
      message: 'Tem certeza que deseja cancelar este agendamento?',
      type: 'warning',
      onConfirm: () => {
        setAppointments(prev => 
          prev.filter(apt => apt.id !== actionTarget.id)
        );
        setIsDetailsModalOpen(false);
        setActionTarget(null);
        showAlert({ title: 'Cancelado', message: 'Agendamento cancelado com sucesso.', type: 'success' });
      }
    });
  };

  const CalendarView = () => {
    const firstDayOfMonth = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const daysInGrid = Array.from({ length: 42 }, (_, i) => addDays(firstDayOfMonth, i));
    const weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    const appointmentsByDay = useMemo(() => {
      const map = new Map<string, number>();
      appointments
        .filter(apt => apt.status !== 'cancelado')
        .forEach(apt => {
          const dayKey = format(apt.startTime, 'yyyy-MM-dd');
          map.set(dayKey, (map.get(dayKey) || 0) + 1);
        });
      return map;
    }, [appointments]);

    return (
      <div className="bg-light-100 dark:bg-dark-800 p-4 rounded-xl border border-light-200 dark:border-dark-700 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-700"><ChevronLeft className="w-5 h-5"/></button>
          <span className="font-semibold text-light-800 dark:text-white capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-700"><ChevronRight className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-light-500 dark:text-dark-400 mb-2">
          {weekDayLabels.map(label => <div key={label}>{label}</div>)}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 gap-1">
          {daysInGrid.map(day => {
            const hasAppointments = appointmentsByDay.get(format(day, 'yyyy-MM-dd'));
            return (
              <button 
                key={day.toString()} 
                onClick={() => setSelectedDate(day)} 
                className={`py-2 px-1 rounded-lg text-center transition-colors relative flex items-center justify-center
                  ${!isSameMonth(day, currentMonth) ? 'text-light-400 dark:text-dark-600' : 'text-light-800 dark:text-white'}
                  ${isSameDay(day, selectedDate) ? 'bg-blue-600 text-white' : 'hover:bg-light-200 dark:hover:bg-dark-700'}
                  ${isSameDay(day, new Date()) && !isSameDay(day, selectedDate) ? 'border border-blue-500/50' : ''}
                `}
              >
                <p className="font-medium text-sm">{format(day, 'd')}</p>
                {hasAppointments && <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}
              </button>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-light-200 dark:border-dark-700 flex items-center justify-center space-x-4 text-xs text-light-500 dark:text-dark-400">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span>Agendado</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Concluído</span>
          </div>
        </div>
      </div>
    );
  };

  const DailyScheduleView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

    return (
      <div className="bg-light-100 dark:bg-dark-800 rounded-xl border border-light-200 dark:border-dark-700 overflow-hidden h-full">
        <div className="p-4 border-b border-light-200 dark:border-dark-700">
          <h2 className="text-lg font-bold text-light-800 dark:text-white capitalize">{format(selectedDate, "eeee, dd 'de' MMMM", { locale: ptBR })}</h2>
        </div>
        
        <div className="grid grid-cols-[60px_1fr] h-[calc(100%-65px)] overflow-y-auto">
          {/* Time Column */}
          <div className="border-r border-light-200 dark:border-dark-700 text-xs text-light-500 dark:text-dark-400 text-right">
            {hours.map(hour => (
              <div key={hour} className="h-24 pr-2 pt-1 border-b border-light-200 dark:border-dark-700 relative">
                <span className="absolute -top-2 right-2">{`${hour}:00`}</span>
              </div>
            ))}
          </div>
          
          {/* Appointments Timeline */}
          <div className="relative">
            {/* Background Lines */}
            {hours.map(hour => <div key={hour} className="h-24 border-b border-light-200 dark:border-dark-600"></div>)}
            
            <AnimatePresence>
            {appointmentLanes.length === 0 ? (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <Calendar className="w-16 h-16 text-light-400 dark:text-dark-600 mb-4"/>
                <h3 className="text-xl font-semibold text-light-800 dark:text-white">Nenhum agendamento</h3>
                <p className="text-light-500 dark:text-dark-400">Não há nada na agenda para este dia.</p>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex">
                {appointmentLanes.map((lane, laneIndex) => (
                  <div key={laneIndex} className="relative h-full" style={{ width: `${100 / appointmentLanes.length}%` }}>
                    {lane.map(apt => {
                      const top = (apt.startTime.getHours() - 8 + apt.startTime.getMinutes() / 60) * 96; // 96px per hour
                      const height = Math.max(80, (apt.endTime.getTime() - apt.startTime.getTime()) / (60 * 1000) / 60 * 96);
                      const config = statusConfig[apt.status as keyof typeof statusConfig];
                      
                      return (
                        <motion.div
                          key={apt.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{ top: `${top}px`, height: `${height - 4}px` }}
                          onClick={() => handleAppointmentClick(apt)}
                          className={`absolute left-1 right-1 ${config.color} p-2 rounded-lg border-l-4 ${config.borderColor} overflow-hidden text-xs text-white shadow-lg flex flex-col justify-center cursor-pointer hover:scale-105 hover:z-10 transition-transform duration-200`}
                        >
                          <p className="font-bold truncate flex items-center"><User className="w-3 h-3 mr-1.5 flex-shrink-0"/>{apt.client.name}</p>
                          <p className="truncate flex items-center text-gray-200"><ScissorsIcon className="w-3 h-3 mr-1.5 flex-shrink-0"/>{apt.service.name}</p>
                          {employeeFilter === 'all' && (
                            <p className="truncate flex items-center text-gray-300"><Briefcase className="w-3 h-3 mr-1.5 flex-shrink-0"/>{apt.employee.name}</p>
                          )}
                          <p className="absolute bottom-1 right-2 text-gray-300 font-mono">{format(apt.startTime, 'HH:mm')}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsModalContent = () => {
    if (!actionTarget) return null;
    const config = statusConfig[actionTarget.status as keyof typeof statusConfig];
    const StatusIcon = config.icon;
    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border-l-4 ${config.borderColor} bg-${config.color.split('-')[1]}-100 dark:bg-${config.color.split('-')[1]}-600/20`}>
          <div className={`flex items-center space-x-2 text-${config.color.split('-')[1]}-700 dark:text-${config.color.split('-')[1]}-400`}>
            <StatusIcon className="w-5 h-5" />
            <span className="font-semibold text-lg">{config.label}</span>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-light-500 dark:text-dark-400">Cliente:</span> <span className="font-medium text-light-800 dark:text-white">{actionTarget.client.name}</span></div>
          <div className="flex justify-between"><span className="text-light-500 dark:text-dark-400">Serviço:</span> <span className="font-medium text-light-800 dark:text-white">{actionTarget.service.name}</span></div>
          <div className="flex justify-between"><span className="text-light-500 dark:text-dark-400">Funcionário:</span> <span className="font-medium text-light-800 dark:text-white">{actionTarget.employee.name}</span></div>
          <div className="flex justify-between"><span className="text-light-500 dark:text-dark-400">Data:</span> <span className="font-medium text-light-800 dark:text-white">{format(actionTarget.startTime, "dd/MM/yyyy 'às' HH:mm")}</span></div>
          <div className="flex justify-between"><span className="text-light-500 dark:text-dark-400">Duração:</span> <span className="font-medium text-light-800 dark:text-white">{actionTarget.service.duration} min</span></div>
          <div className="flex justify-between"><span className="text-light-500 dark:text-dark-400">Valor:</span> <span className="font-bold text-green-500 dark:text-green-400">{formatCurrency(actionTarget.service.price)}</span></div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={() => setIsDetailsModalOpen(false)}
            className="px-6 py-2 bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600 text-light-800 dark:text-white font-semibold rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-light-800 dark:text-white">Painel de Agendamentos</h1>
            <p className="text-light-500 dark:text-dark-400">Visualize e gerencie seus agendamentos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-light-200 dark:bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setLayout('side')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                layout === 'side' ? 'bg-blue-600 text-white' : 'text-light-700 dark:text-dark-300 hover:bg-light-300 dark:hover:bg-dark-600'
              }`}
            >
              Lado a Lado
            </button>
            <button
              onClick={() => setLayout('top')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                layout === 'top' ? 'bg-blue-600 text-white' : 'text-light-700 dark:text-dark-300 hover:bg-light-300 dark:hover:bg-dark-600'
              }`}
            >
              Topo/Base
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Funcionário</label>
            <select 
              value={employeeFilter} 
              onChange={e => setEmployeeFilter(e.target.value)} 
              className="input-style py-2 w-full md:w-auto"
            >
              <option value="all">Todos os Funcionários</option>
              {mockFuncionarios.map(func => (
                <option key={func.id} value={func.id}>{func.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => navigate('/agendamentos/novo')}
            className="self-end flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      <div className={`flex-1 grid gap-6 transition-all duration-300 ${layout === 'side' ? 'grid-cols-1 lg:grid-cols-[auto_1fr] lg:items-start' : 'grid-cols-1'}`}>
        <motion.div layout className={`${layout === 'side' ? 'lg:w-[380px]' : 'col-span-1'}`}>
          <CalendarView />
        </motion.div>
        <motion.div layout className={`${layout === 'side' ? '' : 'col-span-1 min-h-[600px]'}`}>
          <DailyScheduleView />
        </motion.div>
      </div>

      {/* Action Choice Modal */}
      <Modal isOpen={!!actionTarget && !isDetailsModalOpen} onClose={() => setActionTarget(null)} title="Opções de Agendamento">
        <div className="text-center">
            <p className="text-light-700 dark:text-dark-300 mb-6">
                O que você deseja fazer com o agendamento de <br/> <span className="font-bold text-light-900 dark:text-white text-lg">{actionTarget?.client.name}</span>?
            </p>
            <div className="flex justify-center space-x-4">
                <button onClick={handleViewDetails} className="flex items-center space-x-2 px-6 py-3 bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600 text-light-800 dark:text-white font-semibold rounded-lg transition-colors">
                  <Eye className="w-5 h-5"/>
                  <span>Visualizar</span>
                </button>
                <button onClick={handleEdit} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  <Edit className="w-5 h-5"/>
                  <span>Editar</span>
                </button>
                <button 
                  onClick={handleCancelAppointment} 
                  disabled={actionTarget?.status === 'cancelado'}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5"/>
                  <span>Cancelar</span>
                </button>
            </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Detalhes do Agendamento">
        {renderDetailsModalContent()}
      </Modal>
    </div>
  );
};

export default PainelAgendamentos;
