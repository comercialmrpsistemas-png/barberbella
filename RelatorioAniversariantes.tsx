import React, { useState } from 'react';
import { Gift, Filter, Printer, FileDown, MessageSquare, Send, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { toDDMMYYYY, formatPhone } from '../../utils/formatters';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport, handleShareWhatsApp } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';
import { Client } from '../../types';
import { useModal } from '../../contexts/ModalContext';

const months = [
  { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' }, { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' }, { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
];

const RelatorioAniversariantes: React.FC = () => {
  const { company, clientes, birthdayConfig, vouchers } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [filters, setFilters] = useState({
    month: format(new Date(), 'M'),
  });
  const [reportData, setReportData] = useState<Client[] | null>(null);

  const handleGenerateReport = () => {
    const selectedMonth = parseInt(filters.month, 10);
    const filtered = clientes.filter(client => {
      if (!client.birthDate || typeof client.birthDate !== 'string' || client.birthDate.length < 10) {
        return false;
      }
      const monthPart = parseInt(client.birthDate.substring(5, 7), 10);
      return monthPart === selectedMonth;
    });
    setReportData(filtered);
  };
  
  const getBirthdayMessage = (clientName: string) => {
    if (!company) return '';
    const voucher = vouchers.find(v => v.id === birthdayConfig.voucherId);
    let fullMessage = birthdayConfig.message
      .replace('{empresa}', company.name)
      .replace('{cliente}', clientName.split(' ')[0]);

    if (voucher) {
      fullMessage += `\n\nUse o código *${voucher.code}* para resgatar seu presente!`;
    }
    return fullMessage;
  };

  const handleWhatsappClick = (client: Client) => {
    const message = getBirthdayMessage(client.name);
    handleShareWhatsApp(message);
  };

  const handleSendToAll = () => {
    if (!reportData || reportData.length === 0) return;

    showConfirm({
      title: 'Enviar para Todos?',
      message: `Tem certeza que deseja enviar a mensagem de aniversário para ${reportData.length} clientes?`,
      type: 'confirmation',
      onConfirm: () => {
        showAlert({
          title: 'Enviando...',
          message: `As mensagens estão sendo preparadas para envio.`,
          type: 'info'
        });
        setTimeout(() => {
          showAlert({
            title: 'Sucesso!',
            message: `${reportData.length} mensagens de aniversário foram enviadas com sucesso.`,
            type: 'success'
          });
        }, 2000);
      }
    });
  };

  const getReportText = () => {
    if (!reportData) return '';
    const monthLabel = months.find(m => m.value === filters.month)?.label || '';
    return `*Relatório de Aniversariantes*\n\nMês: ${monthLabel}\nTotal: *${reportData.length}* aniversariantes.`;
  };

  const handleShare = () => {
    if (!reportData) return;

    const columns = [
      { header: 'Nome', accessor: 'name' },
      { header: 'Telefone', accessor: 'phone', format: (p: string) => formatPhone(p) },
      { header: 'Data de Nascimento', accessor: 'birthDate', format: (d: string) => toDDMMYYYY(d) },
    ];

    handleSharePaginatedReport({
      data: reportData,
      columns: columns,
      reportTitle: `Aniversariantes de ${months.find(m => m.value === filters.month)?.label}`,
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
        <Gift className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-800 dark:text-white">Relatório de Aniversariantes</h1>
          <p className="text-light-500 dark:text-dark-400">Encontre os aniversariantes de cada mês</p>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 no-print">
        <h2 className="text-lg font-semibold text-light-800 dark:text-white flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-light-700 dark:text-dark-300 block mb-1">Mês</label>
            <select value={filters.month} onChange={e => setFilters(p => ({...p, month: e.target.value}))} className="w-full input-style">
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
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
            <h2 className="text-xl font-bold text-light-800 dark:text-white">Aniversariantes de <span className="text-blue-500 dark:text-blue-400">{months.find(m => m.value === filters.month)?.label}</span></h2>
            <div className="flex space-x-2 no-print">
              <button 
                onClick={handleSendToAll}
                disabled={reportData.length === 0}
                className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Enviar para Todos"
              >
                <Send className="w-5 h-5"/>
              </button>
              <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-aniversariantes.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-aniversariantes.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-200 dark:bg-dark-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Nome</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Telefone</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Data de Nascimento</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-center no-print">Ação</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? reportData.map(item => (
                  <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                    <td className="p-3 text-light-900 dark:text-white">{item.name}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{formatPhone(item.phone)}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300">{toDDMMYYYY(item.birthDate)}</td>
                    <td className="p-3 text-center no-print">
                      <button 
                        onClick={() => handleWhatsappClick(item)}
                        className="p-2 rounded-full text-green-500 hover:bg-green-100 dark:hover:bg-green-500/20"
                        title="Enviar mensagem no WhatsApp"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-light-500 dark:text-dark-400">Nenhum aniversariante encontrado para este mês.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PrintFooter />
        </div>
      )}
    </div>
  );
};

export default RelatorioAniversariantes;
