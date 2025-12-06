
import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Calendar, AlertCircle, Clock,
  CheckCircle, MoreHorizontal, ChevronRight, ChevronLeft, Calculator
} from 'lucide-react';
import { Task, TaskStatus, Priority, Client, LegalCase } from '../types';
import { getTasks, createTask, updateTaskStatus, deleteTask, calculateDeadline } from '../services/taskService';
import { getClients } from '../services/clientService';
import { getCases } from '../services/caseService';
import { LoadingState, EmptyState } from './ui/States';

interface TaskModuleProps {
  initialParams?: any;
}

export const TaskModule: React.FC<TaskModuleProps> = ({ initialParams }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);

  // Form State
  const [newTask, setNewTask] = useState<Partial<Task>>({
    priority: 'MEDIUM',
    status: 'TODO'
  });

  // Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDays, setCalcDays] = useState(15);
  const [calcType, setCalcType] = useState<'BUSINESS' | 'CALENDAR'>('BUSINESS');
  const [calcStart, setCalcStart] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialParams?.caseId && cases.length > 0) {
      const relatedCase = cases.find(c => c.id === initialParams.caseId);
      if (relatedCase) {
        setNewTask(prev => ({
          ...prev,
          caseId: relatedCase.id,
          clientId: relatedCase.clientId,
          title: `Tarefa: ${relatedCase.title}`
        }));
        setIsModalOpen(true);
      }
    }
  }, [initialParams, cases]);

  // Effect para calcular data automaticamente quando os inputs da calculadora mudam
  useEffect(() => {
    if (showCalculator && calcStart && calcDays > 0) {
      const deadline = calculateDeadline(calcStart, calcDays, calcType);
      setNewTask(prev => ({ ...prev, dueDate: deadline }));
    }
  }, [showCalculator, calcDays, calcType, calcStart]);

  const loadData = async () => {
    setLoading(true);
    const [tData, cData, caseData] = await Promise.all([getTasks(), getClients(), getCases()]);
    setTasks(tData);
    setClients(cData);
    setCases(caseData);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    await createTask(newTask);
    setIsModalOpen(false);
    setNewTask({ priority: 'MEDIUM', status: 'TODO' });
    setShowCalculator(false); // Reset calculator
    loadData();
  };

  const handleMove = async (task: Task, direction: 'next' | 'prev') => {
    const flow: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'WAITING', 'DONE'];
    const currentIndex = flow.indexOf(task.status);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < flow.length) {
      await updateTaskStatus(task.id, flow[nextIndex]);
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: flow[nextIndex] } : t));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name;

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border
          ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' :
            task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-slate-50 text-slate-500 border-slate-100'}`}>
          {task.priority === 'HIGH' ? 'Urgente' : task.priority === 'MEDIUM' ? 'Normal' : 'Baixa'}
        </span>
        <button onClick={() => handleDelete(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          &times;
        </button>
      </div>

      <h4 className="font-medium text-slate-800 text-sm mb-1">{task.title}</h4>

      {task.clientId && (
        <p className="text-xs text-slate-500 mb-2 truncate">
          👤 {getClientName(task.clientId)}
        </p>
      )}

      {task.dueDate && (
        <div className={`flex items-center gap-1 text-xs mb-3
          ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-600 font-medium' : 'text-slate-400'}`}>
          <Calendar size={12} />
          {new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <button
          onClick={() => handleMove(task, 'prev')}
          disabled={task.status === 'TODO'}
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => handleMove(task, 'next')}
          disabled={task.status === 'DONE'}
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const KanbanColumn = ({ title, status, icon: Icon, color }: any) => {
    const columnTasks = tasks.filter(t => t.status === status);
    return (
      <div className="flex-1 min-w-[280px] bg-slate-50/50 rounded-xl border border-slate-200 flex flex-col max-h-full">
        <div className={`p-3 border-b border-slate-200 flex justify-between items-center ${color} bg-opacity-10 rounded-t-xl`}>
          <div className="flex items-center gap-2 font-bold text-sm text-slate-700">
            <Icon size={16} />
            {title}
          </div>
          <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm">
            {columnTasks.length}
          </span>
        </div>
        <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          {columnTasks.map(t => <TaskCard key={t.id} task={t} />)}
          {columnTasks.length === 0 && (
            <div className="text-center py-8 text-slate-300 text-xs italic">
              Vazio
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <LoadingState message="Organizando tarefas..." />;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tarefas</h1>
          <p className="text-slate-500">Gestão de prazos e produção.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus size={20} /> Nova Tarefa
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        <KanbanColumn title="A Fazer" status="TODO" icon={AlertCircle} color="bg-slate-200" />
        <KanbanColumn title="Em Andamento" status="IN_PROGRESS" icon={Clock} color="bg-blue-200" />
        <KanbanColumn title="Aguardando" status="WAITING" icon={MoreHorizontal} color="bg-amber-200" />
        <KanbanColumn title="Concluído" status="DONE" icon={CheckCircle} color="bg-emerald-200" />
      </div>

      {/* Modal Criar Tarefa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Nova Tarefa</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">O que precisa ser feito?</label>
                <input required autoFocus type="text" className="w-full border p-2 rounded" placeholder="Ex: Protocolar Petição Inicial" value={newTask.title || ''} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              </div>

              {/* Calculadora de Prazos */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Calendar size={14} /> Prazo Fatal
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="text-xs flex items-center gap-1 text-accent hover:underline"
                  >
                    <Calculator size={12} /> {showCalculator ? 'Digitar Data Manualmente' : 'Calcular Prazo'}
                  </button>
                </div>

                {showCalculator ? (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-500">Data de Início (Publicação)</label>
                        <input type="date" className="w-full border p-1.5 rounded text-sm" value={calcStart} onChange={e => setCalcStart(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Prazo (Dias)</label>
                        <input type="number" min="1" className="w-full border p-1.5 rounded text-sm" value={calcDays} onChange={e => setCalcDays(Number(e.target.value))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCalcType('BUSINESS')}
                        className={`flex-1 py-1 text-xs rounded border ${calcType === 'BUSINESS' ? 'bg-sky-100 border-sky-200 text-sky-700 font-medium' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        Dias Úteis (CPC)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcType('CALENDAR')}
                        className={`flex-1 py-1 text-xs rounded border ${calcType === 'CALENDAR' ? 'bg-sky-100 border-sky-200 text-sky-700 font-medium' : 'bg-white border-slate-200 text-slate-600'}`}
                      >
                        Dias Corridos
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center">*Calcula fins de semana. Verifique feriados locais.</p>
                  </div>
                ) : null}

                <input
                  type="date"
                  className="w-full border p-2 rounded bg-white mt-1"
                  value={newTask.dueDate || ''}
                  onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                  disabled={showCalculator} // Trava input manual se calculadora estiver ativa
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Prioridade</label>
                  <select className="w-full border p-2 rounded" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as Priority })}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Normal</option>
                    <option value="HIGH">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Vincular Cliente</label>
                  <select className="w-full border p-2 rounded" value={newTask.clientId || ''} onChange={e => setNewTask({ ...newTask, clientId: e.target.value, caseId: undefined })}>
                    <option value="">Sem vínculo</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {newTask.clientId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Vincular Processo</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={newTask.caseId || ''}
                    onChange={e => setNewTask({ ...newTask, caseId: e.target.value })}
                  >
                    <option value="">Sem vínculo</option>
                    {cases.filter(c => c.clientId === newTask.clientId).map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.cnjNumber || 'S/N'})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-accent text-white py-2 rounded hover:bg-sky-600">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
