import React, { useState } from 'react';
import { Users, Filter, Printer, FileDown, MessageSquare, FileSpreadsheet } from 'lucide-react';
import { formatPhone, formatCpf, formatCurrency } from '../../utils/formatters';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';

const RelatorioCadastros: React.FC = () => {
  const { company, clientes, funcionarios, produtos } = useAuth();
  const [filters, setFilters] = useState({
    type: 'clientes',
    status: 'todos',
  });
  const [reportData, setReportData] = useState<any[] | null>(null);

  const handleGenerateReport = () => {
    let data;
    switch (filters.type) {
      case 'clientes':
        data = clientes.map(c => ({
          Nome: c.name,
          Email: c.email || '-',
          CPF: c.cpf ? formatCpf(c.cpf) : '-',
          Telefone: formatPhone(c.phone),
          Ativo: c.active,
        }));
        break;
      case 'funcionarios':
        data = funcionarios.map(f => ({
          Nome: f.name,
          Telefone: formatPhone(f.phone),
          Especialidades: f.specialties.join(', '),
          Ativo: f.active,
        }));
        break;
      case 'produtos':
        data = produtos.map(p => ({
          Nome: p.name,
          Estoque: p.stock,
          'Estoque Mínimo': p.minStock,
          Preço: formatCurrency(p.price),
          Ativo: p.active,
        }));
        break;
      default:
        data = [];
    }

    if (filters.status !== 'todos') {
      const statusBool = filters.status === 'ativos';
      data = data.filter((item: any) => item.Ativo === statusBool);
    }
    setReportData(data);
  };

  const getReportText = () => {
    if (!reportData) return '';
    return `*Relatório de Cadastros*\n\nTipo: ${filters.type}\nTotal de Itens: *${reportData.length}*`;
  };

  const handleShare = () => {
    if (!reportData || reportData.length === 0) return;
    
    const columns = Object.keys(reportData[0]).map(header => ({
      header: header,
      accessor: header,
      format: (value: any) => (typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value))
    }));

    handleSharePaginatedReport({
      data: reportData,
      columns,
      reportTitle: `Relatório de ${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}`,
      baseReportText: getReportText(),
      company,
    });
  };

  const renderTable = () => {
    if (!reportData || reportData.length === 0) return (
        <div className="text-center py-8 text-light-500 dark:text-dark-400">
            Nenhum dado encontrado para os filtros selecionados.
        </div>
    );

    const headers = Object.keys(reportData[0] || {});
    
    return (
      <table className="w-full text-left">
        <thead className="bg-light-200 dark:bg-dark-700">
          <tr>
            {headers.map(header => (
              <th key={header} className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 capitalize">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.map((item, index) => (
            <tr key={index} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
              {headers.map(header => (
                <td key={header} className="p-3 text-light-700 dark:text-dark-300">
                  {typeof item[header] === 'boolean' ? (item[header] ? 'Sim' : 'Não') : item[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <BackButton />
      </div>
      <div className="flex items-center space-x-3 no-print">
        <Users className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-800 dark:text-white">Relatório de Cadastros</h1>
          <p className="text-light-500 dark:text-dark-400">Exporte listas de clientes, funcionários, etc.</p>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 no-print">
        <h2 className="text-lg font-semibold text-light-800 dark:text-white flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Tipo de Cadastro</label>
            <select value={filters.type} onChange={e => setFilters(p => ({...p, type: e.target.value}))} className="w-full input-style">
              <option value="clientes">Clientes</option>
              <option value="funcionarios">Funcionários</option>
              <option value="produtos">Produtos</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))} className="w-full input-style">
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
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
            <h2 className="text-xl font-bold text-light-800 dark:text-white">Resultados para <span className="capitalize text-blue-500 dark:text-blue-400">{filters.type}</span></h2>
            <div className="flex space-x-2 no-print">
              <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-cadastros.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-cadastros.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {renderTable()}
          </div>
          <PrintFooter />
        </div>
      )}
    </div>
  );
};

export default RelatorioCadastros;
