import React, { useState, useMemo } from 'react';
import { Award, Filter, Printer, FileDown, MessageSquare, Search, FileSpreadsheet } from 'lucide-react';
import DateRangePicker from '../../components/common/DateRangePicker';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';
import { ClientPackage } from '../../types';

const RelatorioPlanos: React.FC = () => {
  const { company, clientes, clientPackages } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    clientId: 'todos',
    status: 'todos',
    recurring: 'todos',
    paymentMethod: 'todos',
  });
  const [reportData, setReportData] = useState<ClientPackage[] | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  
  const filteredClients = useMemo(() => 
    clientSearch 
      ? clientes.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())) 
      : clientes,
    [clientSearch, clientes]
  );

  const handleGenerateReport = () => {
    const filtered = clientPackages.filter(pkg => {
      const activationDate = pkg.activationDate ? parseISO(pkg.activationDate) : null;
      const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
      const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;

      if (activationDate) {
        if (startDate && activationDate < startDate) return false;
        if (endDate && activationDate > endDate) return false;
      } else if (filters.startDate || filters.endDate) {
        return false;
      }
      
      if (filters.clientId !== 'todos' && pkg.clientId !== filters.clientId) return false;
      if (filters.status !== 'todos' && pkg.status !== filters.status) return false;
      if (filters.recurring !== 'todos' && String(pkg.isRecurring) !== filters.recurring) return false;
      
      return true;
    });
    setReportData(filtered.sort((a,b) => parseISO(b.requestDate).getTime() - parseISO(a.requestDate).getTime()));
  };

  const totalValue = reportData ? reportData.reduce((sum, item) => sum + item.planPrice, 0) : 0;

  const getReportText = () => {
    if (!reportData) return '';
    const period = filters.startDate && filters.endDate 
      ? `Período: ${format(new Date(filters.startDate+'T00:00:00'), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate+'T00:00:00'), 'dd/MM/yyyy')}`
      : 'Período: Todos';
    
    return `*Relatório de Pacotes Mensais*\n\n${period}\nValor Total: *${formatCurrency(totalValue)}*`;
  };

  const handleShare = () => {
    if (!reportData) return;

    const columns = [
      { header: 'Cliente', accessor: 'clientName' },
      { header: 'Pacote', accessor: 'planName' },
      { header: 'Data Ativação', accessor: 'activationDate', format: (d: string) => d ? format(parseISO(d), 'dd/MM/yyyy') : '-' },
      { header: 'Status', accessor: 'status', format: (s: string) => s.charAt(0).toUpperCase() + s.slice(1) },
      { header: 'Valor', accessor: 'planPrice', format: (v: number) => formatCurrency(v), align: 'right' as const },
    ];

    handleSharePaginatedReport({
      data: reportData,
      columns: columns,
      reportTitle: 'Relatório de Pacotes Mensais',
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
        <Award className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Relatório de Pacotes Mensais</h1>
          <p className="text-light-500 dark:text-dark-400">Analise as vendas e o status dos pacotes</p>
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
          <div className="relative">
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Cliente</label>
            <input 
              type="text" 
              value={clientSearch} 
              onChange={e => setClientSearch(e.target.value)} 
              className="w-full input-style" 
              placeholder="Buscar cliente..."
              onFocus={() => setClientSearch('')}
              onBlur={() => setTimeout(() => setClientSearch(''), 200)}
            />
            {clientSearch && (
              <div className="absolute z-10 w-full bg-light-100 dark:bg-dark-800 border border-light-300 dark:border-dark-600 rounded-lg mt-1 max-h-40 overflow-y-auto">
                {filteredClients.map(client => (
                  <div key={client.id} onMouseDown={() => { setFilters(p => ({...p, clientId: client.id})); setClientSearch(client.name); }} className="p-2 hover:bg-light-200 dark:hover:bg-dark-700 cursor-pointer text-sm text-light-800 dark:text-dark-200">
                    {client.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="pendente">Pendente</option>
              <option value="em-atraso">Em Atraso</option>
              <option value="expirado">Expirado</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Recorrência</label>
            <select value={filters.recurring} onChange={e => setFilters(p => ({...p, recurring: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
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
              <p className="text-lg font-semibold text-green-500 dark:text-green-400 mt-2">Valor Total: {formatCurrency(totalValue)}</p>
            </div>
            <div className="flex space-x-2 no-print">
              <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-pacotes.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-pacotes.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-200 dark:bg-dark-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Cliente</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Pacote</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Data Ativação</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Status</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(item => (
                  <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                    <td className="p-3 text-light-900 dark:text-white">{item.clientName}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.planName}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.activationDate ? format(parseISO(item.activationDate), 'dd/MM/yyyy') : '-'}</td>
                    <td className="p-3 capitalize text-light-700 dark:text-dark-300">{item.status}</td>
                    <td className="p-3 text-green-500 dark:text-green-400 text-right">{formatCurrency(item.planPrice)}</td>
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

export default RelatorioPlanos;
