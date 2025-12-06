
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Briefcase, FileText, Scale, Clock, Calendar, MapPin, Activity, Loader2, Download, CheckSquare } from 'lucide-react';
import { LegalCase, Client, CaseStatus, ServiceCategory, AppRoute } from '../types';
import { getCases, createCase, updateCase, getCaseById, addEventToCase } from '../services/caseService';
import { getClients } from '../services/clientService';
import { parseCNJ } from '../services/enrichmentService';
import { LoadingState, EmptyState } from './ui/States';
import { useToast } from './ui/Toast';
import { exportCasesToCSV } from '../services/exportService';

interface CaseModuleProps {
  initialParams?: any;
  onNavigate?: (route: AppRoute) => void;
}

export const CaseModule: React.FC<CaseModuleProps> = ({ initialParams, onNavigate }) => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // State: Details View
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  // Modal de Criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Partial<LegalCase>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  // Abre modal se vier com parâmetro (ex: Novo Processo do Cliente X) ou abre detalhes se vier com caseId
  useEffect(() => {
    if (cases.length > 0) {
      if (initialParams?.caseId) {
        const target = cases.find(c => c.id === initialParams.caseId);
        if (target) setSelectedCase(target);
      } else if (initialParams?.clientId) {
        setEditingCase({ clientId: initialParams.clientId, status: CaseStatus.ACTIVE });
        setIsModalOpen(true);
      }
    }
  }, [initialParams, cases]);

  const loadData = async () => {
    setLoading(true);
    const [cData, clData] = await Promise.all([getCases(), getClients()]);
    setCases(cData);
    setClients(clData);
    setLoading(false);
  };

  const reloadCurrentCase = async () => {
    if (selectedCase) {
      const updated = await getCaseById(selectedCase.id);
      if (updated) setSelectedCase(updated);
    }
    loadData(); // Refresh list in background
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase.title || !editingCase.clientId) {
      showToast('error', 'Preencha título e cliente.');
      return;
    }

    setIsSaving(true);
    try {
      const casePayload = {
        ...editingCase,
        id: editingCase.id || crypto.randomUUID(),
        status: editingCase.status || CaseStatus.ACTIVE,
        value: Number(editingCase.value) || 0
      } as LegalCase;

      if (editingCase.id) {
        await updateCase(casePayload);
        showToast('success', 'Processo atualizado!');
      } else {
        await createCase(casePayload);
        showToast('success', 'Processo cadastrado!');
      }

      setIsModalOpen(false);
      setEditingCase({});
      loadData();
    } catch (error) {
      showToast('error', 'Erro ao salvar processo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCNJChange = (value: string) => {
    setEditingCase(prev => ({ ...prev, cnjNumber: value }));

    // Tenta parsear automaticamente ao atingir 20 caracteres (ou próximo disso)
    if (value.length >= 20) {
      const meta = parseCNJ(value);
      if (meta) {
        setEditingCase(prev => ({
          ...prev,
          cnjNumber: value,
          year: meta.year,
          court: meta.court,
          state: meta.state === 'BR' ? prev.state : meta.state, // Mantém estado se for genérico
          area: meta.state === 'Trabalhista' ? 'Trabalhista' : meta.state === 'Federal' ? 'Previdenciário' : prev.area // Inferência básica
        }));
      }
    }
  };

  const handleAddEvent = async (title: string) => {
    if (!selectedCase || !title.trim()) return;
    try {
      await addEventToCase(selectedCase.id, {
        date: new Date().toISOString(),
        title,
        type: 'MOVEMENT'
      });
      showToast('success', 'Andamento adicionado!');
      reloadCurrentCase();
    } catch (error) {
      showToast('error', 'Erro ao adicionar andamento.');
    }
  };

  const filteredCases = cases.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.cnjNumber?.includes(search)
  );

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Desconhecido';

  if (loading) return <LoadingState message="Carregando processos..." />;

  // --- VISÃO DE DETALHES (NOVA) ---
  if (selectedCase) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <button onClick={() => setSelectedCase(null)} className="text-sm text-slate-500 hover:text-accent flex items-center gap-1">
          &larr; Voltar para Lista
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Processo */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedCase.title}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedCase.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedCase.status}
                  </span>
                </div>
                <p className="font-mono text-slate-500 flex items-center gap-2">
                  <Scale size={14} />
                  {selectedCase.cnjNumber || 'Sem numeração CNJ'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate && onNavigate({ module: 'tasks', params: { caseId: selectedCase.id } })}
                  className="text-sm text-slate-600 font-medium hover:text-accent flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <CheckSquare size={16} /> Nova Tarefa
                </button>
                <button onClick={() => { setEditingCase(selectedCase); setIsModalOpen(true); }} className="text-sm text-accent font-medium hover:underline px-2">
                  Editar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-3 rounded border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Cliente</p>
                <p className="text-sm font-medium text-slate-800">{getClientName(selectedCase.clientId)}</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Tribunal/Ano</p>
                <p className="text-sm font-medium text-slate-800">{selectedCase.court || '-'} / {selectedCase.year || '-'}</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Área</p>
                <p className="text-sm font-medium text-slate-800">{selectedCase.area} ({selectedCase.state})</p>
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold">Valor Causa</p>
                <p className="text-sm font-medium text-slate-800">R$ {selectedCase.value?.toLocaleString('pt-BR') || '0,00'}</p>
              </div>
            </div>
          </div>

          {/* Timeline / Andamentos */}
          <div className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={18} className="text-accent" />
              Linha do Tempo
            </h3>

            <div className="relative pl-4 border-l-2 border-slate-100 ml-2 space-y-8">
              {/* Input rápido de andamento */}
              <div className="mb-8 ml-4">
                <input
                  type="text"
                  placeholder="Adicionar andamento rápido (Enter)..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-accent outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddEvent(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              {(!selectedCase.timeline || selectedCase.timeline.length === 0) ? (
                <div className="ml-4 text-slate-400 text-sm italic">Nenhum andamento registrado.</div>
              ) : (
                selectedCase.timeline.map((evt) => (
                  <div key={evt.id} className="relative ml-4">
                    {/* Dot */}
                    <div className="absolute -left-[25px] top-1.5 w-4 h-4 bg-white border-2 border-accent rounded-full"></div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-accent/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-slate-800 text-sm">{evt.title}</p>
                        <span className="text-xs text-slate-400 font-mono">{new Date(evt.date).toLocaleDateString()}</span>
                      </div>
                      {evt.description && <p className="text-xs text-slate-500 mt-1">{evt.description}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISÃO DE LISTA (PADRÃO) ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Processos</h1>
          <p className="text-slate-500">Gestão de contencioso e prazos.</p>
        </div>
        <button
          onClick={() => { setEditingCase({ status: CaseStatus.ACTIVE }); setIsModalOpen(true); }}
          className="bg-accent hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Novo Processo
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar processos..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              const clientsMap: Record<string, string> = {};
              clients.forEach(c => clientsMap[c.id] = c.name);
              exportCasesToCSV(filteredCases, clientsMap);
            }}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium transition-colors"
            title="Exportar para CSV"
          >
            <Download size={16} /> Exportar
          </button>
          <button className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium">
            <Filter size={16} /> Filtros
          </button>
        </div>

        {filteredCases.length === 0 ? (
          <EmptyState
            title="Nenhum processo encontrado"
            description="Cadastre seus processos para acompanhar o andamento."
            icon={Scale}
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Título / CNJ</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Área / Estado</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => (
                <tr key={c.id} onClick={() => setSelectedCase(c)} className="hover:bg-slate-50 group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{c.title}</div>
                    <div className="text-xs text-slate-500 font-mono">{c.cnjNumber || 'Sem número'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-slate-400" />
                      {getClientName(c.clientId)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700">{c.area}</div>
                    <div className="text-xs text-slate-500">{c.state}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium 
                      ${c.status === CaseStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' :
                        c.status === CaseStatus.ARCHIVED ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate({
                          module: 'calculator',
                          params: {
                            state: c.state,
                            clientName: getClientName(c.clientId),
                            category: c.area === 'Cível' ? ServiceCategory.CONTENTIOUS : undefined
                          }
                        });
                      }}
                      className="text-accent hover:text-sky-700 font-medium text-xs flex items-center gap-1 border border-transparent hover:border-accent/20 px-2 py-1 rounded transition-all"
                    >
                      <FileText size={14} /> Calcular
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate && onNavigate({ module: 'tasks', params: { caseId: c.id } });
                      }}
                      className="text-slate-500 hover:text-accent font-medium text-xs flex items-center gap-1 border border-transparent hover:border-slate-200 px-2 py-1 rounded transition-all"
                      title="Criar Tarefa"
                    >
                      <CheckSquare size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Processo (Edição/Criação) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-6 text-slate-800">{editingCase.id ? 'Editar' : 'Novo'} Processo</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Título Interno</label>
                <input required type="text" className="w-full border p-2 rounded" placeholder="Ex: Ação de Cobrança - Banco X" value={editingCase.title || ''} onChange={e => setEditingCase({ ...editingCase, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Cliente</label>
                <select
                  required
                  className="w-full border p-2 rounded"
                  value={editingCase.clientId || ''}
                  onChange={e => setEditingCase({ ...editingCase, clientId: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">CNJ (Numeração Única)</label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded font-mono text-sm"
                    placeholder="0000000-00.0000.0.00.0000"
                    value={editingCase.cnjNumber || ''}
                    onChange={e => handleCNJChange(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">O sistema tentará identificar o tribunal automaticamente.</p>
                </div>
              </div>

              {/* Metadados extraídos ou manuais */}
              <div className="bg-slate-50 p-3 rounded border border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500">Ano</label>
                  <input type="number" className="w-full border p-1.5 rounded text-sm" value={editingCase.year || ''} onChange={e => setEditingCase({ ...editingCase, year: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500">Tribunal</label>
                  <input type="text" className="w-full border p-1.5 rounded text-sm" value={editingCase.court || ''} onChange={e => setEditingCase({ ...editingCase, court: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Valor da Causa</label>
                  <input type="number" className="w-full border p-2 rounded" value={editingCase.value || ''} onChange={e => setEditingCase({ ...editingCase, value: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Área</label>
                  <select className="w-full border p-2 rounded" value={editingCase.area || 'Cível'} onChange={e => setEditingCase({ ...editingCase, area: e.target.value })}>
                    <option value="Cível">Cível</option>
                    <option value="Trabalhista">Trabalhista</option>
                    <option value="Previdenciário">Previdenciário</option>
                    <option value="Família">Família</option>
                    <option value="Criminal">Criminal</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">UF</label>
                  <select className="w-full border p-2 rounded" value={editingCase.state || 'SC'} onChange={e => setEditingCase({ ...editingCase, state: e.target.value })}>
                    <option value="SC">SC</option><option value="SP">SP</option><option value="PR">PR</option><option value="RS">RS</option><option value="MS">MS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <select className="w-full border p-2 rounded" value={editingCase.status || CaseStatus.ACTIVE} onChange={e => setEditingCase({ ...editingCase, status: e.target.value as CaseStatus })}>
                    <option value={CaseStatus.ACTIVE}>Ativo</option>
                    <option value={CaseStatus.ARCHIVED}>Arquivado</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded hover:bg-slate-50" disabled={isSaving}>Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-accent text-white rounded hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={isSaving}>
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
