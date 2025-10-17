import React, { useState } from 'react';
import { Percent, Filter, Printer, FileDown, MessageSquare, FileSpreadsheet } from 'lucide-react';
import DateRangePicker from '../../components/common/DateRangePicker';
import { format, subDays } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';

const mockCommissions = [
  { employee: 'Barbeiro Zé', services: 2500, products: 350, commissionRate: '40%', commissionValue: 1140, date: new Date() },
  { employee: 'Manicure Ana', services: 1800, products: 500, commissionRate: '50%', commissionValue: 1150, date: subDays(new Date(), 1) },
  { employee: 'Barbeiro Zé', services: 3200, products: 450, commissionRate: '40%', commissionValue: 1460, date: subDays(new Date(), 8) },
];

const RelatorioComissao: React.FC = () => {
  const { company } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employee: 'todos',
  });
  const [reportData, setReportData] = useState<any[] | null>(null);

  const handleGenerateReport = () => {
    const filtered = mockCommissions.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
      const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;

      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      
      if (filters.employee !== 'todos') {
        const selectedEmployeeName = filters.employee === 'ze' ? 'Barbeiro Zé' : 'Manicure Ana';
        if (item.employee !== selectedEmployeeName) return false;
      }
      
      return true;
    });
    setReportData(filtered);
  };
  
  const totalCommission = reportData ? reportData.reduce((sum, item) => sum + item.commissionValue, 0) : 0;

  const getReportText = () => {
    if (!reportData) return '';
    const period = filters.startDate && filters.endDate 
      ? `Período: ${format(new Date(filters.startDate+'T00:00:00'), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate+'T00:00:00'), 'dd/MM/yyyy')}`
      : 'Período: Todos';
    
    return `*Relatório de Comissão*\n\n${period}\nTotal de Comissões: *${formatCurrency(totalCommission)}*`;
  };

  const handleShare = () => {
    if (!reportData) return;

    const columns = [
      { header: 'Funcionário', accessor: 'employee' },
      { header: 'Vendas (Serviços)', accessor: 'services', format: (v: number) => formatCurrency(v), align: 'right' as const },
      { header: 'Vendas (Produtos)', accessor: 'products', format: (v: number) => formatCurrency(v), align: 'right' as const },
      { header: 'Taxa Comissão', accessor: 'commissionRate', align: 'right' as const },
      { header: 'Valor Comissão', accessor: 'commissionValue', format: (v: number) => formatCurrency(v), align: 'right' as const },
    ];

    handleSharePaginatedReport({
      data: reportData,
      columns: columns,
      reportTitle: 'Relatório de Comissão',
      baseReportText: getReportText(),
      company,
    });
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <BackButton />
      </div>
      <div className="flex items-center space-x-3 no-print">
        <Percent className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Relatório de Comissão</h1>
          <p className="text-light-500 dark:text-dark-400">Calcule as comissões dos seus funcionários</p>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 no-print">
        <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateRangePicker 
            startDate={filters.startDate}
            endDate={filters.endDate}
            onStartDateChange={(d) => setFilters(p => ({...p, startDate: d}))}
            onEndDateChange={(d) => setFilters(p => ({...p, endDate: d}))}
          />
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Funcionário</label>
            <select value={filters.employee} onChange={e => setFilters(p => ({...p, employee: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="ze">Barbeiro Zé</option>
              <option value="ana">Manicure Ana</option>
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
              <h2 className="text-xl font-bold text-light-900 dark:text-dark-200">Resultados</h2>
              <p className="text-light-500 dark:text-dark-400">
                {filters.startDate && filters.endDate ? `Período de ${format(new Date(filters.startDate+'T00:00:00'), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate+'T00:00:00'), 'dd/MM/yyyy')}` : 'Todos os períodos'}
              </p>
              <p className="text-lg font-semibold text-green-500 dark:text-green-400 mt-2">Total de Comissões: {formatCurrency(totalCommission)}</p>
            </div>
            <div className="flex space-x-2 no-print">
              <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-comissao.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-comissao.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-200 dark:bg-dark-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Funcionário</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Vendas (Serviços)</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Vendas (Produtos)</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Taxa Comissão</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Valor Comissão</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(item => (
                  <tr key={item.employee} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                    <td className="p-3 text-light-900 dark:text-dark-200">{item.employee}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300 text-right">{formatCurrency(item.services)}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300 text-right">{formatCurrency(item.products)}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300 text-right">{item.commissionRate}</td>
                    <td className="p-3 text-green-500 dark:text-green-400 font-bold text-right">{formatCurrency(item.commissionValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PrintFooter />
        </div>
      )}
    </div>
  );
};

export default RelatorioComissao;
