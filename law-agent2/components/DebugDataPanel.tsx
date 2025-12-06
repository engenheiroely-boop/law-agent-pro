
import React, { useState } from 'react';
import { Bug, X, Database, RefreshCw } from 'lucide-react';
import { getFeeStats, loadFeesForState, clearCache } from '../services/feeService';

export const DebugDataPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [selectedState, setSelectedState] = useState('SC');

  const handleAnalyze = () => {
    const data = getFeeStats(selectedState);
    setStats(data);
  };

  const handleReload = async () => {
    clearCache();
    await loadFeesForState(selectedState);
    handleAnalyze();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 z-50 opacity-50 hover:opacity-100 transition-opacity"
        title="Debug Dados"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-accent" />
            Inspetor de Dados OAB
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="border p-2 rounded-lg bg-white"
              >
                <option value="SC">Santa Catarina (SC)</option>
                <option value="RS">Rio Grande do Sul (RS)</option>
                <option value="MS">Mato Grosso do Sul (MS)</option>
                <option value="SP">São Paulo (SP)</option>
              </select>
            </div>
            <button 
              onClick={handleAnalyze}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-sky-600 font-medium"
            >
              Analisar Dados
            </button>
            <button 
              onClick={handleReload}
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium flex items-center gap-2"
            >
              <RefreshCw size={16} /> Force Reload
            </button>
          </div>

          {stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Total de Itens</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.count}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Fonte</p>
                  <p className={`text-lg font-bold ${stats.source === 'MEMORY_CACHE' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {stats.source}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 font-medium">
                    <tr>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Subcategoria</th>
                      <th className="p-3 text-right">Qtd</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {/* This is a simplified view, logic to flatten stats would be needed for a full tree */}
                     <tr>
                       <td colSpan={3} className="p-3 text-center text-slate-500 italic">
                         Veja o console do navegador para a árvore detalhada.
                       </td>
                     </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              Clique em "Analisar Dados" para inspecionar a memória.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
