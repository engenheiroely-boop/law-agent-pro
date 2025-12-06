
import React, { useState, useEffect } from 'react';
import { User, FileText, DollarSign, LogOut, ShieldCheck, Clock, MapPin, CheckCircle, AlertCircle, Download, Scale } from 'lucide-react';
import { Client, LegalCase, FinancialTransaction, AppRoute } from '../types';
import { getClients } from '../services/clientService';
import { getCasesByClientId } from '../services/caseService';
import { getTransactions } from '../services/financialService';
import { formatCurrency } from '../services/feeEngine';
import { LoadingState, EmptyState } from './ui/States';

interface PortalModuleProps {
  onNavigate: (route: AppRoute) => void;
  params?: { token?: string };
}

export const PortalModule: React.FC<PortalModuleProps> = ({ onNavigate, params }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [documentInput, setDocumentInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [clientData, setClientData] = useState<Client | null>(null);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [financials, setFinancials] = useState<FinancialTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'PROCESSOS' | 'FINANCEIRO'>('PROCESSOS');

  // Simulação de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulação de delay de rede
    await new Promise(r => setTimeout(r, 1000));

    const allClients = await getClients();
    // Busca por CPF/CNPJ exato
    const found = allClients.find(c => c.document.replace(/\D/g, '') === documentInput.replace(/\D/g, ''));

    if (found) {
      setClientData(found);
      setIsAuthenticated(true);
      // Carregar dados relacionados
      const clientCases = getCasesByClientId(found.id);
      const allTransactions = await getTransactions();
      const clientFinancials = allTransactions.filter(t => t.clientId === found.id && t.type === 'INCOME');
      
      setCases(clientCases);
      setFinancials(clientFinancials);
    } else {
      setError('CPF/CNPJ não encontrado ou acesso não habilitado.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setClientData(null);
    setDocumentInput('');
    // Voltar para Dashboard (em um app real, voltaria para home do site)
    onNavigate({ module: 'dashboard' });
  };

  // --- TELA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale size={32} />
             </div>
             <h1 className="text-2xl font-bold text-slate-900">Área do Cliente</h1>
             <p className="text-slate-500 mt-2 text-sm">Acompanhe seus processos e financeiro com transparência e segurança.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">CPF ou CNPJ</label>
               <input 
                 type="text" 
                 className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                 placeholder="Digite apenas números"
                 value={documentInput}
                 onChange={e => setDocumentInput(e.target.value)}
               />
             </div>
             
             {error && (
               <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                 <AlertCircle size={16} /> {error}
               </div>
             )}

             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
             >
               {loading ? <LoadingState message="" /> : <ShieldCheck size={18} />}
               {loading ? 'Acessando...' : 'Acessar Portal'}
             </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-4">
             <p className="text-xs text-slate-400">Ambiente seguro desenvolvido por Law Agent</p>
          </div>
        </div>
      </div>
    );
  }

  // --- ÁREA LOGADA ---
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Portal */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
         <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
               <Scale className="text-accent" />
               <span>Portal do Cliente</span>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-sm text-slate-600 hidden md:block">Olá, <strong>{clientData?.name}</strong></span>
               <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
               </button>
            </div>
         </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
         
         {/* Resumo */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Processos Ativos</p>
               <p className="text-3xl font-bold text-slate-800 mt-1">{cases.filter(c => c.status === 'Ativo').length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Pendências Financeiras</p>
               <p className="text-3xl font-bold text-amber-600 mt-1">{financials.filter(t => t.status !== 'PAID').length}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-lg text-white">
               <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Meu Advogado</p>
               <p className="text-lg font-bold mt-1">Dr. Advogado</p>
               <p className="text-sm text-slate-400 flex items-center gap-1 mt-2"><MapPin size={12} /> Florianópolis, SC</p>
            </div>
         </div>

         {/* Navegação */}
         <div className="flex gap-6 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('PROCESSOS')}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'PROCESSOS' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               Meus Processos
            </button>
            <button 
              onClick={() => setActiveTab('FINANCEIRO')}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'FINANCEIRO' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               Financeiro
            </button>
         </div>

         {/* Conteúdo Abas */}
         <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'PROCESSOS' && (
               <div className="space-y-4">
                  {cases.length === 0 ? (
                     <EmptyState title="Nenhum processo" description="Você não possui processos ativos neste escritório." icon={FileText} />
                  ) : (
                     cases.map(legalCase => (
                        <div key={legalCase.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                           <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                              <div>
                                 <h3 className="font-bold text-slate-800">{legalCase.title}</h3>
                                 <p className="text-xs text-slate-500 font-mono mt-1">{legalCase.cnjNumber || 'Processo em autuação'}</p>
                              </div>
                              <span className="bg-white px-2 py-1 rounded text-xs font-bold border border-slate-200 text-slate-600">
                                 {legalCase.status}
                              </span>
                           </div>
                           <div className="p-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-1"><Clock size={12} /> Últimos Andamentos</h4>
                              {legalCase.timeline && legalCase.timeline.length > 0 ? (
                                 <div className="space-y-6 relative pl-2 border-l-2 border-slate-100 ml-2">
                                    {legalCase.timeline.slice(0, 3).map(evt => (
                                       <div key={evt.id} className="relative pl-4">
                                          <div className="absolute -left-[7px] top-1.5 w-3 h-3 bg-white border-2 border-accent rounded-full"></div>
                                          <p className="text-sm font-medium text-slate-800">{evt.title}</p>
                                          <p className="text-xs text-slate-400 mt-0.5">{new Date(evt.date).toLocaleDateString()}</p>
                                          {evt.description && <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded">{evt.description}</p>}
                                       </div>
                                    ))}
                                 </div>
                              ) : (
                                 <p className="text-sm text-slate-400 italic">Nenhum andamento registrado recentemente.</p>
                              )}
                           </div>
                        </div>
                     ))
                  )}
               </div>
            )}

            {activeTab === 'FINANCEIRO' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {financials.length === 0 ? (
                     <EmptyState title="Tudo certo!" description="Nenhuma pendência financeira encontrada." icon={DollarSign} />
                  ) : (
                     <div className="divide-y divide-slate-100">
                        {financials.map(tx => (
                           <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    <DollarSign size={20} />
                                 </div>
                                 <div>
                                    <p className="font-medium text-slate-800 text-sm">{tx.description}</p>
                                    <p className="text-xs text-slate-500">Vencimento: {new Date(tx.dueDate).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="font-bold text-slate-800">{formatCurrency(tx.amount)}</p>
                                 {tx.status === 'PAID' ? (
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end"><CheckCircle size={12} /> Pago</span>
                                 ) : (
                                    <button className="mt-1 text-xs bg-slate-900 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-700 transition-colors">
                                       <Download size={12} /> Boleto
                                    </button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            )}
         </div>
      </main>
    </div>
  );
};
