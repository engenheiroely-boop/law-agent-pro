import React, { useState, useEffect } from 'react';
import { FileText, Printer, Search, User, Edit3, ChevronRight, CheckCircle, Download, Upload, Folder, File, Trash2, Eye, Plus, Save, ArrowLeft, X, History, FileDown } from 'lucide-react';
import { Client, DocumentTemplate, LegalCase } from '../types';
import { getClients } from '../services/clientService';
import { getCases } from '../services/caseService';
import { DOCUMENT_TEMPLATES } from '../services/documentTemplates';
import { LoadingState, EmptyState } from './ui/States';
import { exportToDocx } from '../services/docxExportService';

// Mock File Type
interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  clientId?: string;
  caseId?: string;
}

export const DocumentsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERATOR' | 'FILES'>('GENERATOR');
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);

  // Generator State
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');

  // Substabelecimento State
  const [showSubstabelecimentoModal, setShowSubstabelecimentoModal] = useState(false);
  const [substData, setSubstData] = useState({
    nomeAdvogado: '',
    oabAdvogado: '',
    ufAdvogado: '',
    tipoReserva: 'com reservas de iguais poderes',
    numeroProcesso: '',
    varaComarca: ''
  });

  // Histórico de Documentos
  const [documentHistory, setDocumentHistory] = useState<{ id: string, title: string, clientName: string, date: string, content: string }[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Files State
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [searchClient, setSearchClient] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [cData, caseData] = await Promise.all([getClients(), getCases()]);
    setClients(cData);
    setCases(caseData);

    // Load mock files
    const savedFiles = localStorage.getItem('law_agent_files');
    if (savedFiles) setFiles(JSON.parse(savedFiles));

    // Load templates
    const savedTemplates = localStorage.getItem('law_agent_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      setTemplates(DOCUMENT_TEMPLATES);
    }

    // Load document history
    const savedHistory = localStorage.getItem('law_agent_doc_history');
    if (savedHistory) setDocumentHistory(JSON.parse(savedHistory));

    setLoading(false);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateTitle) return;

    const newTemplate: DocumentTemplate = {
      id: crypto.randomUUID(),
      title: newTemplateTitle,
      description: 'Modelo personalizado',
      content: generatedContent
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('law_agent_templates', JSON.stringify(updatedTemplates));
    setShowNewTemplateModal(false);
    setNewTemplateTitle('');
    setSelectedTemplate(newTemplate);
    alert('Modelo salvo com sucesso!');
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Excluir este modelo?')) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem('law_agent_templates', JSON.stringify(updated));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
        setGeneratedContent('');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile: StoredFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        clientId: selectedClient?.id,
        caseId: selectedCase?.id
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      localStorage.setItem('law_agent_files', JSON.stringify(updatedFiles));
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteFile = (id: string) => {
    if (confirm('Excluir arquivo?')) {
      const updatedFiles = files.filter(f => f.id !== id);
      setFiles(updatedFiles);
      localStorage.setItem('law_agent_files', JSON.stringify(updatedFiles));
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Engine de Substituição de Variáveis
  const generateDocument = (template: DocumentTemplate, client: Client) => {
    let content = template.content;
    const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const addressStr = `${client.address.street}, ${client.address.number} - ${client.address.city}/${client.address.state}`;

    // Buscar dados do advogado das configurações
    const settingsRaw = localStorage.getItem('lawagent_settings');
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};

    const lawyerName = settings.lawyerName || 'DR. ADVOGADO';
    const oabNumber = settings.oabNumber || 'OAB/UF 00.000';
    const officeAddress = settings.officeAddress || 'Endereço Profissional, 100';

    // Extrair UF do número da OAB (formato: OAB/UF 00.000 ou apenas número)
    const oabMatch = oabNumber.match(/OAB\/([A-Z]{2})/i);
    const oabUF = oabMatch ? oabMatch[1] : 'UF';
    const oabNum = oabNumber.replace(/OAB\/[A-Z]{2}\s*/i, '').trim() || '00.000';

    // Dados do processo selecionado (se houver)
    const processoNumero = selectedCase?.processNumber || '_______________';
    const processoVara = selectedCase?.court || '_______________';

    const replacements: Record<string, string> = {
      // Dados do cliente
      '{CLIENTE_NOME}': client.name.toUpperCase(),
      '{CLIENTE_DOC}': client.document || '_______________',
      '{CLIENTE_ENDERECO}': addressStr,
      '{CLIENTE_FONE}': client.phone || '(XX) XXXXX-XXXX',
      '{CLIENTE_EMAIL}': client.email || 'email@exemplo.com',

      // Dados do advogado
      '{ADVOGADO_NOME}': lawyerName.toUpperCase(),
      '{ADVOGADO_OAB}': oabNum,
      '{ADVOGADO_UF}': oabUF,
      '{ESCRITORIO_ENDERECO}': officeAddress,

      // Data e local
      '{CIDADE_DATA}': `${client.address.city || 'Local'}, ${today}`,

      // Dados do processo
      '{PROCESSO_NUMERO}': processoNumero,
      '{PROCESSO_VARA}': processoVara,

      // Substabelecimento
      '{TIPO_RESERVA}': substData.tipoReserva || 'com reservas de iguais poderes',
      '{SUBSTABELECIDO_NOME}': substData.nomeAdvogado || '_______________',
      '{SUBSTABELECIDO_UF}': substData.ufAdvogado || 'UF',
      '{SUBSTABELECIDO_OAB}': substData.oabAdvogado || '_______________'
    };

    Object.entries(replacements).forEach(([key, value]) => {
      content = content.split(key).join(value);
    });
    return content;
  };

  // Salvar documento no histórico
  const saveToHistory = () => {
    if (!selectedTemplate || !selectedClient || !generatedContent) return;

    const newDoc = {
      id: crypto.randomUUID(),
      title: selectedTemplate.title,
      clientName: selectedClient.name,
      date: new Date().toLocaleString('pt-BR'),
      content: generatedContent
    };

    const updatedHistory = [newDoc, ...documentHistory].slice(0, 50); // Máximo 50 documentos
    setDocumentHistory(updatedHistory);
    localStorage.setItem('law_agent_doc_history', JSON.stringify(updatedHistory));
  };

  // Verificar se template é substabelecimento
  const isSubstabelecimento = (template: DocumentTemplate) => {
    return template.id === 'substabelecimento' || template.title.toLowerCase().includes('substabelecimento');
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    if (!selectedClient) {
      alert("Selecione um cliente primeiro.");
      return;
    }

    // Se for substabelecimento, mostrar modal primeiro
    if (isSubstabelecimento(template)) {
      setSelectedTemplate(template);
      setShowSubstabelecimentoModal(true);
      return;
    }

    setSelectedTemplate(template);
    setGeneratedContent(generateDocument(template, selectedClient));
    setIsEditing(false);
  };

  // Gerar substabelecimento após preencher formulário
  const handleGenerateSubstabelecimento = () => {
    if (!selectedClient || !selectedTemplate) return;
    setGeneratedContent(generateDocument(selectedTemplate, selectedClient));
    setShowSubstabelecimentoModal(false);
    setIsEditing(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedTemplate?.title || 'Documento'}</title>
            <style>
              @page {
                margin: 20mm;
                size: A4;
              }
              @media print {
                body { 
                  padding: 0; 
                  margin: 0;
                }
                /* Remove header/footer do navegador */
                @page { margin: 15mm; }
              }
              * { color: #000 !important; }
              html, body { 
                font-family: 'Times New Roman', serif; 
                padding: 20px; 
                max-width: 210mm; 
                margin: 0 auto; 
                background-color: #fff !important;
                color: #000 !important;
                line-height: 1.6;
              }
              h1, h2, h3, p, span, div, strong { color: #000 !important; }
            </style>
          </head>
          <body>${generatedContent}<script>window.print();window.onafterprint=function(){window.close();}</script></body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading) return <LoadingState message="Carregando central de documentos..." />;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documentos</h1>
          <p className="text-slate-500">Gestão de arquivos e modelos.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('GENERATOR')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'GENERATOR' ? 'bg-white shadow text-accent' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Gerador de Modelos
          </button>
          <button
            onClick={() => setActiveTab('FILES')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'FILES' ? 'bg-white shadow text-accent' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Gestão de Arquivos
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar: Context Selection (Common for both tabs) */}
        <div className="w-80 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <User size={18} className="text-slate-400" /> Seleção de Contexto
            </h2>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">1. Cliente</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  className="w-full pl-9 p-2 border border-slate-200 rounded-lg text-sm mb-2 focus:border-accent outline-none"
                  value={searchClient}
                  onChange={e => setSearchClient(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg bg-slate-50">
                {clients.filter(c => c.name.toLowerCase().includes(searchClient.toLowerCase())).map(client => (
                  <button
                    key={client.id}
                    onClick={() => { setSelectedClient(client); setSelectedCase(null); setSelectedTemplate(null); }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${selectedClient?.id === client.id ? 'bg-accent text-white hover:bg-accent' : 'text-slate-600'}`}
                  >
                    <User size={14} />
                    <span className="truncate">{client.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedClient && (
              <div className="animate-in slide-in-from-left-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">2. Processo (Opcional)</label>
                <select
                  className="w-full border p-2 rounded-lg text-sm bg-white"
                  value={selectedCase?.id || ''}
                  onChange={e => setSelectedCase(cases.find(c => c.id === e.target.value) || null)}
                >
                  <option value="">Geral (Sem processo)</option>
                  {cases.filter(c => c.clientId === selectedClient.id).map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">

          {/* TAB: GENERATOR */}
          {activeTab === 'GENERATOR' && (
            <div className="flex flex-col h-full">
              {!selectedClient ? (
                <EmptyState title="Selecione um Cliente" description="Para gerar documentos, primeiro selecione um cliente na barra lateral." icon={User} />
              ) : (
                <div className="flex h-full">
                  {/* Template List */}
                  <div className="w-64 border-r border-slate-100 p-4 overflow-y-auto flex flex-col" style={{ backgroundColor: '#fff' }}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-bold uppercase" style={{ color: '#64748b' }}>Modelos</h3>
                      <button
                        onClick={() => { setSelectedTemplate(null); setGeneratedContent(''); setIsEditing(true); }}
                        className="text-xs text-accent hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Novo
                      </button>
                    </div>
                    <div className="space-y-2 flex-1">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className={`w-full p-3 rounded-lg border text-left transition-all group relative
                               ${selectedTemplate?.id === template.id ? 'border-accent shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                          style={{ backgroundColor: selectedTemplate?.id === template.id ? '#f0f9ff' : '#fff' }}
                        >
                          <div className="flex justify-between items-center pr-4">
                            <h4
                              className="font-medium text-sm"
                              style={{ color: selectedTemplate?.id === template.id ? '#0ea5e9' : '#1e293b' }}
                            >
                              {template.title}
                            </h4>
                          </div>
                          {/* Delete Button */}
                          <div
                            onClick={(e) => handleDeleteTemplate(template.id, e)}
                            className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                            style={{ color: '#94a3b8' }}
                          >
                            <Trash2 size={12} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editor/Preview */}
                  <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f1f5f9' }}>
                    {selectedTemplate ? (
                      <>
                        <div className="p-3 border-b" style={{ backgroundColor: '#fff', borderColor: '#e2e8f0' }}>
                          {/* Header com título e botão voltar */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setSelectedTemplate(null); setGeneratedContent(''); setIsEditing(false); }}
                                className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                                style={{ color: '#64748b' }}
                                title="Voltar para lista de modelos"
                              >
                                <ArrowLeft size={18} />
                              </button>
                              <span className="text-sm font-bold" style={{ color: '#1e293b' }}>{selectedTemplate.title}</span>
                            </div>
                            <button
                              onClick={() => { setSelectedTemplate(null); setGeneratedContent(''); setIsEditing(false); }}
                              className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                              style={{ color: '#94a3b8' }}
                              title="Fechar documento"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          {/* Botões de ação */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setShowNewTemplateModal(true)}
                              className="px-3 py-2 text-xs font-medium rounded border flex items-center gap-1 hover:bg-slate-50"
                              style={{ backgroundColor: '#fff', borderColor: '#94a3b8', color: '#1e293b' }}
                            >
                              <Save size={14} /> Salvar
                            </button>
                            <button
                              onClick={() => setIsEditing(!isEditing)}
                              className="px-3 py-2 text-xs font-medium rounded border flex items-center gap-1 hover:bg-slate-50"
                              style={{
                                backgroundColor: isEditing ? '#e2e8f0' : '#fff',
                                borderColor: '#94a3b8',
                                color: '#1e293b'
                              }}
                            >
                              <Edit3 size={14} /> {isEditing ? 'Ver' : 'Editar'}
                            </button>
                            <button
                              onClick={handlePrint}
                              className="px-3 py-2 text-xs font-medium rounded flex items-center gap-1 hover:opacity-90"
                              style={{ backgroundColor: '#0ea5e9', color: '#fff' }}
                            >
                              <Printer size={14} /> Imprimir
                            </button>
                            <button
                              onClick={() => exportToDocx(generatedContent, selectedTemplate?.title || 'documento')}
                              className="px-3 py-2 text-xs font-medium rounded flex items-center gap-1 hover:opacity-90"
                              style={{ backgroundColor: '#2563eb', color: '#fff' }}
                              title="Exportar como Word (.docx)"
                            >
                              <FileDown size={14} /> DOCX
                            </button>
                            <button
                              onClick={() => { saveToHistory(); }}
                              className="px-3 py-2 text-xs font-medium rounded border flex items-center gap-1 hover:bg-slate-50"
                              style={{ backgroundColor: '#fff', borderColor: '#94a3b8', color: '#1e293b' }}
                              title="Salvar documento no histórico"
                            >
                              <Save size={14} /> Histórico
                            </button>
                            <button
                              onClick={() => setShowHistoryModal(true)}
                              className="px-3 py-2 text-xs font-medium rounded border flex items-center gap-1 hover:bg-slate-50"
                              style={{ backgroundColor: '#fff', borderColor: '#94a3b8', color: '#1e293b' }}
                              title="Ver documentos salvos"
                            >
                              <History size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto relative" style={{ backgroundColor: '#e2e8f0' }}>
                          <div
                            className="shadow-lg mx-auto text-sm leading-relaxed outline-none"
                            contentEditable={isEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => setGeneratedContent(e.currentTarget.innerHTML)}
                            dangerouslySetInnerHTML={{ __html: generatedContent }}
                            style={{
                              fontFamily: '"Times New Roman", serif',
                              color: '#000',
                              backgroundColor: '#fff',
                              width: '210mm',
                              minHeight: '297mm',
                              padding: '25mm',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <EmptyState
                        title="Gerador de Documentos"
                        description="Selecione um cliente e um modelo para gerar documentos automaticamente."
                        icon={FileText}
                      />
                    )}
                  </div>

                  {/* Modal Salvar Modelo */}
                  {showNewTemplateModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <h2 className="text-lg font-bold mb-4">Salvar Novo Modelo</h2>
                        <p className="text-sm text-slate-500 mb-4">O conteúdo atual do editor será salvo como um novo modelo reutilizável.</p>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Modelo</label>
                          <input
                            autoFocus
                            type="text"
                            className="w-full border p-2 rounded"
                            placeholder="Ex: Petição Inicial - Divórcio"
                            value={newTemplateTitle}
                            onChange={e => setNewTemplateTitle(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-3">
                          <button onClick={() => setShowNewTemplateModal(false)} className="flex-1 border py-2 rounded hover:bg-slate-50">Cancelar</button>
                          <button onClick={handleSaveTemplate} className="flex-1 bg-accent text-white py-2 rounded hover:bg-sky-600">Salvar</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: FILES */}
          {activeTab === 'FILES' && (
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Folder size={20} className="text-amber-400" />
                  Arquivos {selectedClient ? `de ${selectedClient.name}` : 'do Escritório'}
                </h3>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={!selectedClient}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors
                           ${selectedClient ? 'bg-accent text-white hover:bg-sky-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >
                    <Upload size={18} /> Upload Arquivo
                  </label>
                </div>
              </div>

              {!selectedClient ? (
                <EmptyState title="Selecione um Cliente" description="Selecione um cliente para gerenciar seus arquivos." icon={Folder} />
              ) : (
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                  <div className="grid grid-cols-12 gap-4 p-3 border-b border-slate-200 bg-slate-100 text-xs font-bold text-slate-500 uppercase">
                    <div className="col-span-6">Nome</div>
                    <div className="col-span-2">Tamanho</div>
                    <div className="col-span-3">Data</div>
                    <div className="col-span-1 text-center">Ações</div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {files.filter(f => f.clientId === selectedClient.id && (!selectedCase || f.caseId === selectedCase.id)).length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <Folder size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Nenhum arquivo encontrado.</p>
                      </div>
                    ) : (
                      files.filter(f => f.clientId === selectedClient.id && (!selectedCase || f.caseId === selectedCase.id)).map(file => (
                        <div key={file.id} className="grid grid-cols-12 gap-4 p-3 rounded bg-white border border-slate-100 items-center hover:border-accent/30 transition-colors group">
                          <div className="col-span-6 flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded text-slate-500">
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm truncate">{file.name}</p>
                              {file.caseId && <p className="text-[10px] text-slate-400">Processo vinculado</p>}
                            </div>
                          </div>
                          <div className="col-span-2 text-xs text-slate-500">{formatSize(file.size)}</div>
                          <div className="col-span-3 text-xs text-slate-500">{new Date(file.uploadDate).toLocaleDateString()}</div>
                          <div className="col-span-1 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-slate-400 hover:text-accent hover:bg-slate-50 rounded"><Download size={16} /></button>
                            <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Substabelecimento */}
      {showSubstabelecimentoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSubstabelecimentoModal(false)}>
          <div className="rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" style={{ backgroundColor: '#fff' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1e293b' }}>Dados do Substabelecimento</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>Nome do Advogado Substabelecido</label>
                <input
                  type="text"
                  value={substData.nomeAdvogado}
                  onChange={(e) => setSubstData({ ...substData, nomeAdvogado: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#cbd5e1', color: '#1e293b', backgroundColor: '#fff' }}
                  placeholder="Dr(a). Nome Completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>UF</label>
                  <input
                    type="text"
                    value={substData.ufAdvogado}
                    onChange={(e) => setSubstData({ ...substData, ufAdvogado: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ borderColor: '#cbd5e1', color: '#1e293b', backgroundColor: '#fff' }}
                    placeholder="SC"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>Nº OAB</label>
                  <input
                    type="text"
                    value={substData.oabAdvogado}
                    onChange={(e) => setSubstData({ ...substData, oabAdvogado: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ borderColor: '#cbd5e1', color: '#1e293b', backgroundColor: '#fff' }}
                    placeholder="12.345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>Tipo de Reserva</label>
                <select
                  value={substData.tipoReserva}
                  onChange={(e) => setSubstData({ ...substData, tipoReserva: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#cbd5e1', color: '#1e293b', backgroundColor: '#fff' }}
                >
                  <option value="com reservas de iguais poderes">Com reservas de iguais poderes</option>
                  <option value="sem reservas de poderes">Sem reservas de poderes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>Nº do Processo</label>
                <input
                  type="text"
                  value={substData.numeroProcesso}
                  onChange={(e) => setSubstData({ ...substData, numeroProcesso: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#cbd5e1', color: '#1e293b', backgroundColor: '#fff' }}
                  placeholder="0000000-00.0000.0.00.0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#475569' }}>Vara/Comarca</label>
                <input
                  type="text"
                  value={substData.varaComarca}
                  onChange={(e) => setSubstData({ ...substData, varaComarca: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ borderColor: '#cbd5e1', color: '#1e293b', backgroundColor: '#fff' }}
                  placeholder="1ª Vara Cível de Florianópolis/SC"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubstabelecimentoModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium"
                style={{ borderColor: '#cbd5e1', color: '#475569', backgroundColor: '#fff' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateSubstabelecimento}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#0ea5e9', color: '#fff' }}
              >
                Gerar Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico de Documentos */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHistoryModal(false)}>
          <div className="rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden shadow-2xl" style={{ backgroundColor: '#fff' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1e293b' }}>Histórico de Documentos</h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {documentHistory.length === 0 ? (
                <p className="text-center py-8" style={{ color: '#94a3b8' }}>Nenhum documento no histórico</p>
              ) : (
                <div className="space-y-2">
                  {documentHistory.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      style={{ borderColor: '#e2e8f0' }}
                      onClick={() => {
                        setGeneratedContent(doc.content);
                        setShowHistoryModal(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm" style={{ color: '#1e293b' }}>{doc.title}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{doc.clientName}</p>
                        </div>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{doc.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
