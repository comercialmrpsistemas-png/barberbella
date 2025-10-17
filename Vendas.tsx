import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ArrowUp, ArrowDown, CalendarCheck, User, X } from 'lucide-react';
import { usePdvState } from '../hooks/usePdvState';
import ClientSearch from '../components/pdv/ClientSearch';
import ItemList from '../components/pdv/ItemList';
import Cart from '../components/pdv/Cart';
import PaymentModal from '../components/pdv/PaymentModal';
import CashOperationModal from '../components/pdv/CashOperationModal';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, Sale } from '../types';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useModal } from '../contexts/ModalContext';

const Vendas: React.FC = () => {
  const { state, selectClient, startWalkInSale, addItemToCart, removeItemFromCart, updateItemQuantity, assignEmployeeToItem, startPayment, completeSale, resetPdv, importAppointment, subtotal, total, finalDiscount, applyVoucher, applyManualDiscount, removeDiscount } = usePdvState();
  const { agendamentos, clientes, servicos, funcionarios } = useAuth();
  const { showConfirm } = useModal();
  const [cashOp, setCashOp] = useState<{ type: 'sangria' | 'suprimento'; isOpen: boolean } | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const handleCompleteSale = (payments: { method: string; amount: number }[]) => {
    const sale = completeSale(payments);
    if (sale) {
        setCompletedSale(sale);
    } else {
        console.error("A venda não pôde ser concluída.");
    }
  };

  const handleNewSale = () => {
    setCompletedSale(null);
    resetPdv();
  };
  
  const handleImportAppointment = (apt: Appointment) => {
    const client = clientes.find(c => c.id === apt.client_id);
    const service = servicos.find(s => s.id === apt.service_id);
    const employee = funcionarios.find(f => f.id === apt.employee_id);
    if (client && service && employee) {
        importAppointment(apt, client, service, employee);
        setIsAppointmentModalOpen(false);
    }
  };
  
  const handleCancelSale = () => {
    if (state.cart.length === 0 && !state.client) return;
    showConfirm({
        title: 'Cancelar Venda?',
        message: 'Tem certeza que deseja cancelar a venda em andamento? Todos os itens do carrinho e o cliente selecionado serão removidos.',
        type: 'warning',
        onConfirm: () => {
            resetPdv();
        }
    });
  };

  const todaysAppointments = agendamentos.filter(apt => isSameDay(parseISO(apt.date), new Date()) && apt.status === 'agendado');

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-light-900 dark:text-white">PDV - Ponto de Venda</h1>
            <p className="text-sm text-light-500 dark:text-dark-400">Realize vendas de produtos e serviços.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsAppointmentModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-light-200 dark:bg-dark-700 text-sm font-semibold rounded-lg hover:bg-light-300 dark:hover:bg-dark-600">
            <CalendarCheck className="w-5 h-5 text-blue-500" />
            Importar Agendamento
          </button>
          <button onClick={() => setCashOp({ type: 'suprimento', isOpen: true })} className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/50 text-sm font-semibold text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800">
            <ArrowUp className="w-5 h-5" />
            Suprimento
          </button>
          <button onClick={() => setCashOp({ type: 'sangria', isOpen: true })} className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/50 text-sm font-semibold text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800">
            <ArrowDown className="w-5 h-5" />
            Sangria
          </button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div layout className="md:col-span-2">
            <ClientSearch 
              selectedClient={state.client} 
              onSelectClient={selectClient}
            />
          </motion.div>
          <motion.div layout className="md:col-span-2">
            <ItemList onAddItem={addItemToCart} isWalkIn={state.client === null} />
          </motion.div>
        </div>

        <motion.div layout>
          <Cart
            cart={state.cart}
            subtotal={subtotal}
            total={total}
            discount={finalDiscount}
            voucherCode={state.voucherCode}
            onRemoveItem={removeItemFromCart}
            onUpdateQuantity={updateItemQuantity}
            onAssignEmployee={assignEmployeeToItem}
            onStartPayment={startPayment}
            onApplyVoucher={applyVoucher}
            onApplyManualDiscount={applyManualDiscount}
            onRemoveDiscount={removeDiscount}
            isWalkIn={state.client === null}
            onCancelSale={handleCancelSale}
          />
        </motion.div>
      </div>

      {state.status === 'paying' && (
        <PaymentModal
          total={total}
          isOpen={state.status === 'paying'}
          onClose={resetPdv}
          onCompleteSale={handleCompleteSale}
        />
      )}

      {cashOp?.isOpen && (
        <CashOperationModal
          type={cashOp.type}
          isOpen={cashOp.isOpen}
          onClose={() => setCashOp(null)}
        />
      )}

      <ReceiptModal
          isOpen={!!completedSale}
          onClose={handleNewSale}
          sale={completedSale}
          onNewSale={handleNewSale}
          context="pdv"
      />
      
      {isAppointmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsAppointmentModalOpen(false)}>
            <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-light-900 dark:text-white">Importar Agendamento do Dia</h2>
                    <button onClick={() => setIsAppointmentModalOpen(false)} className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-700"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex-grow overflow-y-auto space-y-3">
                    {todaysAppointments.length > 0 ? todaysAppointments.map(apt => {
                        const client = clientes.find(c => c.id === apt.client_id);
                        const service = servicos.find(s => s.id === apt.service_id);
                        const employee = funcionarios.find(f => f.id === apt.employee_id);
                        return (
                            <button 
                                key={apt.id} 
                                onClick={() => handleImportAppointment(apt as Appointment)}
                                className="w-full text-left p-4 bg-light-200 dark:bg-dark-700 rounded-lg hover:bg-light-300 dark:hover:bg-dark-600 transition-colors flex items-center gap-4"
                            >
                                <div className="text-center border-r border-light-300 dark:border-dark-600 pr-4">
                                    <p className="font-bold text-lg text-blue-500 dark:text-blue-400">{apt.start_time}</p>
                                    <p className="text-xs text-light-500 dark:text-dark-400">{format(parseISO(apt.date), 'dd/MM', { locale: ptBR })}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-light-900 dark:text-white">{client?.name}</p>
                                    <p className="text-sm text-light-600 dark:text-dark-300">{service?.name} com {employee?.name}</p>
                                </div>
                            </button>
                        )
                    }) : <p className="text-center text-light-500 dark:text-dark-400 py-8">Nenhum agendamento para hoje.</p>}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Vendas;
