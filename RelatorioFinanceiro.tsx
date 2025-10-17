import React, { useState, useMemo } from 'react';
import { DollarSign, Filter, Printer, FileDown, MessageSquare, FileSpreadsheet, TrendingUp, TrendingDown } from 'lucide-react';
import DateRangePicker from '../../components/common/DateRangePicker';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';
import { handlePrint, handleExportPDF, handleExportCSV, handleSharePaginatedReport } from '../../utils/reportUtils';
import BackButton from '../../components/common/BackButton';
import PrintFooter from '../../components/common/PrintFooter';
import { useAuth } from '../../contexts/AuthContext';
import { faker } from '@faker-js/faker';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../../contexts/ThemeContext';

// Mock data for demonstration
const mockSales = Array.from({ length: 20 }, () => ({ type: 'receita', description: `Venda #${faker.string.alphanumeric(6)}`, date: faker.date.recent({ days: 30 }), value: faker.number.float({ min: 30, max: 250 }), category: 'Vendas' }));
const mockContasPagar = Array.from({ length: 5 }, () => ({ type: 'despesa', description: faker.finance.transactionDescription(), date: faker.date.recent({ days: 30 }), value: faker.number.float({ min: 50, max: 1000 }), category: faker.helpers.arrayElement(['Aluguel', 'Salários', 'Fornecedores', 'Marketing', 'Outros']) }));
const mockContasReceber = Array.from({ length: 3 }, () => ({ type: 'receita', description: `Recebimento - ${faker.commerce.productName()}`, date: faker.date.recent({ days: 30 }), value: faker.number.float({ min: 100, max: 500 }), category: 'Recebimentos' }));
const mockAllTransactions = [...mockSales, ...mockContasPagar, ...mockContasReceber].sort((a, b) => b.date.getTime() - a.date.getTime());

const RelatorioFinanceiro: React.FC = () => {
    const { company } = useAuth();
    const { theme } = useTheme();
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'receitas' | 'despesas'>('all');

    const summary = useMemo(() => {
        if (!reportData) return { receitas: 0, despesas: 0, lucro: 0, ticketMedio: 0 };
        const receitas = reportData.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
        const despesas = reportData.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
        const salesCount = reportData.filter(t => t.description.toLowerCase().includes('venda')).length;
        const ticketMedio = salesCount > 0 ? receitas / salesCount : 0;
        return { receitas, despesas, lucro: receitas - despesas, ticketMedio };
    }, [reportData]);

    const pieChartData = useMemo(() => {
        if (!reportData) return { receitas: [], despesas: [] };
        const receitaCats = new Map<string, number>();
        const despesaCats = new Map<string, number>();
        reportData.forEach(t => {
            if (t.type === 'receita') {
                receitaCats.set(t.category, (receitaCats.get(t.category) || 0) + t.value);
            } else {
                despesaCats.set(t.category, (despesaCats.get(t.category) || 0) + t.value);
            }
        });
        return {
            receitas: Array.from(receitaCats.entries()).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })),
            despesas: Array.from(despesaCats.entries()).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })),
        };
    }, [reportData]);

    const getPieOption = (title: string, data: {name: string, value: number}[]) => ({
        backgroundColor: 'transparent',
        title: { text: title, left: 'center', textStyle: { color: theme === 'dark' ? '#f3f4f6' : '#1f2937', fontSize: 16 } },
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: theme === 'dark' ? '#374151' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb', textStyle: { color: theme === 'dark' ? '#f3f4f6' : '#1f2937' } },
        legend: { orient: 'vertical', left: 'left', textStyle: { color: theme === 'dark' ? '#9ca3af' : '#4b5563' } },
        series: [{ name: 'Composição', type: 'pie', radius: '50%', data, emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }]
    });

    const filteredTransactions = useMemo(() => {
        if (!reportData) return [];
        if (activeFilter === 'all') return reportData;
        const type = activeFilter === 'receitas' ? 'receita' : 'despesa';
        return reportData.filter(t => t.type === type);
    }, [reportData, activeFilter]);

    const handleGenerateReport = () => {
        const filtered = mockAllTransactions.filter(item => {
            const itemDate = new Date(item.date);
            const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
            const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            return true;
        });
        setReportData(filtered);
    };

    const getReportText = () => {
        if (!reportData) return '';
        const period = filters.startDate && filters.endDate 
          ? `Período: ${format(new Date(filters.startDate+'T00:00:00'), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate+'T00:00:00'), 'dd/MM/yyyy')}`
          : 'Período: Todos';
        return `*Relatório Financeiro*\n\n${period}\nLucro: *${formatCurrency(summary.lucro)}*`;
      };

      const handleShare = () => {
        if (!reportData) return;
        const columns = [
          { header: 'Data', accessor: 'date', format: (d: Date) => format(d, 'dd/MM/yyyy') },
          { header: 'Descrição', accessor: 'description' },
          { header: 'Tipo', accessor: 'type', format: (t: string) => t === 'receita' ? 'Receita' : 'Despesa' },
          { header: 'Valor', accessor: 'value', format: (v: number) => formatCurrency(v), align: 'right' as const },
        ];
        handleSharePaginatedReport({ data: reportData, columns, reportTitle: 'Relatório Financeiro', baseReportText: getReportText(), company });
      };

    return (
        <div className="space-y-6">
            <div className="no-print"><BackButton /></div>
            <div className="flex items-center space-x-3 no-print">
                <DollarSign className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                <div>
                    <h1 className="text-2xl font-bold text-light-900 dark:text-dark-200">Relatório Financeiro</h1>
                    <p className="text-light-500 dark:text-dark-400">Visão geral de receitas, despesas e lucro.</p>
                </div>
            </div>

            <div className="bg-light-100 dark:bg-dark-800 rounded-xl p-6 border border-light-300 dark:border-dark-600 space-y-4 no-print">
                <h2 className="text-lg font-semibold text-light-900 dark:text-dark-200 flex items-center"><Filter className="w-5 h-5 mr-2" />Filtros</h2>
                <DateRangePicker 
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    onStartDateChange={(d) => setFilters(p => ({...p, startDate: d}))}
                    onEndDateChange={(d) => setFilters(p => ({...p, endDate: d}))}
                />
                <div className="flex justify-end">
                    <button onClick={handleGenerateReport} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">Gerar Relatório</button>
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
                        </div>
                        <div className="flex space-x-2 no-print">
                            <button onClick={handleShare} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Compartilhar no WhatsApp"><MessageSquare className="w-5 h-5"/></button>
                            <button onClick={() => handleExportPDF('print-area', 'relatorio-financeiro.pdf')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar PDF"><FileDown className="w-5 h-5"/></button>
                            <button onClick={() => handleExportCSV(reportData, 'relatorio-financeiro.csv')} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5"/></button>
                            <button onClick={handlePrint} className="p-2 rounded-lg text-light-500 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-700 hover:text-light-800 dark:hover:text-white" title="Imprimir"><Printer className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div onClick={() => setActiveFilter('receitas')} className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg cursor-pointer hover:ring-2 ring-green-500"><h4 className="text-sm text-green-800 dark:text-green-300">Total de Receitas</h4><p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.receitas)}</p></div>
                        <div onClick={() => setActiveFilter('despesas')} className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg cursor-pointer hover:ring-2 ring-red-500"><h4 className="text-sm text-red-800 dark:text-red-300">Total de Despesas</h4><p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.despesas)}</p></div>
                        <div onClick={() => setActiveFilter('all')} className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg cursor-pointer hover:ring-2 ring-blue-500"><h4 className="text-sm text-blue-800 dark:text-blue-300">Lucro Bruto</h4><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(summary.lucro)}</p></div>
                        <div className="bg-purple-100 dark:bg-purple-900/50 p-4 rounded-lg"><h4 className="text-sm text-purple-800 dark:text-purple-300">Ticket Médio</h4><p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(summary.ticketMedio)}</p></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-light-50 dark:bg-dark-900/50 p-4 rounded-lg"><ReactECharts option={getPieOption('Composição de Receitas', pieChartData.receitas)} style={{ height: 300 }} /></div>
                        <div className="bg-light-50 dark:bg-dark-900/50 p-4 rounded-lg"><ReactECharts option={getPieOption('Composição de Despesas', pieChartData.despesas)} style={{ height: 300 }} /></div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-200 dark:bg-dark-700">
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Data</th>
                                    <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Descrição</th>
                                    <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300">Tipo</th>
                                    <th className="p-3 text-sm font-semibold text-light-700 dark:text-dark-300 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((item, index) => (
                                    <tr key={index} className="border-b border-light-300 dark:border-dark-700 last:border-b-0">
                                        <td className="p-3 text-light-700 dark:text-dark-300">{format(item.date, 'dd/MM/yyyy')}</td>
                                        <td className="p-3 text-light-900 dark:text-white">{item.description}</td>
                                        <td className="p-3">
                                            {item.type === 'receita' ? <TrendingUp className="w-5 h-5 text-green-500"/> : <TrendingDown className="w-5 h-5 text-red-500"/>}
                                        </td>
                                        <td className={`p-3 text-right font-semibold ${item.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.type === 'despesa' && '- '}{formatCurrency(item.value)}
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

export default RelatorioFinanceiro;
