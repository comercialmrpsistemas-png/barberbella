import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Scissors, Briefcase, Clock, Save, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { format, isPast, setHours, setMinutes, isSameDay, startOfMonth, isSameMonth, addMonths, subMonths, addMinutes, getDay, eachDayOfInterval, startOfWeek, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';

type TimeSlot = {
  time: string;
  disabled: boolean;
  reason?: 'past' | 'break' | 'occupied';
};

const weekDaysMap = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const NovoAgendamentoCliente: React.FC = () => {
  const navigate = useNavigate();
  const { user, servicos, funcionarios, agendamentos, planos, clientPackages } = useAuth();
  const { showAlert, showConfirm } = useModal();
  
  const [selectedItem, setSelectedItem] = useState<typeof servicos[0] | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isConfirming, setIsConfirming] = useState(false);

  const qualifiedEmployees = useMemo(() => {
    if (!selectedItem) return [];
    const qualified = funcionarios.filter(emp => emp.specialties.some(specId => (selectedItem.specialty_ids || []).includes(specId)));
    return [{ id: 'any', name: 'Qualquer Profissional', specialties: [], schedule: [], active: true, commission_combos: 0, commission_products: 0, commission_services: 0, company_id: '', phone: '' }, ...qualified];
  }, [selectedItem, funcionarios]);

  const planInfo = useMemo(() => {
    if (!user) return null;
    const activePackage = clientPackages.find(p => p.clientId === user.id && p.status === 'ativo');
    if (!activePackage || !selectedItem) return null;

    const planDetails = planos.find(p => p.id === activePackage.planId);
    if (!planDetails) return null;
    
    const serviceInPlan = planDetails.services.find(s => s.serviceId === selectedItem.id);
    if (!serviceInPlan) return null;

    const used = user.planUsage?.[selectedItem.id] || 0;
    const remaining = serviceInPlan.quantity - used;

    return {
        hasCredit: remaining > 0,
        remaining,
        total: serviceInPlan.quantity
    };
  }, [user, selectedItem, clientPackages, planos]);

  useEffect(() => {
    setSelectedEmployee('any');
  }, [selectedItem]);

  const availableTimeSlots = useMemo((): TimeSlot[] => {
    if (!selectedItem) return [];

    const employeesToCheck = selectedEmployee === 'any' 
      ? qualifiedEmployees.filter(e => e.id !== 'any') 
      : [funcionarios.find(e => e.id === selectedEmployee)].filter(Boolean);

    if (employeesToCheck.length === 0) return [];

    const interval = 15;
    const duration = selectedItem.duration;

    let dayStartTime: Date | null = null;
    let dayEndTime: Date | null = null;

    employeesToCheck.forEach(employee => {
        if(!employee) return;
        const dayOfWeek = weekDaysMap[getDay(selectedDate)];
        const schedule = employee.schedule.find(s => s.day === dayOfWeek);
        if (schedule && schedule.active) {
            const [startH, startM] = schedule.start_time.split(':').map(Number);
            const [endH, endM] = schedule.end_time.split(':').map(Number);
            const currentStart = setMinutes(setHours(selectedDate, startH), startM);
            const currentEnd = setMinutes(setHours(selectedDate, endH), endM);
            if (!dayStartTime || currentStart < dayStartTime) dayStartTime = currentStart;
            if (!dayEndTime || currentEnd > dayEndTime) dayEndTime = currentEnd;
        }
    });

    if (!dayStartTime || !dayEndTime) return [];

    const slots: TimeSlot[] = [];
    let currentTime = dayStartTime;

    while (addMinutes(currentTime, duration) <= dayEndTime) {
        const slotTime = currentTime;
        let isDisabled = false;
        let reason: TimeSlot['reason'] | undefined = undefined;

        if (isPast(slotTime) && !isSameDay(slotTime, new Date())) {
            isDisabled = true;
            reason = 'past';
        }

        if (!isDisabled) {
            const isAnyEmployeeAvailable = employeesToCheck.some(employee => {
                if (!employee) return false;
                const dayOfWeek = weekDaysMap[getDay(selectedDate)];
                const schedule = employee.schedule.find(s => s.day === dayOfWeek);
                if (!schedule || !schedule.active) return false;

                const [startH, startM] = schedule.start_time.split(':').map(Number);
                const [endH, endM] = schedule.end_time.split(':').map(Number);
                const employeeStartTime = setMinutes(setHours(selectedDate, startH), startM);
                const employeeEndTime = setMinutes(setHours(selectedDate, endH), endM);
                
                const slotEndTime = addMinutes(slotTime, duration);

                if (slotTime < employeeStartTime || slotEndTime > employeeEndTime) return false;

                if (schedule.break_start && schedule.break_end) {
                    const [breakStartH, breakStartM] = schedule.break_start.split(':').map(Number);
                    const [breakEndH, breakEndM] = schedule.break_end.split(':').map(Number);
                    const breakStartTime = setMinutes(setHours(selectedDate, breakStartH), breakStartM);
                    const breakEndTime = setMinutes(setHours(selectedDate, breakEndH), breakEndM);
                    if (slotTime < breakEndTime && slotEndTime > breakStartTime) return false;
                }

                const isOccupied = agendamentos.some(apt => 
                    apt.employee_id === employee.id &&
                    isSameDay(parseISO(apt.date), selectedDate) &&
                    (slotTime < parseISO(`${apt.date}T${apt.end_time}`) && slotEndTime > parseISO(`${apt.date}T${apt.start_time}`))
                );
                
                return !isOccupied;
            });

            if (!isAnyEmployeeAvailable) {
                isDisabled = true;
                reason = 'occupied';
            }
        }

        slots.push({ time: format(slotTime, 'HH:mm'), disabled: isDisabled, reason });
        currentTime = addMinutes(currentTime, interval);
    }
    
    return slots;
  }, [selectedDate, selectedItem, selectedEmployee, qualifiedEmployees, funcionarios, agendamentos]);

  const handleConfirmAppointment = async () => {
    if (isConfirmDisabled) return;

    showConfirm({
        title: 'Confirmar Agendamento?',
        message: (
            <div className="text-left text-sm space-y-2">
                <p><strong className="text-light-700 dark:text-dark-300">Serviço:</strong> {selectedItem?.name}</p>
                <p><strong className="text-light-700 dark:text-dark-300">Data:</strong> {`${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}`}</p>
            </div>
        ),
        type: 'confirmation',
        onConfirm: async () => {
            setIsConfirming(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            showAlert({ title: 'Sucesso!', message: 'Agendamento confirmado com sucesso!', type: 'success' });
            setIsConfirming(false);
            navigate('/cliente/agendamentos');
        }
    });
  };

  const isConfirmDisabled = !selectedItem || !selectedEmployee || !selectedTime;

  const firstDayOfMonth = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const daysInGrid = eachDayOfInterval({ start: firstDayOfMonth, end: addDays(firstDayOfMonth, 41) });
  const weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-light-900 dark:text-white">Novo Agendamento</h1>
      <p className="text-light-500 dark:text-dark-400">Siga os passos para agendar seu horário.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-light-900 dark:text-white mb-4 flex items-center"><span className="step-number">1</span><Scissors className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Escolha o Serviço</h2>
          <select onChange={(e) => setSelectedItem(servicos.find(s => s.id === e.target.value) || null)} className="w-full input-style">
            <option value="">Selecione um serviço...</option>
            {servicos.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>)}
          </select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-light-900 dark:text-white mb-4 flex items-center"><span className="step-number">2</span><Briefcase className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Escolha o Profissional</h2>
          <select value={selectedEmployee || 'any'} onChange={e => setSelectedEmployee(e.target.value)} className="w-full input-style" disabled={!selectedItem}>
            {qualifiedEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-light-900 dark:text-white mb-4 flex items-center"><span className="step-number">3</span><Calendar className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Escolha a Data</h2>
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
                  ${!isSameMonth(day, currentMonth) ? 'text-light-400 dark:text-dark-600 opacity-50' : 'text-light-700 dark:text-dark-300'}
                  ${isSameDay(day, selectedDate) ? 'bg-blue-600 text-white' : 'hover:bg-light-200 dark:hover:bg-dark-700'}
                  ${isSameDay(day, new Date()) && !isSameDay(day, selectedDate) ? 'border border-blue-500/50' : ''}
                `}
              >
                <p className="font-bold text-sm">{format(day, 'd')}</p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-light-900 dark:text-white mb-4 flex items-center"><span className="step-number">4</span><Clock className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"/>Horários Disponíveis</h2>
          <div className="max-h-80 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2">
            {selectedItem ? (
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
                <p className="col-span-full text-center text-light-500 dark:text-dark-400 pt-10">Nenhum horário disponível para esta data ou serviço.</p>
              )
            ) : (
              <p className="col-span-full text-center text-light-500 dark:text-dark-400 pt-10">Selecione um serviço para ver os horários.</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-light-100 dark:bg-dark-800 p-6 rounded-xl border border-light-200 dark:border-dark-700">
        <h2 className="text-lg font-semibold text-light-900 dark:text-white mb-4 flex items-center"><span className="step-number">5</span>Resumo do Agendamento</h2>
        
        {planInfo?.hasCredit && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-center flex items-center justify-center space-x-2">
                <Award className="w-5 h-5 text-green-600 dark:text-green-300" />
                <div>
                    <p className="font-semibold text-green-700 dark:text-green-300">Serviço incluso no seu pacote!</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Créditos restantes: {planInfo.remaining} de {planInfo.total}</p>
                </div>
            </div>
        )}
        
        <div className="space-y-2 text-sm text-light-700 dark:text-dark-300">
          <p><strong>Cliente:</strong> {user?.name}</p>
          <p><strong>Serviço:</strong> {selectedItem?.name || '...'}</p>
          <p><strong>Profissional:</strong> {funcionarios.find(f => f.id === selectedEmployee)?.name || 'Qualquer Profissional'}</p>
          <p><strong>Data:</strong> {selectedTime ? `${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}` : '...'}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-light-200 dark:border-dark-700 flex justify-between items-center">
            <span className="text-lg font-bold text-light-900 dark:text-white">Total:</span>
            <span className="text-2xl font-extrabold text-green-500 dark:text-green-400">
                {planInfo?.hasCredit ? 'Incluso' : (selectedItem ? formatCurrency(selectedItem.price) : 'R$ 0,00')}
            </span>
        </div>
        <button onClick={handleConfirmAppointment} disabled={isConfirmDisabled || isConfirming} className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50">
          <Save className="w-5 h-5"/>
          <span>{isConfirming ? 'Validando...' : 'Confirmar Agendamento'}</span>
        </button>
      </motion.div>
    </div>
  );
};

export default NovoAgendamentoCliente;
