import React, { useState, useMemo } from 'react';
import { X, Printer, Calendar, Filter, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { FinancialTransaction } from '../types';
import { formatCurrency } from '../services/feeEngine';

interface FinancialReportGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: FinancialTransaction[];
    clientsMap: Record<string, string>;
}

export const FinancialReportGenerator: React.FC<FinancialReportGeneratorProps> = ({ isOpen, onClose, transactions, clientsMap }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.dueDate);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && tDate < start) return false;
            if (end && tDate > end) return false;
            if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

            return true;
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [transactions, startDate, endDate, statusFilter]);

    const totals = useMemo(() => {
        return {
            received: filteredTransactions.filter(t => t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0),
            pending: filteredTransactions.filter(t => t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0),
            overdue: filteredTransactions.filter(t => t.status === 'OVERDUE').reduce((acc, t) => acc + t.amount, 0),
            total: filteredTransactions.reduce((acc, t) => acc + t.amount, 0)
        };
    }, [filteredTransactions]);

    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print:rounded-none">

                {/* Header (Hidden on Print) */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 print:hidden">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="text-accent" /> Relatório Financeiro
                        </h2>
                        <p className="text-sm text-slate-500">Gere relatórios detalhados para impressão ou PDF.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                        >
                            <Printer size={18} /> Imprimir / Salvar PDF
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Filters (Hidden on Print) */}
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-end print:hidden">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Data Inicial</label>
                        <input
                            type="date"
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Data Final</label>
                        <input
                            type="date"
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Status</label>
                        <select
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-accent outline-none min-w-[150px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="ALL">Todos</option>
                            <option value="PAID">Recebidos</option>
                            <option value="PENDING">Pendentes</option>
                            <option value="OVERDUE">Atrasados</option>
                        </select>
                    </div>
                    <div className="flex-1 text-right text-sm text-slate-500 pb-2">
                        Mostrando <strong>{filteredTransactions.length}</strong> lançamentos
                    </div>
                </div>

                {/* Report Content (Printable) */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
                    <div className="bg-white shadow-lg mx-auto max-w-[21cm] min-h-[29.7cm] p-[2cm] print:shadow-none print:mx-0 print:max-w-none print:min-h-0 print:p-0">

                        {/* Report Header */}
                        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide mb-2">Relatório Financeiro</h1>
                            <p className="text-slate-500">
                                Período: {startDate ? new Date(startDate).toLocaleDateString() : 'Início'} até {endDate ? new Date(endDate).toLocaleDateString() : 'Hoje'}
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="border border-slate-200 rounded p-4 bg-emerald-50 print:bg-transparent print:border-slate-300">
                                <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Total Recebido</p>
                                <p className="text-xl font-bold text-emerald-700">{formatCurrency(totals.received)}</p>
                            </div>
                            <div className="border border-slate-200 rounded p-4 bg-amber-50 print:bg-transparent print:border-slate-300">
                                <p className="text-xs font-bold text-amber-700 uppercase mb-1">Pendente / Atrasado</p>
                                <p className="text-xl font-bold text-amber-700">{formatCurrency(totals.pending + totals.overdue)}</p>
                            </div>
                            <div className="border border-slate-200 rounded p-4 bg-slate-50 print:bg-transparent print:border-slate-300">
                                <p className="text-xs font-bold text-slate-700 uppercase mb-1">Volume Total</p>
                                <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.total)}</p>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-800">
                                    <th className="py-2 font-bold text-slate-800">Data</th>
                                    <th className="py-2 font-bold text-slate-800">Descrição</th>
                                    <th className="py-2 font-bold text-slate-800">Cliente</th>
                                    <th className="py-2 font-bold text-slate-800 text-center">Status</th>
                                    <th className="py-2 font-bold text-slate-800 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="break-inside-avoid">
                                        <td className="py-3 text-slate-600">{new Date(tx.dueDate).toLocaleDateString()}</td>
                                        <td className="py-3 text-slate-800 font-medium">{tx.description}</td>
                                        <td className="py-3 text-slate-600">{clientsMap[tx.clientId || ''] || '-'}</td>
                                        <td className="py-3 text-center">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border
                        ${tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    tx.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                {tx.status === 'PAID' ? 'PAGO' : tx.status === 'OVERDUE' ? 'ATRASADO' : 'PENDENTE'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right font-mono text-slate-700">{formatCurrency(tx.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-800">
                                    <td colSpan={4} className="py-4 font-bold text-slate-800 text-right uppercase pr-4">Total do Período</td>
                                    <td className="py-4 font-bold text-slate-900 text-right text-lg">{formatCurrency(totals.total)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Footer */}
                        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                            <p>Relatório gerado em {new Date().toLocaleString()} pelo sistema Law Agent.</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
