
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, CheckCircle, Circle, Clock, AlertCircle, Download } from 'lucide-react';
import { FinancialTransaction, TransactionStatus } from '../types';
import { getTransactions, updateTransactionStatus } from '../services/financialService';
import { formatCurrency } from '../services/feeEngine';
import { LoadingState, EmptyState } from './ui/States';
import { getClients } from '../services/clientService';
import { exportTransactionsToCSV } from '../services/exportService';

import { FinancialReportGenerator } from './FinancialReportGenerator';

export const FinanceModule: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // ... (loadData and handleStatusToggle remain the same)

  const loadData = async () => {
    setLoading(true);
    const [txs, clients] = await Promise.all([getTransactions(), getClients()]);
    setTransactions(txs);

    const cMap: Record<string, string> = {};
    clients.forEach(c => cMap[c.id] = c.name);
    setClientsMap(cMap);

    setLoading(false);
  };

  const handleStatusToggle = async (tx: FinancialTransaction) => {
    const newStatus = tx.status === 'PAID' ? 'PENDING' : 'PAID';
    await updateTransactionStatus(tx.id, newStatus);
    loadData(); // Reload to refresh UI
  };

  const stats = {
    totalReceived: transactions.filter(t => t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0),
    totalPending: transactions.filter(t => t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0),
    totalOverdue: transactions.filter(t => t.status === 'OVERDUE').reduce((acc, t) => acc + t.amount, 0),
  };

  if (loading) return <LoadingState message="Carregando financeiro..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500">Controle de honorários e fluxo de caixa.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <TrendingUp size={16} /> Relatórios
          </button>
          <button
            onClick={() => exportTransactionsToCSV(transactions, clientsMap)}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium transition-colors"
            title="Exportar para CSV"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">RECEBIDO</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalReceived)}</p>
          <p className="text-xs text-slate-400 mt-1">Total baixado</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg"><Clock size={20} /></div>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">A RECEBER</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalPending)}</p>
          <p className="text-xs text-slate-400 mt-1">Próximos lançamentos</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">ATRASADO</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalOverdue)}</p>
          <p className="text-xs text-slate-400 mt-1">Vencidos</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Lançamentos</h3>
        </div>

        {transactions.length === 0 ? <EmptyState title="Nenhum lançamento" description="Salve propostas para gerar financeiro." icon={DollarSign} /> : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleStatusToggle(tx)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                       ${tx.status === 'PAID'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-300 hover:border-emerald-400 border-2 border-transparent hover:text-emerald-400'}`}
                  >
                    {tx.status === 'PAID' ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </button>
                  <div>
                    <p className={`font-medium text-sm ${tx.status === 'PAID' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {tx.description}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{clientsMap[tx.clientId || ''] || 'Cliente Avulso'}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(tx.dueDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.status === 'PAID' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {formatCurrency(tx.amount)}
                  </p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded
                      ${tx.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {tx.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FinancialReportGenerator
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        transactions={transactions}
        clientsMap={clientsMap}
      />
    </div>
  );
};
