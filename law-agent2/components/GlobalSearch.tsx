
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, FileText, CheckSquare, ChevronRight } from 'lucide-react';
import { AppRoute } from '../types';
import { getClients } from '../services/clientService';
import { getCases } from '../services/caseService';
import { getTasks } from '../services/taskService';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
}

interface SearchResult {
  id: string;
  type: 'CLIENT' | 'CASE' | 'TASK';
  title: string;
  subtitle?: string;
  route: AppRoute;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus ao abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Lógica de Busca
  useEffect(() => {
    const performSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      const term = query.toLowerCase();
      const [clients, cases, tasks] = await Promise.all([
        getClients(),
        getCases(),
        getTasks()
      ]);

      const foundClients: SearchResult[] = clients
        .filter(c => c.name.toLowerCase().includes(term) || c.document.includes(term))
        .map(c => ({
          id: c.id,
          type: 'CLIENT',
          title: c.name,
          subtitle: `Cliente • ${c.document}`,
          route: { module: 'clients', params: { clientId: c.id } }
        }));

      const foundCases: SearchResult[] = cases
        .filter(c => c.title.toLowerCase().includes(term) || (c.cnjNumber && c.cnjNumber.includes(term)))
        .map(c => ({
          id: c.id,
          type: 'CASE',
          title: c.title,
          subtitle: `Processo • ${c.cnjNumber || 'Sem CNJ'}`,
          route: { module: 'cases', params: { caseId: c.id } }
        }));

      const foundTasks: SearchResult[] = tasks
        .filter(t => t.title.toLowerCase().includes(term))
        .map(t => ({
          id: t.id,
          type: 'TASK',
          title: t.title,
          subtitle: `Tarefa • ${t.status}`,
          route: { module: 'tasks' } // Tarefas não têm deep link detalhado ainda, vai para o board
        }));

      setResults([...foundClients, ...foundCases, ...foundTasks].slice(0, 10));
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.route);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]">
        
        {/* Header de Busca */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <Search className="text-slate-400" size={24} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Buscar clientes, processos, tarefas..." 
            className="flex-1 text-lg outline-none text-slate-800 placeholder:text-slate-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto flex-1 bg-slate-50/50">
          {results.length > 0 ? (
            <div className="py-2">
              <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Melhores Correspondências</p>
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-accent/10 group transition-colors text-left border-l-4 border-transparent hover:border-accent"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-accent group-hover:bg-white transition-colors
                    ${result.type === 'CLIENT' ? 'bg-violet-100' : result.type === 'CASE' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                    {result.type === 'CLIENT' && <User size={20} />}
                    {result.type === 'CASE' && <FileText size={20} />}
                    {result.type === 'TASK' && <CheckSquare size={20} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800 group-hover:text-accent">{result.title}</h4>
                    <p className="text-xs text-slate-500">{result.subtitle}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : query.length > 1 ? (
             <div className="p-8 text-center text-slate-400">
               <Search size={32} className="mx-auto mb-3 opacity-20" />
               <p>Não encontramos nada para "{query}"</p>
             </div>
          ) : (
             <div className="p-8 text-center text-slate-400 text-sm">
               Digite para pesquisar em todo o escritório...
             </div>
          )}
        </div>
        
        <div className="bg-slate-100 p-2 text-[10px] text-slate-400 text-center border-t border-slate-200">
           Esc para fechar • Clique para navegar
        </div>
      </div>
    </div>
  );
};
