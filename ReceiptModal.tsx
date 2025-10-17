import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, MessageSquare, ShoppingCart } from 'lucide-react';
import { Sale } from '../../types';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import PrintFooter from './PrintFooter';
import { handlePrint, handleShareImage } from '../../utils/reportUtils';
import { useAuth } from '../../contexts/AuthContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onNewSale?: () => void;
  context: 'pdv' | 'history';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale, onNewSale, context }) => {
  const { company } = useAuth();
  if (!sale) return null;

  const receiptId = `receipt-content-${sale.id}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-light-100 dark:bg-dark-800 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-light-300 dark:border-dark-700 flex justify-between items-center no-print">
              <h2 className="font-semibold text-lg text-light-900 dark:text-white">Comprovante de Venda</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-light-200 dark:hover:bg-dark-700"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6" id="print-area">
              <div id={receiptId} className="max-w-xs mx-auto bg-white text-black p-4 font-mono text-sm">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">{company?.name || 'Barber e Bella'}</h3>
                  <p className="text-xs">{company?.address}</p>
                  <p className="text-xs">CNPJ: {company?.document}</p>
                  <p className="text-xs">Tel: {company?.phone}</p>
                </div>
                <div className="border-t border-b border-black my-2 py-1">
                  <p>COMPROVANTE DE VENDA</p>
                  <div className="flex justify-between">
                    <span>{format(new Date(sale.created_at), 'dd/MM/yyyy')}</span>
                    <span>{format(new Date(sale.created_at), 'HH:mm:ss')}</span>
                  </div>
                </div>
                <table className="w-full my-2">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="text-left">Item</th>
                      <th className="text-right">Qtd</th>
                      <th className="text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map(item => (
                      <tr key={item.id}>
                        <td className="text-left">{item.name}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{item.coveredByPlan ? '(Pacote)' : formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-black pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(sale.subtotal)}</span>
                  </div>
                  {sale.discount > 0 && <div className="flex justify-between"><span>Desconto</span><span>- {formatCurrency(sale.discount)}</span></div>}
                  {sale.markup > 0 && <div className="flex justify-between"><span>Acréscimo</span><span>+ {formatCurrency(sale.markup)}</span></div>}
                  {sale.packageCredit > 0 && <div className="flex justify-between"><span>Crédito Pacote</span><span>- {formatCurrency(sale.packageCredit)}</span></div>}
                  <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL</span>
                    <span>{formatCurrency(sale.total)}</span>
                  </div>
                </div>
                <div className="border-t border-black mt-2 pt-2">
                  <p className="font-bold">Pagamento:</p>
                  {sale.payments.map((p, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{p.method}</span>
                      <span>{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4 text-xs">
                  <p>Obrigado pela preferência!</p>
                  <PrintFooter />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-light-300 dark:border-dark-700 flex flex-wrap justify-center gap-2 no-print">
              {context === 'pdv' && onNewSale && (
                <button onClick={onNewSale} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  <ShoppingCart className="w-5 h-5"/>
                  <span>Nova Venda</span>
                </button>
              )}
              <button onClick={() => handleShareImage(receiptId, `comprovante-${sale.id}.png`)} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5"/>
                <span>WhatsApp</span>
              </button>
              <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-4 py-2 bg-light-200 dark:bg-dark-700 hover:bg-light-300 dark:hover:bg-dark-600 text-light-800 dark:text-white font-semibold rounded-lg transition-colors">
                <Printer className="w-5 h-5"/>
                <span>Imprimir</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
