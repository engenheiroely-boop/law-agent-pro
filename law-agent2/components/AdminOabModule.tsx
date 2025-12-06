
import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { BRAZIL_STATES } from '../constants';
import { OABTableStatus } from '../types';
import { importOabTable, getOabStatus } from '../services/adminOabService';
import { LoadingState } from './ui/States';

export const AdminOabModule: React.FC = () => {
  const [statusList, setStatusList] = useState<OABTableStatus[]>([]);
  const [loadingState, setLoadingState] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = () => {
    setStatusList(getOabStatus());
  };

  const handleFileUpload = async (uf: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMessage('Por favor, selecione apenas arquivos PDF.');
      return;
    }

    setLoadingState(uf);
    setErrorMessage(null);

    try {
      await importOabTable(uf, file);
      refreshStatus();
    } catch (error) {
      setErrorMessage(`Erro ao importar tabela de ${uf}. Tente novamente.`);
    } finally {
      setLoadingState(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Administração de Tabelas OAB</h1>
        <p className="text-slate-500">Gerencie as versões oficiais das tabelas de honorários de cada estado.</p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in">
          <XCircle size={20} />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {BRAZIL_STATES.map((state) => {
          const status = statusList.find(s => s.uf === state.code);
          const isProcessing = loadingState === state.code;
          const hasData = !!status?.lastImportDate;

          return (
            <div key={state.code} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Info Estado */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xl border border-slate-200">
                    {state.code}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">{state.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {isProcessing ? (
                        <span className="text-sm text-accent flex items-center gap-1">
                           <LoadingState message="" /> Processando...
                        </span>
                      ) : hasData ? (
                        <span className="text-sm text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <CheckCircle size={14} /> Atualizado em {new Date(status!.lastImportDate!).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                          <Clock size={14} /> Nunca importado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <label className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors w-full md:w-auto
                      ${isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'}`}>
                      <Upload size={18} />
                      {hasData ? 'Re-importar PDF' : 'Importar PDF'}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf"
                        disabled={isProcessing}
                        onChange={(e) => handleFileUpload(state.code, e)}
                      />
                   </label>
                </div>
              </div>

              {/* Histórico Recente */}
              {status && status.history && status.history.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-4">
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Histórico de Importações</p>
                   <div className="space-y-2">
                     {status.history.map((entry, idx) => (
                       <div key={idx} className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                             {entry.success ? (
                               entry.report?.itemsWithWarnings ? <AlertTriangle size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-emerald-500" />
                             ) : (
                               <XCircle size={16} className="text-red-500" />
                             )}
                             <span className="text-slate-600">{new Date(entry.date).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                             <span>{entry.report?.validItems || 0} itens</span>
                             {entry.report?.itemsWithWarnings ? (
                               <span className="text-amber-600 font-medium">{entry.report.itemsWithWarnings} avisos</span>
                             ) : null}
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
