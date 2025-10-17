import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Scissors, Briefcase, Clock, Save, UserPlus, Search, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { format, isPast, setHours, setMinutes, isSameDay, startOfMonth, isSameMonth, addMonths, subMonths, addMinutes, eachDayOfInterval, startOfWeek, addDays, getDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatPhone, formatBirthDate, toYYYYMMDD, formatCpf } from '../../utils/formatters';
import { Client, Service, Combo } from '../../types';
import BackButton from '../../components/common/BackButton';
import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';

type SelectableItem = {
    id: string;
    name: string;
    duration: number;
    price: number;
    specialty_ids?: string[];
    type: 'service' | 'combo';
};

const weekDaysMap = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const StepNumber: React.FC<{ number: number }> = ({ number }) => (
  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-3 flex-shrink-0">
    {number}
  </span>
);

type TimeSlot = {
  time: string;
  disabled: boolean;
  reason?: 'past' | 'break' | 'occupied';
};

const NovoAgendamento: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert, showConfirm } = useModal();
  const { clientes, servicos, combos, funcionarios, agendamentos, planos, addNewClient } = useAuth();
  
  // State
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const [itemTab, setItemTab] = useState<'service' | 'combo'>('service');
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', birthDate: '', email: '', cpf: '' });

  // Handle editing
  useEffect(() => {
    const appointmentToEdit = location.state?.appointmentToEdit;
    if (appointmentToEdit) {
        const fullClient = clientes.find(c => c.id === appointmentToEdit.client.id);
        const fullService = servicos.find(s => s.id === appointmentToEdit.service.id);
        const fullEmployee = funcionarios.find(f => f.id === appointmentToEdit.employee.id);
        if (fullClient && fullService && fullEmployee) {
            setEditingAppointmentId(appointmentToEdit.id);
            setSelectedClient(fullClient);
            setSelectedItem({ ...fullService, type: 'service' });
            setSelectedEmployee(fullEmployee.id);
            setSelectedDate(new Date(appointmentToEdit.startTime));
            setSelectedTime(format(new Date(appointmentToEdit.startTime), 'HH:mm'));
        }
    }
  }, [location.state, clientes, servicos, funcionarios]);

  // Memos & Filters
  const filteredClients = useMemo(() => 
    clientSearch 
      ? clientes.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())) 
      : clientes,
    [clientSearch, clientes]
  );

  const filteredItems = useMemo(() => {
    const list = itemTab === 'service' 
        ? servicos 
        : combos.filter(c => c.type === 'service');
    if (!itemSearch) return list;
    return list.filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase()));
  }, [itemTab, itemSearch, servicos, combos]);

  const itemSpecialties = useMemo(() => {
    if (!selectedItem) return [];
    if (selectedItem.type === 'service') {
      return selectedItem.specialty_ids || [];
    }
    if (selectedItem.type === 'combo') {
      const comboDetails = combos.find(c => c.id === selectedItem.id);
      if (comboDetails) {
        return comboDetails.items.flatMap(item => {
          if (item.type === 'service') {
            const service = servicos.find(s => s.id === item.id);
            return service?.specialty_ids || [];
          }
          return [];
        });
      }
    }
    return [];
  }, [selectedItem, combos, servicos]);

  const uniqueSpecialties = useMemo(() => [...new Set(itemSpecialties)], [itemSpecialties]);

  const qualifiedEmployees = useMemo(() => {
    if (!selectedItem) return [];
    return funcionarios.filter(emp => 
      uniqueSpecialties.every(specId => emp.specialties.includes(specId))
    );
  }, [selectedItem, uniqueSpecialties, funcionarios]);

  const planInfo = useMemo(() => {
    if (!selectedClient?.planId || !selectedItem || selectedItem.type !== 'service') return null;

    const plan = planos.find(p => p.id === selectedClient.planId);
    if (!plan) return null;

    const serviceInPlan = plan.services.find(s => s.serviceId === selectedItem.id);
    if (!serviceInPlan) return null;

    const used = selectedClient.planUsage?.[selectedItem.id] || 0;
    const remaining = serviceInPlan.quantity - used;

    return {
        hasCredit: remaining > 0,
        remaining,
        total: serviceInPlan.quantity
    };
  }, [selectedClient, selectedItem, planos]);

  // Auto-select employee when service changes
  useEffect(() => {
    if (selectedItem) {
      if (qualifiedEmployees.length > 0) {
        if (!selectedEmployee || !qualifiedEmployees.some(e => e.id === selectedEmployee)) {
          setSelectedEmployee(qualifiedEmployees[0].id);
        }
      } else {
        setSelectedEmployee(null);
      }
    }
  }, [selectedItem, qualifiedEmployees]);

  const availableTimeSlots = useMemo((): TimeSlot[] => {
    if (!selectedItem || !selectedEmployee) return [];
    
    const employeeData = funcionarios.find(e => e.id === selectedEmployee);
    if (!employeeData) return [];

    const dayOfWeek = weekDaysMap[getDay(selectedDate)];
    const employeeDaySchedule = employeeData.schedule.find(s => s.day === dayOfWeek);

    if (!employeeDaySchedule || !employeeDaySchedule.active) return [];

    const [startHour, startMinute] = employeeDaySchedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = employeeDaySchedule.end_time.split(':').map(Number);
    const breakStart = employeeDaySchedule.break_start ? employeeDaySchedule.break_start.split(':').map(Number) : null;
    const breakEnd = employeeDaySchedule.break_end ? employeeDaySchedule.break_end.split(':').map(Number) : null;

    const slots: TimeSlot[] = [];
    const interval = 15;

    const duration = selectedItem.type === 'combo' 
        ? combos.find(c => c.id === selectedItem.id)?.duration || 0
        : selectedItem.duration;

    if (duration === 0) return [];

    let currentTime = setMinutes(setHours(selectedDate, startHour), startMinute);
    const endTime = setMinutes(setHours(selectedDate, endHour), endMinute);

    while (addMinutes(currentTime, duration) <= endTime) {
      const slotTime = currentTime;
      const slotEndTime = addMinutes(currentTime, duration);
      
      let isDisabled = false;
      let reason: TimeSlot['reason'] | undefined = undefined;

      if (isPast(slotTime) && !isSameDay(slotTime, new Date())) {
        isDisabled = true;
        reason = 'past';
      }

      if (!isDisabled && breakStart && breakEnd) {
        const breakStartTime = setMinutes(setHours(selectedDate, breakStart[0]), breakStart[1]);
        const breakEndTime = setMinutes(setHours(selectedDate, breakEnd[0]), breakEnd[1]);
        if ((slotTime < breakEndTime && slotEndTime > breakStartTime)) {
          isDisabled = true;
          reason = 'break';
        }
      }
      
      if (!isDisabled) {
        const employeeAppointments = agendamentos.filter(apt => 
          apt.id !== editingAppointmentId &&
          apt.employee_id === selectedEmployee && 
          isSameDay(parseISO(apt.date), selectedDate)
        );
        
        const isOccupied = employeeAppointments.some(apt => {
          const aptStartTime = parseISO(`${apt.date}T${apt.start_time}`);
          const aptEndTime = parseISO(`${apt.date}T${apt.end_time}`);
          return (slotTime < aptEndTime && slotEndTime > aptStartTime);
        });

        if (isOccupied) {
          isDisabled = true;
          reason = 'occupied';
        }
      }
      
      slots.push({ time: format(slotTime, 'HH:mm'), disabled: isDisabled, reason });
      currentTime = addMinutes(currentTime, interval);
    }
    return slots;
  }, [selectedDate, selectedItem, selectedEmployee, funcionarios, agendamentos, editingAppointmentId, combos]);
  
  // Handlers
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newClient.email && clientes.some(c => c.email?.toLowerCase() === newClient.email.toLowerCase())) {
        showAlert({ title: "Email já cadastrado", message: "Este email já está em uso. Busque pelo cliente existente.", type: "error" });
        return;
    }
    if (newClient.cpf && clientes.some(c => c.cpf === newClient.cpf.replace(/\D/g, ''))) {
        showAlert({ title: "CPF já cadastrado", message: "Este CPF já está em uso. Busque pelo cliente existente.", type: "error" });
        return;
    }

    const birthDateYYYYMMDD = toYYYYMMDD(newClient.birthDate);
    const newClientData = addNewClient({ 
        name: newClient.name, 
        phone: newClient.phone, 
        birthDate: birthDateYYYYMMDD,
        email: newClient.email,
        cpf: newClient.cpf,
    });
    setSelectedClient(newClientData as Client);
    setIsClientModalOpen(false);
    setNewClient({ name: '', phone: '', birthDate: '', email: '', cpf: '' });
    setClientSearch('');
  };

  const handleConfirmAppointment = async () => {
    if (isConfirmDisabled) return;

    showConfirm({
        title: editingAppointmentId ? 'Salvar Alterações?' : 'Confirmar Agendamento?',
        message: (
            <div className="text-left text-sm space-y-2">
                <p><strong className="text-light-700 dark:text-dark-300">Cliente:</strong> {selectedClient?.name}</p>
                <p><strong className="text-light-700 dark:text-dark-300">Serviço:</strong> {selectedItem?.name}</p>
                <p><strong className="text-light-700 dark:text-dark-300">Data:</strong> {`${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}`}</p>
            </div>
        ),
        type: 'confirmation',
        onConfirm: async () => {
            setIsConfirming(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            const isSlotStillAvailable = Math.random() > 0.15;
            if (!isSlotStillAvailable) {
                showAlert({
                    title: 'Validação Falhou',
                    message: 'O horário selecionado não está mais disponível. Por favor, escolha outro horário.',
                    type: 'error'
                });
                setSelectedTime('');
                setIsConfirming(false);
                return;
            }
            const message = editingAppointmentId ? 'Agendamento atualizado com sucesso!' : 'Agendamento confirmado com sucesso!';
            showAlert({ title: 'Sucesso!', message, type: 'success' });
            setIsConfirming(false);
            navigate('/agendamentos');
        }
    });
  };

  const isConfirmDisabled = !selectedClient || !selectedItem || !selectedEmployee || !selectedTime;

  const firstDayOfMonth = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const daysInGrid = eachDayOfInterval({ start: firstDayOfMonth, end: addDays(firstDayOfMonth, 41) });
  const weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold text-light-800 dark:text-white">{editingAppointmentId ? 'Editar Agendamento' : 'Novo Agendamento'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-light-800 dark:text-white flex items-center"><StepNumber number={1} /><User className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Cliente</h2>
            <button onClick={() => setIsClientModalOpen(true)} className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300" title="Cadastrar novo cliente">
              <UserPlus className="w-4 h-4"/>
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-400 dark:text-gray-400"/>
            <input type="text" value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full input-style pl-10"/>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {filteredClients.map(c => (
              <div key={c.id} onClick={() => setSelectedClient(c)} className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedClient?.id === c.id ? 'bg-blue-600/50 border border-blue-500' : 'bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600'}`}>
                <p className="text-light-800 dark:text-white text-sm">{c.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-light-800 dark:text-white mb-4 flex items-center"><StepNumber number={2} /><Scissors className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Serviço ou Combo</h2>
          <div className="flex items-center bg-light-200 dark:bg-dark-700 rounded-lg p-1 mb-3">
            <button onClick={() => setItemTab('service')} className={`w-1/2 py-1 text-sm rounded ${itemTab === 'service' ? 'bg-blue-600 text-white' : 'text-light-700 dark:text-gray-300'}`}>Serviços</button>
            <button onClick={() => setItemTab('combo')} className={`w-1/2 py-1 text-sm rounded ${itemTab === 'combo' ? 'bg-blue-600 text-white' : 'text-light-700 dark:text-gray-300'}`}>Combos</button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {filteredItems.map((item: any) => (
              <div key={item.id} onClick={() => setSelectedItem({ ...item, type: itemTab })} className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'bg-blue-600/50 border border-blue-500' : 'bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-light-800 dark:text-white text-sm">{item.name}</span>
                  <span className="text-xs text-light-500 dark:text-gray-400">{item.duration} min</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
        <h2 className="text-lg font-semibold text-light-800 dark:text-white flex items-center mb-4">
          <StepNumber number={3} />
          <Briefcase className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>
          Funcionário
        </h2>
        <select 
          value={selectedEmployee || ''} 
          onChange={e => setSelectedEmployee(e.target.value)} 
          className="w-full input-style"
          disabled={qualifiedEmployees.length === 0}
        >
          {qualifiedEmployees.length > 0 ? (
            qualifiedEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)
          ) : (
            <option>Selecione um serviço para ver os funcionários</option>
          )}
        </select>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-light-800 dark:text-white mb-4 flex items-center"><StepNumber number={4} /><Calendar className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Data do Agendamento</h2>
          <div className="flex items-center justify-between bg-light-200 dark:bg-dark-700 p-2 rounded-lg mb-3">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-light-300 dark:hover:bg-dark-600"><ChevronLeft className="w-5 h-5 text-light-700 dark:text-dark-300"/></button>
            <span className="font-semibold text-sm capitalize text-light-800 dark:text-white">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-light-300 dark:hover:bg-dark-600"><ChevronRight className="w-5 h-5 text-light-700 dark:text-dark-300"/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-light-500 dark:text-dark-400 mb-2">
            {weekDayLabels.map(label => <div key={label}>{label}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInGrid.map(day => (
              <button 
                key={day.toString()} 
                onClick={() => setSelectedDate(day)} 
                disabled={isPast(day) && !isSameDay(day, new Date())} 
                className={`py-2 px-1 rounded-lg text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${!isSameMonth(day, currentMonth) ? 'text-light-400 dark:text-dark-600' : 'text-light-700 dark:text-dark-300'}
                  ${isSameDay(day, selectedDate) ? 'bg-blue-600 text-white' : 'hover:bg-light-200 dark:hover:bg-dark-700'}
                  ${isSameDay(day, new Date()) && !isSameDay(day, selectedDate) ? 'border border-blue-500/50' : ''}
                `}
              >
                <p className="font-bold text-sm">{format(day, 'd')}</p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700 flex flex-col h-full">
          <h2 className="text-lg font-semibold text-light-800 dark:text-white mb-4 flex items-center"><StepNumber number={5} /><Clock className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Horários Disponíveis</h2>
          <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2">
            {selectedItem && selectedEmployee ? (
              availableTimeSlots.length > 0 ? (
                availableTimeSlots.map(slot => (
                  <button 
                    key={slot.time} 
                    onClick={() => !slot.disabled && setSelectedTime(slot.time)} 
                    disabled={slot.disabled}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      selectedTime === slot.time 
                        ? 'bg-blue-600 text-white' 
                        : slot.disabled 
                          ? 'bg-light-100 dark:bg-dark-800 text-light-400 dark:text-dark-600 line-through cursor-not-allowed'
                          : 'bg-light-200 dark:bg-dark-700 text-light-800 dark:text-dark-200 hover:bg-light-300 dark:hover:bg-dark-600'
                    }`}>
                    {slot.time}
                  </button>
                ))
              ) : (
                <p className="col-span-full text-center text-sm text-light-500 dark:text-dark-500 pt-10">Nenhum horário disponível.</p>
              )
            ) : (
              <p className="col-span-full text-center text-sm text-light-500 dark:text-dark-500 pt-10">Selecione serviço e funcionário.</p>
            )}
          </div>
        </motion.div>
      </div>
      
      <div className="flex justify-center mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700 w-full max-w-lg"
        >
          <h2 className="text-lg font-semibold text-light-800 dark:text-white mb-4 flex items-center"><StepNumber number={6} />Resumo do Agendamento</h2>
          
          {planInfo?.hasCredit && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-center flex items-center justify-center space-x-2">
                <Award className="w-5 h-5 text-green-600 dark:text-green-300" />
                <div>
                    <p className="font-semibold text-green-700 dark:text-green-300">Cliente tem crédito no pacote!</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Restam: {planInfo.remaining} de {planInfo.total}</p>
                </div>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-light-500 dark:text-dark-400">Cliente:</span>
              <span className="font-medium text-light-800 dark:text-white">{selectedClient?.name || '...'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light-500 dark:text-dark-400">Serviço:</span>
              <span className="font-medium text-light-800 dark:text-white">{selectedItem?.name || '...'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light-500 dark:text-dark-400">Funcionário:</span>
              <span className="font-medium text-light-800 dark:text-white">{funcionarios.find(f => f.id === selectedEmployee)?.name || '...'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-light-500 dark:text-dark-400">Data:</span>
              <span className="font-medium text-light-800 dark:text-white">{selectedTime ? `${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}` : '...'}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-light-200 dark:border-dark-700 flex justify-between items-center">
            <span className="text-lg font-bold text-light-800 dark:text-white">Total</span>
            <span className="text-2xl font-extrabold text-green-500 dark:text-green-400">
              {planInfo?.hasCredit ? 'Incluso no Pacote' : (selectedItem ? formatCurrency(selectedItem.price) : 'R$ 0,00')}
            </span>
          </div>
          <button onClick={handleConfirmAppointment} disabled={isConfirmDisabled || isConfirming} className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-5 h-5"/>
            <span>{isConfirming ? 'Validando...' : (editingAppointmentId ? 'Salvar Alterações' : 'Confirmar Agendamento')}</span>
          </button>
        </motion.div>
      </div>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Novo Cliente">
        <form onSubmit={handleSaveClient} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Nome</label>
            <input type="text" value={newClient.name} onChange={e => setNewClient(p => ({...p, name: e.target.value}))} className="w-full input-style" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Email</label>
              <input type="email" value={newClient.email} onChange={e => setNewClient(p => ({...p, email: e.target.value}))} className="w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">CPF</label>
              <input type="text" value={newClient.cpf} onChange={e => setNewClient(p => ({...p, cpf: formatCpf(e.target.value)}))} className="w-full input-style" placeholder="000.000.000-00" maxLength={14} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Telefone</label>
              <input type="tel" value={newClient.phone} onChange={e => setNewClient(p => ({...p, phone: formatPhone(e.target.value)}))} className="w-full input-style" maxLength={15} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-700 dark:text-dark-300 mb-2">Data de Nascimento</label>
              <input type="text" value={newClient.birthDate} onChange={e => setNewClient(p => ({...p, birthDate: formatBirthDate(e.target.value)}))} className="w-full input-style" placeholder="dd/mm/aaaa" maxLength={10} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              <Save className="w-5 h-5" />
              <span>Salvar Cliente</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NovoAgendamento;
