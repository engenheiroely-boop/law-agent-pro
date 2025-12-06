
import React, { useState } from 'react';
import { Calculator, Calendar, DollarSign, TrendingUp, FileText, ChevronRight, Percent } from 'lucide-react';
import { CorrectionParams, CorrectionResult } from '../types';
import { calculateMonetaryCorrection } from '../services/calculatorService';
import { LoadingState } from './ui/States';
import { formatCurrency } from '../services/feeEngine';

export const CalculatorsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MONETARY' | 'LABOR'>('MONETARY');

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="text-accent" /> Calculadoras Judiciais
          </h1>
          <p className="text-slate-500">Ferramentas para atualização e liquidação de valores.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('MONETARY')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'MONETARY' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <TrendingUp size={18} /> Atualização Monetária
        </button>
        <button
          onClick={() => setActiveTab('LABOR')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'LABOR' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <BriefcaseIcon size={18} /> Trabalhista (Breve)
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
        {activeTab === 'MONETARY' ? <MonetaryCalculator /> : <div className="p-12 text-center text-slate-400">Em desenvolvimento</div>}
      </div>
    </div>
  );
};

const BriefcaseIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);

const MonetaryCalculator = () => {
  const [params, setParams] = useState<CorrectionParams>({
    initialValue: 0,
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
    index: 'INPC',
    applyInterest: true,
    interestType: 'SIMPLE',
    interestRate: 1,
    applyFine523: false,
    applyFees523: false
  });

  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.initialValue || !params.startDate) return;

    setLoading(true);
    try {
      const res = await calculateMonetaryCorrection(params);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Sidebar de Inputs */}
      <div className="w-full lg:w-80 p-6 border-r border-slate-100 bg-slate-50 overflow-y-auto">
        <form onSubmit={handleCalculate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Original</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400">R$</span>
              <input 
                type="number" 
                step="0.01"
                required
                className="w-full pl-9 p-2 border border-slate-200 rounded-lg bg-white focus:border-accent outline-none"
                value={params.initialValue || ''}
                onChange={e => setParams({...params, initialValue: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Inicial</label>
              <input 
                type="date" 
                required
                className="w-full p-2 border border-slate-200 rounded-lg bg-white text-sm"
                value={params.startDate}
                onChange={e => setParams({...params, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Final</label>
              <input 
                type="date" 
                required
                className="w-full p-2 border border-slate-200 rounded-lg bg-white text-sm"
                value={params.endDate}
                onChange={e => setParams({...params, endDate: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Índice de Correção</label>
            <select 
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-sm"
              value={params.index}
              onChange={e => setParams({...params, index: e.target.value as any})}
            >
              <option value="INPC">INPC (IBGE)</option>
              <option value="IGPM">IGP-M (FGV)</option>
              <option value="IPCA-E">IPCA-E (IBGE)</option>
              <option value="SELIC">SELIC (Receita Federal)</option>
            </select>
          </div>

          <div className="border-t border-slate-200 pt-4">
             <label className="flex items-center gap-2 mb-3 cursor-pointer">
               <input type="checkbox" checked={params.applyInterest} onChange={e => setParams({...params, applyInterest: e.target.checked})} className="text-accent" />
               <span className="text-sm font-medium text-slate-700">Aplicar Juros de Mora</span>
             </label>

             {params.applyInterest && (
               <div className="pl-6 space-y-3 animate-in fade-in">
                 <div className="flex gap-2 text-xs">
                    <button type="button" onClick={() => setParams({...params, interestType: 'SIMPLE'})} className={`flex-1 py-1 rounded border ${params.interestType === 'SIMPLE' ? 'bg-accent text-white border-accent' : 'bg-white border-slate-200'}`}>Simples</button>
                    <button type="button" onClick={() => setParams({...params, interestType: 'COMPOUND'})} className={`flex-1 py-1 rounded border ${params.interestType === 'COMPOUND' ? 'bg-accent text-white border-accent' : 'bg-white border-slate-200'}`}>Compostos</button>
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="number" step="0.1" className="w-16 p-1 border rounded text-sm text-center" value={params.interestRate} onChange={e => setParams({...params, interestRate: Number(e.target.value)})} />
                    <span className="text-xs text-slate-500">% ao mês</span>
                 </div>
                 <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Desde quando?</label>
                    <input type="date" className="w-full p-1.5 border rounded text-sm" value={params.interestStartDate || params.startDate} onChange={e => setParams({...params, interestStartDate: e.target.value})} />
                 </div>
               </div>
             )}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" checked={params.applyFine523} onChange={e => setParams({...params, applyFine523: e.target.checked})} className="text-accent" />
               <span className="text-xs text-slate-700">Multa 10% (Art. 523 CPC)</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" checked={params.applyFees523} onChange={e => setParams({...params, applyFees523: e.target.checked})} className="text-accent" />
               <span className="text-xs text-slate-700">Honorários 10% (Art. 523 CPC)</span>
             </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Calculando...' : 'Atualizar Valor'}
          </button>
        </form>
      </div>

      {/* Área de Resultados */}
      <div className="flex-1 p-8 overflow-y-auto">
         {!result ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <Calculator size={48} className="mb-4 opacity-20" />
             <p>Preencha os dados e clique em Atualizar.</p>
           </div>
         ) : (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             
             {/* Cards de Resumo */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 <p className="text-xs text-slate-400 uppercase font-bold">Valor Original</p>
                 <p className="text-lg font-semibold text-slate-700">{formatCurrency(result.originalValue)}</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 <p className="text-xs text-slate-400 uppercase font-bold">Correção ({params.index})</p>
                 <p className="text-lg font-semibold text-blue-600">+{formatCurrency(result.correctionAmount)}</p>
               </div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 <p className="text-xs text-slate-400 uppercase font-bold">Juros de Mora</p>
                 <p className="text-lg font-semibold text-amber-600">+{formatCurrency(result.interestAmount)}</p>
               </div>
               <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg">
                 <p className="text-xs text-slate-400 uppercase font-bold">Total Atualizado</p>
                 <p className="text-2xl font-bold">{formatCurrency(result.total)}</p>
               </div>
             </div>

             {/* Detalhamento CPC */}
             {(result.fineAmount > 0 || result.feesAmount > 0) && (
               <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex gap-8">
                  {result.fineAmount > 0 && (
                    <div>
                       <p className="text-xs text-red-400 uppercase font-bold">Multa 10%</p>
                       <p className="font-bold text-red-700">+{formatCurrency(result.fineAmount)}</p>
                    </div>
                  )}
                  {result.feesAmount > 0 && (
                    <div>
                       <p className="text-xs text-red-400 uppercase font-bold">Honorários 10%</p>
                       <p className="font-bold text-red-700">+{formatCurrency(result.feesAmount)}</p>
                    </div>
                  )}
               </div>
             )}

             {/* Tabela Memória de Cálculo */}
             <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={16} /> Memória de Cálculo</h3>
                 <button className="text-xs text-accent hover:underline">Imprimir / PDF</button>
               </div>
               <div className="max-h-96 overflow-y-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-white text-slate-500 sticky top-0 shadow-sm">
                      <tr>
                        <th className="p-3 font-medium">Mês/Ano</th>
                        <th className="p-3 font-medium text-right">Índice</th>
                        <th className="p-3 font-medium text-right">Valor Corrigido</th>
                        <th className="p-3 font-medium text-right">Juros</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.memory.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs text-slate-600">{row.date.substring(0, 7)}</td>
                          <td className="p-3 text-right text-xs text-slate-500">{row.indexValue.toFixed(4)}%</td>
                          <td className="p-3 text-right font-medium text-slate-700">{formatCurrency(row.corrected)}</td>
                          <td className="p-3 text-right text-amber-600 text-xs">+{formatCurrency(row.interest)}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};
