import React, { useState } from 'react';
import { BarChart2, Filter, Printer, FileDown, MessageSquare, FileSpreadsheet } from 'lucide-react';
import DateRangePicker from '../../components/common/DateRangePicker';
import { format } from 'date-fns';
import { faker } from '@faker-js/faker';
import { formatCurrency } from '../../utils/formatters';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';

const mockSales = Array.from({ length: 50 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.between({ from: new Date(2025, 8, 1), to: new Date() }),
  client: faker.person.fullName(),
  employee: faker.helpers.arrayElement(['Barbeiro Zé', 'Manicure Ana']),
  item: faker.commerce.productName(),
  value: parseFloat(faker.commerce.price()),
}));

const RelatorioVendas: React.FC = () => {
  const { company } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employee: 'todos',
    client: '',
  });
  const [reportData, setReportData] = useState<any[] | null>(null);

  const handleGenerateReport = () => {
    const filtered = mockSales.filter(sale => {
      const saleDate = new Date(sale.date);
      const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
      const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;

      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;
      if (filters.employee !== 'todos') {
        const selectedEmployeeName = filters.employee === 'ze' ? 'Barbeiro Zé' : 'Manicure Ana';
        if (sale.employee !== selectedEmployeeName) return false;
      }
      if (filters.client && !sale.client.toLowerCase().includes(filters.client.toLowerCase())) return false;
      
      return true;
    });
    setReportData(filtered.sort((a,b) => b.date.getTime() - a.date.getTime()));
  };
  
  const totalSales = reportData ? reportData.reduce((sum, item) => sum + item.value, 0) : 0;

  const getReportText = () => {
    if (!reportData) return '';
    const period = filters.startDate && filters.endDate 
      ? `Período: ${format(new Date(filters.startDate+'T00:00:00'), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate+'T00:00:00'), 'dd/MM/yyyy')}`
      : 'Período: Todos';
    
    return `*Relatório de Vendas*\n\n${period}\nTotal de Vendas: *${formatCurrency(totalSales)}*`;
  };

  const handleShare = () => {
    if (!reportData) return;

    const columns = [
      { header: 'Data', accessor: 'date', format: (d: Date) => format(new Date(d), 'dd/MM/yyyy') },
      { header: 'Cliente', accessor: 'client' },
      { header: 'Funcionário', accessor: 'employee' },
      { header: 'Item Vendido', accessor: 'item' },
      { header: 'Valor', accessor: 'value', format: (v: number) => formatCurrency(v), align: 'right' as const },
    ];

    handleSharePaginatedReport({
      data: reportData,
      columns: columns,
      reportTitle: 'Relatório de Vendas',
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
        <BarChart2 className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Relatório de Vendas</h1>
          <p className="text-light-500 dark:text-dark-400">Analise suas vendas com filtros detalhados</p>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 no-print">
        <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Cliente</label>
            <input type="text" value={filters.client} onChange={e => setFilters(p => ({...p, client: e.target.value}))} className="w-full input-style" placeholder="Nome do cliente"/>
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
              <p className="text-lg font-semibold text-green-500 dark:text-green-400 mt-2">Total de Vendas: {formatCurrency(totalSales)}</p>
            </div>
            <div className="flex space-x-2 no-print">
              <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-vendas.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-vendas.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-200 dark:bg-dark-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Data</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Cliente</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Funcionário</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Item Vendido</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(item => (
                  <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                    <td className="p-3 text-light-900 dark:text-dark-200">{format(item.date, 'dd/MM/yyyy')}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.client}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.employee}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.item}</td>
                    <td className="p-3 text-green-500 dark:text-green-400 text-right">{formatCurrency(item.value)}</td>
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

export default RelatorioVendas;
