import React, { useState } from 'react';
import { Package, Printer, AlertTriangle, FileDown, MessageSquare, FileSpreadsheet } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { formatCurrency } from '../../utils/formatters';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';

const mockProducts = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  stock: faker.number.int({ min: 0, max: 20 }),
  minStock: 10,
  price: parseFloat(faker.commerce.price()),
}));

const RelatorioEstoque: React.FC = () => {
  const { company } = useAuth();
  const [reportData, setReportData] = useState<any[] | null>(null);

  const handleGenerateReport = () => {
    setReportData(mockProducts.sort((a,b) => a.stock - b.stock));
  };
  
  const totalValue = reportData ? reportData.reduce((sum, item) => sum + (item.stock * item.price), 0) : 0;

  const getReportText = () => {
    if (!reportData) return '';
    return `*Relatório de Estoque*\n\nValor Total em Estoque: *${formatCurrency(totalValue)}*`;
  };

  const handleShare = () => {
    if (!reportData) return;

    const columns = [
      { header: 'Produto', accessor: 'name' },
      { header: 'Estoque Atual', accessor: 'stock', align: 'center' as const },
      { header: 'Estoque Mínimo', accessor: 'minStock', align: 'center' as const },
      { header: 'Valor Custo (Unit.)', accessor: 'price', format: (v: number) => formatCurrency(v), align: 'right' as const },
      { header: 'Valor Total', accessor: 'price', format: (_: any, row: any) => formatCurrency(row.stock * row.price), align: 'right' as const },
    ];

    handleSharePaginatedReport({
      data: reportData,
      columns: columns,
      reportTitle: 'Relatório de Estoque',
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
        <Package className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-light-800 dark:text-white">Relatório de Estoque</h1>
          <p className="text-light-500 dark:text-dark-400">Acompanhe os níveis de estoque dos seus produtos</p>
        </div>
      </div>

      <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 flex justify-end no-print">
        <button onClick={handleGenerateReport} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
          Gerar Relatório de Estoque Atual
        </button>
      </div>

      {reportData && (
        <div id="print-area" className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-light-800 dark:text-white">Resultados do Estoque</h2>
              <p className="text-lg font-semibold text-green-500 dark:text-green-400 mt-2">Valor Total em Estoque: {formatCurrency(totalValue)}</p>
            </div>
            <div className="flex space-x-2 no-print">
              <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
              <button onClick={() => handleExportPDF('print-area', 'relatorio-estoque.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
              <button onClick={() => handleExportCSV(reportData, 'relatorio-estoque.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
              <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-200 dark:bg-dark-700">
                <tr>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Produto</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Estoque Atual</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-center">Estoque Mínimo</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Valor Custo (Unit.)</th>
                  <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(item => (
                  <tr key={item.id} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                    <td className="p-3 text-light-900 dark:text-white">{item.name}</td>
                    <td className={`p-3 text-center font-bold ${item.stock <= item.minStock ? 'text-red-500 dark:text-red-400' : 'text-light-700 dark:text-dark-300'}`}>
                      <div className="flex items-center justify-center space-x-2">
                        <span>{item.stock}</span>
                        {item.stock <= item.minStock && <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" title="Estoque baixo"/>}
                      </div>
                    </td>
                    <td className="p-3 text-light-700 dark:text-dark-300 text-center">{item.minStock}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300 text-right">{formatCurrency(item.price)}</td>
                    <td className="p-3 text-light-700 dark:text-dark-300 text-right">{formatCurrency(item.stock * item.price)}</td>
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

export default RelatorioEstoque;
