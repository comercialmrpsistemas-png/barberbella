import React, { useState } from 'react';
import { Ticket, Filter, Printer, FileDown, MessageSquare, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Voucher } from '../../types';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { toDDMMYYYY } from '../../utils/formatters';

const RelatorioVouchers: React.FC = () => {
  const { company, vouchers } = useAuth();
  const [filters, setFilters] = useState({ status: 'todos', type: 'todos', eligibility: 'todos' });
  const [reportData, setReportData] = useState<Voucher[] | null>(null);

  const handleGenerateReport = () => {
    const filtered = vouchers.filter(voucher => {
      if (filters.status !== 'todos' && String(voucher.active) !== filters.status) return false;
      if (filters.type !== 'todos' && voucher.type !== filters.type) return false;
      if (filters.eligibility !== 'todos' && voucher.eligibility !== filters.eligibility) return false;
      return true;
    });
    setReportData(filtered);
  };

  const getReportText = () => {
    if (!reportData) return '';
    return `*Relatório de Vouchers*\n\nTotal de Vouchers: *${reportData.length}*`;
  };

  const handleShare = () => {
    if (!reportData) return;
    const columns = [
      { header: 'Nome', accessor: 'name' },
      { header: 'Código', accessor: 'code' },
      { header: 'Tipo', accessor: 'type', format: (v: string) => v === 'value' ? 'Valor Fixo' : 'Porcentagem' },
      { header: 'Valor', accessor: 'value', format: (v: number, row: Voucher) => row.type === 'value' ? `R$ ${v.toFixed(2)}` : `${v}%`, align: 'right' as const },
      { header: 'Validade', accessor: 'validTo', format: (d: string) => `Até ${toDDMMYYYY(d)}` },
      { header: 'Status', accessor: 'active', format: (s: boolean) => s ? 'Ativo' : 'Inativo' },
    ];
    handleSharePaginatedReport({ data: reportData, columns, reportTitle: 'Relatório de Vouchers', baseReportText: getReportText(), company });
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <BackButton />
      </div>
      <div className="flex items-center space-x-3 no-print">
        <Ticket className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Relatório de Vouchers</h1>
          <p className="text-light-500 dark:text-dark-400">Analise os vouchers cadastrados no sistema.</p>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 no-print">
        <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Tipo</label>
            <select value={filters.type} onChange={e => setFilters(p => ({...p, type: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="value">Valor Fixo (R$)</option>
              <option value="percentage">Porcentagem (%)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Regra de Elegibilidade</label>
            <select value={filters.eligibility} onChange={e => setFilters(p => ({...p, eligibility: e.target.value}))} className="w-full input-style">
              <option value="todos">Todas as Regras</option>
              <option value="all">Todos os Clientes</option>
              <option value="new_clients">Novos Clientes</option>
              <option value="birthday_month">Aniversariantes</option>
              <option value="fidelity">Fidelidade</option>
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
                Total de vouchers encontrados: {reportData.length}
              </p>
            </div>
            <div className="flex space-x-2 no-print">
              <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-vouchers.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-vouchers.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-200 dark:bg-dark-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Código</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Tipo</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Valor</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Validade</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(item => (
                  <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                    <td className="p-3 text-light-900 dark:text-dark-200">{item.name}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300 font-mono">{item.code}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{item.type === 'value' ? 'Valor Fixo' : 'Porcentagem'}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300 text-right">{item.type === 'value' ? `R$ ${item.value.toFixed(2)}` : `${item.value}%`}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{toDDMMYYYY(item.validTo)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.active ? 'bg-green-100 dark:bg-green-600/20 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-600/20 text-red-800 dark:text-red-400'}`}>
                        {item.active ? 'Ativo' : 'Inativo'}
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

export default RelatorioVouchers;
