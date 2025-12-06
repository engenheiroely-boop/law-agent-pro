
import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Edit2, User, Building2, ChevronRight, FileText, DollarSign, ScrollText, Wand2, Loader2, Globe, Copy, Trash2, Download, MessageCircle } from 'lucide-react';
import { Client, AppRoute, Proposal } from '../types';
import { getClients, createClient, updateClient, deleteClient } from '../services/clientService';
import { getCasesByClientId } from '../services/caseService';
import { getProposalsByClientId } from '../services/proposalService';
import { fetchCompanyData } from '../services/enrichmentService';
import { LoadingState, EmptyState } from './ui/States';
import { formatCurrency } from '../services/feeEngine';
import { useToast } from './ui/Toast';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { formatDocumentInput, formatPhoneInput } from '../services/formatUtils';
import { exportClientsToCSV } from '../services/exportService';

interface ClientModuleProps {
  initialParams?: any;
  onNavigate?: (route: AppRoute) => void;
}

type Tab = 'info' | 'cases' | 'proposals';

export const ClientModule: React.FC<ClientModuleProps> = ({ initialParams, onNavigate }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; clientId: string | null }>({ isOpen: false, clientId: null });

  const { showToast } = useToast();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientCases, setClientCases] = useState<any[]>([]);
  const [clientProposals, setClientProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (initialParams?.clientId && clients.length > 0) {
      const target = clients.find(c => c.id === initialParams.clientId);
      if (target) {
        setSelectedClient(target);
        if (initialParams.tab) setActiveTab(initialParams.tab as Tab);
      }
    }
  }, [initialParams, clients]);

  useEffect(() => {
    if (selectedClient) {
      const cases = getCasesByClientId(selectedClient.id);
      setClientCases(cases);
      getProposalsByClientId(selectedClient.id).then(setClientProposals);
    }
  }, [selectedClient]);

  const loadClients = async () => {
    setLoading(true);
    const data = await getClients();
    setClients(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    // Validations
    if (!editingClient.name) {
      showToast('error', 'Por favor, preencha o nome do cliente.');
      return;
    }
    if (!editingClient.document) {
      showToast('error', 'Por favor, preencha o CPF ou CNPJ.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingClient.id) {
        await updateClient(editingClient);
        showToast('success', 'Cliente atualizado com sucesso!');
      } else {
        await createClient(editingClient);
        showToast('success', 'Cliente cadastrado com sucesso!');
      }

      setIsDrawerOpen(false);
      setEditingClient(null);
      loadClients();
    } catch (error: any) {
      console.error(error);
      const msg = error.message || 'Erro ao salvar cliente.';
      showToast('error', `Erro: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnrichment = async () => {
    if (!editingClient?.document) return;

    setIsEnriching(true);
    const data = await fetchCompanyData(editingClient.document);

    if (data) {
      setEditingClient(prev => ({
        ...prev!,
        name: data.name,
        type: 'PJ',
        phone: data.phone || prev?.phone,
        address: {
          ...prev?.address!,
          street: data.address.street,
          number: data.address.number,
          city: data.address.city,
          state: data.address.state
        }
      }));
    } else {
      showToast('error', 'CNPJ não encontrado ou inválido.');
    }
    setIsEnriching(false);
  };

  const handleCopyPortalLink = () => {
    // Simula um link real
    const link = `https://lawagent.app/portal/login`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.document.includes(search)
  );

  if (loading) return <LoadingState message="Carregando carteira de clientes..." />;

  // Renderiza o Drawer e ConfirmDialog sempre
  const renderDrawerAndDialogs = () => (
    <>
      {isDrawerOpen && editingClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setIsDrawerOpen(false)}>
          <div className="w-full max-w-md bg-white h-full p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6 text-slate-800">{editingClient.id ? 'Editar' : 'Novo'} Cliente</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">CPF / CNPJ</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 border p-2 rounded" value={editingClient.document} onChange={e => setEditingClient({ ...editingClient, document: formatDocumentInput(e.target.value) })} maxLength={18} />
                  <button
                    type="button"
                    onClick={handleEnrichment}
                    disabled={isEnriching || !editingClient.document}
                    className="bg-slate-100 border border-slate-200 p-2 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50"
                    title="Buscar dados automaticamente"
                  >
                    {isEnriching ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Digite o CNPJ e clique na varinha para preencher automaticamente.</p>
              </div>

              <div><label className="block text-sm font-medium text-slate-700">Nome / Razão Social</label><input required type="text" className="w-full border p-2 rounded" value={editingClient.name} onChange={e => setEditingClient({ ...editingClient, name: e.target.value })} /></div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Tipo</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2"><input type="radio" name="type" checked={editingClient.type === 'PF'} onChange={() => setEditingClient({ ...editingClient, type: 'PF' })} /> Pessoa Física</label>
                  <label className="flex items-center gap-2"><input type="radio" name="type" checked={editingClient.type === 'PJ'} onChange={() => setEditingClient({ ...editingClient, type: 'PJ' })} /> Pessoa Jurídica</label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 mb-3">Contato</h3>
                <div className="space-y-3">
                  <div><label className="block text-xs text-slate-500">Email</label><input type="email" className="w-full border p-2 rounded" value={editingClient.email || ''} onChange={e => setEditingClient({ ...editingClient, email: e.target.value })} /></div>
                  <div><label className="block text-xs text-slate-500">Telefone</label><input type="text" className="w-full border p-2 rounded" value={editingClient.phone || ''} onChange={e => setEditingClient({ ...editingClient, phone: formatPhoneInput(e.target.value) })} maxLength={15} /></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 mb-3">Endereço</h3>
                <div className="space-y-3">
                  <div><label className="block text-xs text-slate-500">Logradouro</label><input type="text" className="w-full border p-2 rounded" value={editingClient.address?.street || ''} onChange={e => setEditingClient({ ...editingClient, address: { ...editingClient.address!, street: e.target.value } })} /></div>
                  <div className="flex gap-2">
                    <div className="w-24"><label className="block text-xs text-slate-500">Número</label><input type="text" className="w-full border p-2 rounded" value={editingClient.address?.number || ''} onChange={e => setEditingClient({ ...editingClient, address: { ...editingClient.address!, number: e.target.value } })} /></div>
                    <div className="flex-1"><label className="block text-xs text-slate-500">Cidade</label><input type="text" className="w-full border p-2 rounded" value={editingClient.address?.city || ''} onChange={e => setEditingClient({ ...editingClient, address: { ...editingClient.address!, city: e.target.value } })} /></div>
                    <div className="w-16"><label className="block text-xs text-slate-500">UF</label><input type="text" className="w-full border p-2 rounded" value={editingClient.address?.state || ''} onChange={e => setEditingClient({ ...editingClient, address: { ...editingClient.address!, state: e.target.value } })} /></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-2 border rounded hover:bg-slate-50" disabled={isSaving}>Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-accent text-white rounded hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={isSaving}>
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={async () => {
          if (deleteConfirm.clientId) {
            try {
              await deleteClient(deleteConfirm.clientId);
              showToast('success', 'Cliente excluído com sucesso!');
              setDeleteConfirm({ isOpen: false, clientId: null });
              setSelectedClient(null);
              loadClients();
            } catch (error) {
              showToast('error', 'Erro ao excluir cliente.');
            }
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, clientId: null })}
      />
    </>
  );

  if (selectedClient) {
    return (
      <>
        {renderDrawerAndDialogs()}
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-between items-center">
            <button onClick={() => setSelectedClient(null)} className="text-sm text-slate-500 hover:text-accent flex items-center gap-1">
              &larr; Voltar para Lista
            </button>

            <button
              onClick={handleCopyPortalLink}
              className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded border transition-colors ${copiedLink ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:border-accent hover:text-accent'}`}
            >
              {copiedLink ? <div className="flex items-center gap-1">Copiado!</div> : <><Globe size={14} /> Link do Portal</>}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  {selectedClient.type === 'PF' ? <User size={32} /> : <Building2 size={32} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h2>
                  <p className="text-slate-500 font-mono text-sm">{selectedClient.document}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingClient(selectedClient); setIsDrawerOpen(true); }} className="p-2 text-slate-400 hover:text-accent border border-slate-200 rounded-lg hover:bg-slate-50" title="Editar"><Edit2 size={18} /></button>
                <button onClick={() => setDeleteConfirm({ isOpen: true, clientId: selectedClient.id })} className="p-2 text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg hover:bg-red-50" title="Excluir"><Trash2 size={18} /></button>
              </div>
            </div>

            <div className="flex border-b border-slate-200 mb-6">
              {[{ id: 'info', label: 'Dados', icon: User }, { id: 'cases', label: `Processos (${clientCases.length})`, icon: FileText }, { id: 'proposals', label: `Propostas (${clientProposals.length})`, icon: DollarSign }].map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    <Icon size={16} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Contatos</h3>
                  <div className="flex items-center gap-3 text-slate-600"><Mail size={18} /> {selectedClient.email || '-'}</div>
                  <div className="flex items-center gap-3 text-slate-600"><Mail size={18} /> {selectedClient.email || '-'}</div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={18} />
                    <span>{selectedClient.phone || '-'}</span>
                    {selectedClient.phone && (
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => {
                            const num = selectedClient.phone?.replace(/\D/g, '');
                            window.open(`https://wa.me/55${num}?text=Olá ${selectedClient.name}, tudo bem?`, '_blank');
                          }}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedClient.phone || '');
                            showToast('success', 'Telefone copiado!');
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                          title="Copiar Telefone"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 border-b pb-2">Endereço</h3>
                  <div className="flex items-start gap-3 text-slate-600"><MapPin size={18} className="mt-1" /> <span>{selectedClient.address.street}, {selectedClient.address.number}<br />{selectedClient.address.city}/{selectedClient.address.state}</span></div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 h-fit">
                  <h3 className="font-bold text-xs uppercase text-slate-400 mb-2">Acesso ao Portal</h3>
                  <p className="text-sm text-slate-600 mb-3">O cliente pode acessar o portal usando o CPF/CNPJ.</p>
                  <button onClick={() => onNavigate && onNavigate({ module: 'portal' })} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 flex items-center gap-2 w-full justify-center">
                    <Globe size={12} /> Simular Visão do Cliente
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Processos</h3>
                  <button onClick={() => onNavigate && onNavigate({ module: 'cases', params: { clientId: selectedClient.id } })} className="text-sm bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">+ Novo</button>
                </div>
                {clientCases.length === 0 ? <EmptyState title="Nenhum processo" description="Este cliente ainda não possui processos." icon={FileText} /> : (
                  <div className="grid gap-4">
                    {clientCases.map(c => (
                      <button
                        key={c.id}
                        onClick={() => onNavigate && onNavigate({ module: 'cases', params: { caseId: c.id } })}
                        className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center hover:border-accent transition-all text-left"
                      >
                        <div><h4 className="font-medium text-slate-800">{c.title}</h4><p className="text-xs text-slate-500 font-mono">{c.cnjNumber}</p></div>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">{c.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'proposals' && (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Histórico de Propostas</h3>
                  <button onClick={() => onNavigate && onNavigate({ module: 'calculator', params: { clientName: selectedClient.name } })} className="text-sm bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">+ Nova Simulação</button>
                </div>
                {clientProposals.length === 0 ? <EmptyState title="Nenhuma proposta" description="Gere orçamentos na calculadora." icon={ScrollText} /> : (
                  <div className="grid gap-4">
                    {clientProposals.map(p => (
                      <div key={p.id} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-accent transition-colors">
                        <div><h4 className="font-medium text-slate-800">{p.serviceDescription}</h4><p className="text-xs text-slate-500 mt-1">{new Date(p.createdAt).toLocaleDateString()}</p></div>
                        <div className="flex items-center gap-4">
                          <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600">{p.status}</span>
                          <span className="font-bold text-slate-800">{formatCurrency(p.totalValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {renderDrawerAndDialogs()}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h1 className="text-3xl font-bold text-slate-900">Clientes</h1><p className="text-slate-500">Gestão de carteira.</p></div>
          <button onClick={() => { setEditingClient({ id: '', type: 'PF', name: '', document: '', address: { street: '', number: '', city: '', state: '' } } as Client); setIsDrawerOpen(true); }} className="bg-accent hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"><Plus size={20} /> Novo</button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-accent" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button
              onClick={() => exportClientsToCSV(filteredClients)}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium transition-colors"
              title="Exportar para CSV"
            >
              <Download size={16} /> Exportar
            </button>
          </div>

          {filteredClients.length === 0 ? <EmptyState title={search ? "Nenhum resultado" : "Carteira vazia"} description={search ? "Tente outro termo." : "Cadastre seu primeiro cliente."} icon={User} /> : (
            <div className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <div key={client.id} onClick={() => setSelectedClient(client)} className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-accent">{client.type === 'PF' ? <User size={20} /> : <Building2 size={20} />}</div>
                    <div><h4 className="font-medium text-slate-800 group-hover:text-accent">{client.name}</h4><p className="text-xs text-slate-500 font-mono">{client.document}</p></div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-accent" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
