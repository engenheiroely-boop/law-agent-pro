
import React, { useState, useRef } from 'react';
import { Brain, Send, FileText, CheckSquare, Upload, Sparkles, MessageSquare, User, AlertCircle, ChevronRight, Loader2, ShieldAlert, Gavel, Scale } from 'lucide-react';
import { analyzeContract, suggestJurisprudence, chatWithLawFirmData } from '../services/aiService';
import { AIAnalysisResult, JurisprudenceSuggestion, ChatMessage, Priority } from '../types';
import { createTask } from '../services/taskService';
import { createCase } from '../services/caseService';
import { LoadingState } from './ui/States';

export const IntelligenceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ANALYZER' | 'CHAT'>('ANALYZER');

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="text-accent" /> Inteligência Artificial
          </h1>
          <p className="text-slate-500">Seu assistente jurídico ativo.</p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ANALYZER')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ANALYZER' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <FileText size={18} /> Analisador de Documentos
        </button>
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'CHAT' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <MessageSquare size={18} /> Chat com o Escritório
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm relative">
        {activeTab === 'ANALYZER' ? <DocumentAnalyzer /> : <FirmChat />}
      </div>
    </div>
  );
};

const DocumentAnalyzer = () => {
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [tasksAdded, setTasksAdded] = useState<string[]>([]);
  const [activeFeature, setActiveFeature] = useState<'CONTRACT' | 'JURISPRUDENCE'>('CONTRACT');
  const [jurisprudenceResults, setJurisprudenceResults] = useState<JurisprudenceSuggestion[]>([]);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; data: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic client-side validation for PDF/Images (Gemini supports these)
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      alert("A versão atual suporta apenas PDF e Imagens para análise direta.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64
      const base64Data = result.split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!textInput.trim() && !selectedFile) return;
    setIsAnalyzing(true);
    setResult(null);
    setJurisprudenceResults([]);

    try {
      if (activeFeature === 'CONTRACT') {
        const attachment = selectedFile ? { mimeType: selectedFile.type, data: selectedFile.data } : undefined;
        const data = await analyzeContract(textInput, attachment);
        setResult(data);
      } else {
        const data = await suggestJurisprudence(textInput);
        setJurisprudenceResults(data);
      }
    } catch (error) {
      alert("Erro na análise. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTask = async (task: any, index: number) => {
    await createTask({
      title: task.title,
      description: task.description,
      priority: task.priority as Priority,
      dueDate: task.deadline,
      status: 'TODO'
    });
    setTasksAdded([...tasksAdded, index.toString()]);
  };

  const handleCreateCase = async () => {
    if (!result?.extractedMetadata) return;
    const meta = result.extractedMetadata;
    await createCase({
      title: `Processo ${meta.caseNumber || 'Novo'}`,
      cnjNumber: meta.caseNumber,
      value: meta.value || 0,
      court: meta.court
    });
    alert("Processo cadastrado com sucesso!");
  };

  if (isAnalyzing) return <LoadingState message="Lendo e interpretando documento jurídico..." />;

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Input Area */}
      <div className="flex-1 p-6 border-r border-slate-100 flex flex-col">
        <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveFeature('CONTRACT')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeFeature === 'CONTRACT' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldAlert size={14} /> Análise de Contrato
          </button>
          <button
            onClick={() => setActiveFeature('JURISPRUDENCE')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeFeature === 'JURISPRUDENCE' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Gavel size={14} /> Jurisprudência
          </button>
        </div>

        <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
          {activeFeature === 'CONTRACT' ? 'Documento para Análise' : 'Descreva o caso'}
        </h3>

        {/* File Upload UI */}
        {activeFeature === 'CONTRACT' && (
          <div className="mb-3">
            <input
              type="file"
              id="doc-upload"
              className="hidden"
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />
            <label
              htmlFor="doc-upload"
              className={`flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${selectedFile ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-300 hover:border-slate-400 text-slate-500'}`}
            >
              {selectedFile ? (
                <>
                  <CheckSquare size={18} />
                  <span className="text-sm font-medium truncate">{selectedFile.name} (Pronto para análise)</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span className="text-sm font-medium">Clique para enviar PDF ou Imagem</span>
                </>
              )}
            </label>
            {selectedFile && (
              <button
                onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                className="text-xs text-red-500 hover:underline mt-1 ml-1"
              >
                Remover arquivo
              </button>
            )}
          </div>
        )}

        <textarea
          className="flex-1 w-full p-4 border border-slate-200 rounded-lg bg-slate-50 text-sm font-mono resize-none focus:outline-none focus:border-accent"
          placeholder={selectedFile ? "Adicione observações extras ou contexto para a IA..." : "Ou cole aqui o teor da intimação, sentença ou inicial..."}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={(!textInput.trim() && !selectedFile) || isAnalyzing}
          className="mt-4 w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {isAnalyzing ? 'Analisando...' : activeFeature === 'CONTRACT' ? 'Analisar Documento' : 'Buscar Jurisprudência'}
        </button>
      </div>

      {/* Result Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
        {(!result && jurisprudenceResults.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>{activeFeature === 'CONTRACT' ? 'Cole a minuta do contrato para análise de riscos.' : 'Descreva o caso para buscar jurisprudência similar.'}</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4">

            {result && activeFeature === 'CONTRACT' && (
              <>
                {/* Resumo */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Parecer da IA</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
                </div>

                {/* Riscos Identificados */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <ShieldAlert size={14} /> Riscos e Pontos de Atenção
                  </h4>
                  {result.risks.map((risk, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border-l-4 ${risk.severity === 'high' ? 'bg-red-50 border-red-500 text-red-800' : risk.severity === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-blue-50 border-blue-500 text-blue-800'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold uppercase">{risk.severity === 'high' ? 'Alto Risco' : risk.severity === 'medium' ? 'Médio Risco' : 'Atenção'}</span>
                      </div>
                      <p className="text-sm">{risk.description}</p>
                    </div>
                  ))}
                </div>

                {/* Análise de Cláusulas */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 p-2 border-b border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase px-2">Análise Detalhada</h4>
                  </div>
                  {result.clauses.map((clause, idx) => (
                    <div key={idx} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <h5 className="font-bold text-sm text-slate-800 mb-1">{clause.title}</h5>
                      <p className="text-sm text-slate-600">{clause.analysis}</p>
                    </div>
                  ))}
                </div>

                {/* Sugestões */}
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> Sugestões de Melhoria
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations?.map((sugg, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-emerald-800">
                        <div className="min-w-[4px] h-[4px] bg-emerald-400 rounded-full mt-2" />
                        {sugg}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {jurisprudenceResults.length > 0 && activeFeature === 'JURISPRUDENCE' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Scale size={14} /> Jurisprudência Encontrada
                </h4>
                {jurisprudenceResults.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-accent transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold mr-2">{item.court}</span>
                        <h5 className="text-sm font-bold text-indigo-700 inline">{item.title}</h5>
                      </div>
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                        <Sparkles size={10} />
                        <span className="text-xs font-bold">{item.relevance}% Relevância</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.summary}</p>
                    <button className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                      Ver Inteiro Teor <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FirmChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'system', content: 'Olá! Sou o Law Agent. Posso consultar seus clientes, processos e financeiro. O que deseja saber?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    const responseText = await chatWithLawFirmData(userMsg.content, messages);

    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm 
                   ${msg.role === 'user'
                ? 'bg-slate-900 text-white rounded-br-none'
                : msg.role === 'system'
                  ? 'bg-amber-50 text-amber-800 border border-amber-100'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
              {msg.role === 'assistant' && <div className="flex items-center gap-2 text-accent font-bold text-xs mb-1"><Sparkles size={12} /> Law Agent</div>}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-200 flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Consultando base de dados...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-accent text-sm"
            placeholder="Pergunte algo sobre seu escritório..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-accent text-white p-3 rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">A IA tem acesso apenas aos dados locais do seu navegador para responder.</p>
      </div>
    </div>
  );
};
