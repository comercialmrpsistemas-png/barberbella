import React, { useState } from 'react';
import { BookCheck, Filter, Printer, FileDown, MessageSquare, FileSpreadsheet } from 'lucide-react';
import DateRangePicker from '../../components/common/DateRangePicker';
import { format, subDays } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import { handlePrint, handleExportPDF, handleExportCSV, handleShareReportAsImage } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';

const mockFechamentos = [
  { id: '1', date: new Date(), operator: 'Admin Barbearia', systemValue: 150.50, countedValue: 150.50, difference: 0, totalSales: 550.50, packageDebits: 40, cashMovements: { initial: 50, supplies: 20, withdrawals: 10 }, payments: { Dinheiro: 150.50, Pix: 200, 'Cartão de Crédito': 160 } },
  { id: '2', date: subDays(new Date(), 1), operator: 'Admin Barbearia', systemValue: 210.00, countedValue: 209.50, difference: -0.50, totalSales: 780, packageDebits: 0, cashMovements: { initial: 50, supplies: 0, withdrawals: 50 }, payments: { Dinheiro: 210, Pix: 300, 'Cartão de Débito': 270 } },
  { id: '3', date: subDays(new Date(), 2), operator: 'Admin Barbearia', systemValue: 180.00, countedValue: 181.00, difference: 1.00, totalSales: 620, packageDebits: 80, cashMovements: { initial: 50, supplies: 0, withdrawals: 0 }, payments: { Dinheiro: 180, Pix: 200, 'Cartão de Crédito': 160 } },
];

const RelatorioFechamentos: React.FC = () => {
  const { company } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    operator: 'todos',
  });
  const [reportData, setReportData] = useState<any[] | null>(null);

  const handleGenerateReport = () => {
    const filtered = mockFechamentos.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
      const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;

      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      if (filters.operator !== 'todos' && item.operator !== filters.operator) return false;
      
      return true;
    });
    setReportData(filtered.sort((a,b) => b.date.getTime() - a.date.getTime()));
  };
  
  const totalValue = reportData ? reportData.reduce((sum, item) => sum + item.totalSales, 0) : 0;

  const getReportText = () => {
    if (!reportData) return '';
    const period = filters.startDate && filters.endDate 
      ? `Período: ${format(new Date(filters.startDate+'T00:00:00'), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate+'T00:00:00'), 'dd/MM/yyyy')}`
      : 'Período: Todos';
    
    return `*Relatório de Fechamentos de Caixa*\n\n${period}\nValor Total de Vendas: *${formatCurrency(totalValue)}*`;
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <BackButton />
      </div>
      <div className="flex items-center space-x-3 no-print">
        <BookCheck className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-800 dark:text-white">Relatório de Fechamentos</h1>
          <p className="text-light-500 dark:text-dark-400">Consulte o histórico de fechamentos de caixa</p>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 no-print">
        <h2 className="text-lg font-semibold text-light-800 dark:text-white flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateRangePicker 
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(d) => setFilters(p => ({...p, startDate: d}))}
            onEndDateChange={(d) => setFilters(p => ({...p, endDate: d}))}
          />
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Operador</label>
            <select value={filters.operator} onChange={e => setFilters(p => ({...p, operator: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="Admin Barbearia">Admin Barbearia</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleGenerateReport} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Gerar Relatório
          </button>
        </div>
      </div>

      {reportData && (
        <div id="print-area" className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-light-800 dark:text-white">Resultados</h2>
              <p className="text-lg font-semibold text-green-500 dark:text-green-400 mt-2">Valor Total de Vendas: {formatCurrency(totalValue)}</p>
            </div>
            <div className="flex space-x-2 no-print">
              <button onClick={() => handleShareReportAsImage('print-area', getReportText())} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-fechamentos.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-fechamentos.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="space-y-4">
            {reportData.map(item => (
              <div key={item.id} className="bg-light-200 dark:bg-dark-700 rounded-lg p-4">
                <div className="w-full text-left grid grid-cols-4 gap-4 items-center mb-4">
                  <span className="text-light-900 dark:text-white font-semibold">{format(item.date, 'dd/MM/yyyy')}</span>
                  <span className="text-light-700 dark:text-dark-300">{item.operator}</span>
                  <span className="text-light-700 dark:text-dark-300 text-right font-semibold">{formatCurrency(item.totalSales)}</span>
                  <span className={`text-right font-bold ${item.difference > 0 ? 'text-green-500' : item.difference < 0 ? 'text-red-500' : 'text-light-700 dark:text-dark-300'}`}>
                    {formatCurrency(item.difference)}
                  </span>
                </div>
                <div className="p-4 border-t border-light-300 dark:border-dark-600 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2 text-light-800 dark:text-dark-200">Resumo Financeiro</h4>
                    <div className="space-y-1 text-light-600 dark:text-dark-400">
                      <div className="flex justify-between"><span>Vendas Totais:</span> <span>{formatCurrency(item.totalSales)}</span></div>
                      <div className="flex justify-between"><span>Recebido (Líquido):</span> <span>{formatCurrency(Object.values(item.payments).reduce((a: any, b: any) => a + b, 0))}</span></div>
                      <div className="flex justify-between"><span>Débito de Pacotes:</span> <span>{formatCurrency(item.packageDebits)}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-light-800 dark:text-dark-200">Movimentações de Caixa</h4>
                    <div className="space-y-1 text-light-600 dark:text-dark-400">
                      <div className="flex justify-between"><span>Troco Inicial:</span> <span>{formatCurrency(item.cashMovements.initial)}</span></div>
                      <div className="flex justify-between"><span>Suprimentos:</span> <span>{formatCurrency(item.cashMovements.supplies)}</span></div>
                      <div className="flex justify-between"><span>Sangrias (Retiradas):</span> <span>-{formatCurrency(item.cashMovements.withdrawals)}</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-light-800 dark:text-dark-200">Recebimentos por Forma</h4>
                    <div className="space-y-1 text-light-600 dark:text-dark-400">
                      {Object.entries(item.payments).map(([method, value]) => (
                        <div key={method} className="flex justify-between"><span>{method}:</span> <span>{formatCurrency(value as number)}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PrintFooter />
        </div>
      )}
    </div>
  );
};

export default RelatorioFechamentos;
