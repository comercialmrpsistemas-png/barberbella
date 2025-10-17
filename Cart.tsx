import React, { useState } from 'react';
import { ShoppingCart, User, X, Award, Ticket, Percent, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CartProps {
  cart: CartItem[];
  subtotal: number;
  total: number;
  discount: number;
  voucherCode: string | null;
  isWalkIn: boolean;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onAssignEmployee: (itemId: string, employeeId: string) => void;
  onStartPayment: () => void;
  onApplyVoucher: (code: string) => { success: boolean; message: string };
  onApplyManualDiscount: (discount: number, type: 'value' | 'percentage') => { success: boolean; message: string };
  onRemoveDiscount: () => void;
  onCancelSale: () => void;
}

const Cart: React.FC<CartProps> = ({
  cart,
  subtotal,
  total,
  discount,
  voucherCode,
  isWalkIn,
  onRemoveItem,
  onUpdateQuantity,
  onAssignEmployee,
  onStartPayment,
  onApplyVoucher,
  onApplyManualDiscount,
  onRemoveDiscount,
  onCancelSale
}) => {
  const { funcionarios } = useAuth();
  const [voucherInput, setVoucherInput] = useState('');
  const [manualDiscountInput, setManualDiscountInput] = useState('');
  const [manualDiscountType, setManualDiscountType] = useState<'value' | 'percentage'>('value');

  const handleApplyVoucher = () => {
    const result = onApplyVoucher(voucherInput);
    if (result.success) {
      setVoucherInput('');
    }
    // You might want to show an alert with result.message
  };

  const handleApplyManualDiscount = () => {
    const value = parseFloat(manualDiscountInput);
    if (!isNaN(value)) {
      onApplyManualDiscount(value, manualDiscountType);
      setManualDiscountInput('');
    }
  };

  return (
    <div className="bg-light-100 dark:bg-dark-800 rounded-lg border border-light-200 dark:border-dark-700 flex flex-col h-full">
      <div className="p-4 border-b border-light-200 dark:border-dark-700">
        <h2 className="text-lg font-bold text-light-900 dark:text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-500" />
          Carrinho
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="text-center py-10 text-light-500 dark:text-dark-400">
            <p>O carrinho está vazio.</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="bg-light-50 dark:bg-dark-900/50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-light-900 dark:text-white flex items-center gap-2">
                  {item.coveredByPlan && <Award className="w-4 h-4 text-yellow-500" title="Incluso no pacote" />}
                  {item.type === 'package' && <Award className="w-4 h-4 text-yellow-500" />}
                  {item.name}
                </p>
                <button onClick={() => onRemoveItem(item.id)} className="p-1 text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {item.type !== 'package' ? (
                <>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {!item.coveredByPlan && (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => onUpdateQuantity(item.id, parseInt(e.target.value))}
                          className="w-16 input-style py-1 text-sm text-center"
                          min="1"
                        />
                      )}
                      <p className="text-sm text-light-500 dark:text-dark-400">
                        {item.coveredByPlan ? '1 un.' : `x ${formatCurrency(item.price)}`}
                      </p>
                    </div>
                    <p className="font-bold text-light-800 dark:text-white">
                      {item.coveredByPlan ? 'Incluso no Pacote' : formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  {item.type !== 'product' && (
                    <div className="mt-2">
                        <div className="relative">
                            <User className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-400 dark:text-dark-500"/>
                            <select
                                value={item.employeeId || ''}
                                onChange={e => onAssignEmployee(item.id, e.target.value)}
                                className="w-full input-style py-1 pl-8 text-sm"
                            >
                                <option value="">Atribuir funcionário...</option>
                                {funcionarios.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="font-bold text-light-800 dark:text-white mt-2">{formatCurrency(item.price)}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-light-200 dark:border-dark-700 space-y-3">
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <Ticket className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-400 dark:text-dark-500"/>
                    <input 
                      type="text" 
                      value={voucherInput} 
                      onChange={e => setVoucherInput(e.target.value)} 
                      placeholder="Código do Voucher" 
                      className="input-style w-full py-1 text-sm pl-8 disabled:bg-light-200 dark:disabled:bg-dark-700"
                      disabled={isWalkIn}
                      title={isWalkIn ? 'Selecione um cliente para aplicar vouchers' : ''}
                    />
                </div>
                <button onClick={handleApplyVoucher} className="px-3 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50" disabled={isWalkIn}>Aplicar</button>
            </div>
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <Percent className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-light-400 dark:text-dark-500"/>
                    <input type="number" value={manualDiscountInput} onChange={e => setManualDiscountInput(e.target.value)} placeholder="Desconto Manual" className="input-style w-full py-1 text-sm pl-8"/>
                </div>
                <select value={manualDiscountType} onChange={e => setManualDiscountType(e.target.value as 'value' | 'percentage')} className="input-style w-20 px-3 py-1 text-sm">
                    <option value="value">R$</option>
                    <option value="percentage">%</option>
                </select>
                <button onClick={handleApplyManualDiscount} className="px-3 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">Aplicar</button>
            </div>
        </div>

        <div className="flex justify-between text-sm text-light-600 dark:text-dark-300">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
            <div className="flex justify-between text-sm text-red-500 dark:text-red-400">
                <div className="flex items-center gap-1">
                    <span>Desconto {voucherCode && `(${voucherCode})`}</span>
                    <button onClick={onRemoveDiscount} className="p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 className="w-3 h-3"/></button>
                </div>
                <span>- {formatCurrency(discount)}</span>
            </div>
        )}
        <div className="flex justify-between text-xl font-bold text-light-900 dark:text-white">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex gap-2 mt-4">
            <button
                onClick={onCancelSale}
                disabled={cart.length === 0 && isWalkIn}
                className="w-1/3 py-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Cancelar
            </button>
            <button
                onClick={onStartPayment}
                disabled={cart.length === 0}
                className="w-2/3 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Finalizar Venda
            </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
