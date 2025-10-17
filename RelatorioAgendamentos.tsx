import React, { useState } from 'react';
import { Calendar, Filter, Printer, FileDown, MessageSquare, FileSpreadsheet } from 'lucide-react';
import DateRangePicker from '../../components/common/DateRangePicker';
import { format } from 'date-fns';
import { faker } from '@faker-js/faker';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';

const mockAppointments = Array.from({ length: 50 }, () => ({
  id: faker.string.uuid(),
  date: faker.date.between({ from: new Date(2025, 8, 1), to: new Date() }),
  client: faker.person.fullName(),
  employee: faker.helpers.arrayElement(['Barbeiro Zé', 'Manicure Ana']),
  service: faker.helpers.arrayElement(['Corte', 'Barba', 'Manicure']),
  status: faker.helpers.arrayElement(['Concluído', 'Cancelado', 'Agendado']),
}));

const RelatorioAgendamentos: React.FC = () => {
  const { company } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employee: 'todos',
    status: 'todos',
  });
  const [reportData, setReportData] = useState<any[] | null>(null);

  const handleGenerateReport = () => {
    const filtered = mockAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
      const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;

      if (startDate && aptDate < startDate) return false;
      if (endDate && aptDate > endDate) return false;
      if (filters.employee !== 'todos') {
        const selectedEmployeeName = filters.employee === 'ze' ? 'Barbeiro Zé' : 'Manicure Ana';
        if (apt.employee !== selectedEmployeeName) return false;
      }
      if (filters.status !== 'todos' && apt.status.toLowerCase() !== filters.status) return false;
      
      return true;
    });
    setReportData(filtered.sort((a,b) => b.date.getTime() - a.date.getTime()));
  };

  const getReportText = () => {
    if (!reportData) return '';
    const period = filters.startDate && filters.endDate 
      ? `Período: ${format(new Date(filters.startDate+'T00:00:00'), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate+'T00:00:00'), 'dd/MM/yyyy')}`
      : 'Período: Todos';
    
    return `*Relatório de Agendamentos*\n\n${period}\nTotal de Agendamentos: *${reportData.length}*`;
  };

  const handleShare = () => {
    if (!reportData) return;

    const columns = [
      { header: 'Data', accessor: 'date', format: (d: Date) => format(new Date(d), 'dd/MM/yyyy') },
      { header: 'Cliente', accessor: 'client' },
      { header: 'Serviço', accessor: 'service' },
      { header: 'Funcionário', accessor: 'employee' },
      { header: 'Status', accessor: 'status' },
    ];

    handleSharePaginatedReport({
      data: reportData,
      columns: columns,
      reportTitle: 'Relatório de Agendamentos',
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
        <Calendar className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-800 dark:text-white">Relatório de Agendamentos</h1>
          <p className="text-light-500 dark:text-dark-400">Monitore os status dos agendamentos</p>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 no-print">
        <h2 className="text-lg font-semibold text-light-800 dark:text-white flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
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
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
              <option value="agendado">Agendado</option>
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
              <p className="text-light-500 dark:text-dark-400">
                {filters.startDate && filters.endDate ? `Período de ${format(new Date(filters.startDate+'T00:00:00'), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate+'T00:00:00'), 'dd/MM/yyyy')}` : 'Todos os períodos'}
              </p>
            </div>
            <div className="flex space-x-2 no-print">
              <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-agendamentos.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-agendamentos.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-200 dark:bg-dark-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Data</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Cliente</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Serviço</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Funcionário</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(item => (
                  <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                    <td className="p-3 text-light-900 dark:text-white">{format(item.date, 'dd/MM/yyyy')}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.client}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.service}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.employee}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'Concluído' ? 'bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-400' :
                        item.status === 'Cancelado' ? 'bg-red-100 dark:bg-red-600/20 text-red-800 dark:text-red-400' :
                        'bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
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

export default RelatorioAgendamentos;
