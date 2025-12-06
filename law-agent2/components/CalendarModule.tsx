
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, DollarSign, CheckSquare, AlertCircle, Plus, X } from 'lucide-react';
import { getTasks, createTask } from '../services/taskService';
import { getCases } from '../services/caseService';
import { getTransactions } from '../services/financialService';
import { getClients } from '../services/clientService';
import { Task, LegalCase, FinancialTransaction, Client, Priority } from '../types';
import { LoadingState } from './ui/States';
import { formatCurrency } from '../services/feeEngine';

interface CalendarEvent {
   id: string;
   date: Date;
   title: string;
   type: 'TASK' | 'HEARING' | 'FINANCE';
   priority?: 'HIGH' | 'MEDIUM' | 'LOW';
   status?: string;
   description?: string;
   meta?: any;
}

export const CalendarModule: React.FC = () => {
   const [currentDate, setCurrentDate] = useState(new Date());
   const [events, setEvents] = useState<CalendarEvent[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedDate, setSelectedDate] = useState<Date>(new Date());

   // Estado para modal de nova tarefa
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [clients, setClients] = useState<Client[]>([]);
   const [newTask, setNewTask] = useState<Partial<Task>>({
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date().toISOString().split('T')[0]
   });
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      loadData();
   }, []);

   const loadData = async () => {
      setLoading(true);
      const [tasks, cases, transactions, clientsData] = await Promise.all([
         getTasks(),
         getCases(),
         getTransactions(),
         getClients()
      ]);

      setClients(clientsData);

      const mappedEvents: CalendarEvent[] = [];

      // 1. Mapear Tarefas (Prazos)
      tasks.forEach(task => {
         if (task.dueDate && task.status !== 'DONE') {
            mappedEvents.push({
               id: task.id,
               date: new Date(task.dueDate),
               title: task.title,
               type: 'TASK',
               priority: task.priority,
               description: task.description,
               status: task.status
            });
         }
      });

      // 2. Mapear Audiências (Timeline dos Processos)
      cases.forEach(legalCase => {
         if (legalCase.timeline) {
            legalCase.timeline.forEach(evt => {
               if (evt.type === 'HEARING' || evt.type === 'DEADLINE') {
                  mappedEvents.push({
                     id: evt.id,
                     date: new Date(evt.date),
                     title: `${evt.type === 'HEARING' ? 'Audiência' : 'Prazo'}: ${legalCase.title}`,
                     type: 'HEARING',
                     description: evt.title,
                     meta: { caseNumber: legalCase.cnjNumber }
                  });
               }
            });
         }
      });

      // 3. Mapear Financeiro (Recebimentos)
      transactions.forEach(tx => {
         if (tx.status === 'PENDING' && tx.type === 'INCOME') {
            mappedEvents.push({
               id: tx.id,
               date: new Date(tx.dueDate),
               title: `Receber: ${formatCurrency(tx.amount)}`,
               type: 'FINANCE',
               description: tx.description
            });
         }
      });

      setEvents(mappedEvents);
      setLoading(false);
   };

   // Navegação do Mês
   const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
   };

   const prevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
   };

   // Lógica do Grid do Calendário
   const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Domingo

      const days = [];
      // Preencher dias vazios antes do dia 1
      for (let i = 0; i < firstDayOfWeek; i++) {
         days.push(null);
      }
      // Preencher dias do mês
      for (let i = 1; i <= daysInMonth; i++) {
         days.push(new Date(year, month, i));
      }
      return days;
   };

   // Abrir modal com data pré-selecionada
   const handleAddTask = () => {
      setNewTask({
         priority: 'MEDIUM',
         status: 'TODO',
         dueDate: selectedDate.toISOString().split('T')[0]
      });
      setIsModalOpen(true);
   };

   // Salvar nova tarefa
   const handleSaveTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTask.title) return;

      setSaving(true);
      try {
         await createTask(newTask);
         setIsModalOpen(false);
         setNewTask({ priority: 'MEDIUM', status: 'TODO' });
         await loadData(); // Recarregar eventos
      } catch (error) {
         console.error('Erro ao salvar tarefa:', error);
      } finally {
         setSaving(false);
      }
   };

   const days = getDaysInMonth(currentDate);
   const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

   // Filtrar eventos do dia selecionado
   const eventsOnSelectedDate = events.filter(e =>
      e.date.toDateString() === selectedDate.toDateString()
   );

   if (loading) return <LoadingState message="Sincronizando agenda..." />;

   return (
      <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 animate-in fade-in">

         {/* Coluna Esquerda: Calendário Visual */}
         <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
               <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
                  <CalendarIcon className="text-accent" /> {monthName}
               </h2>
               <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"><ChevronLeft size={20} /></button>
                  <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"><ChevronRight size={20} /></button>
               </div>
            </div>

            {/* Grid Dias da Semana */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
               {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                     {d}
                  </div>
               ))}
            </div>

            {/* Grid Dias */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
               {days.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="bg-slate-50/30 border-b border-r border-slate-100" />;

                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = date.toDateString() === selectedDate.toDateString();

                  // Eventos do dia
                  const dayEvents = events.filter(e => e.date.toDateString() === date.toDateString());
                  const hasHighPriority = dayEvents.some(e => e.priority === 'HIGH');
                  const hasHearing = dayEvents.some(e => e.type === 'HEARING');

                  return (
                     <div
                        key={date.toString()}
                        onClick={() => setSelectedDate(date)}
                        className={`border-b border-r border-slate-100 p-2 relative cursor-pointer transition-colors min-h-[80px]
                       ${isSelected ? 'bg-blue-50/50 ring-2 ring-inset ring-accent' : 'hover:bg-slate-50'}
                       ${isToday ? 'bg-amber-50/30' : ''}
                    `}
                     >
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday ? 'bg-amber-500 text-white' : isSelected ? 'text-accent' : 'text-slate-700'}
                     `}>
                           {date.getDate()}
                        </span>

                        {/* Dots Indicadores */}
                        <div className="flex flex-wrap gap-1 mt-1">
                           {dayEvents.slice(0, 4).map((evt, i) => (
                              <div
                                 key={i}
                                 className={`w-1.5 h-1.5 rounded-full 
                                ${evt.type === 'TASK' ? (evt.priority === 'HIGH' ? 'bg-red-500' : 'bg-slate-400') :
                                       evt.type === 'HEARING' ? 'bg-violet-500' : 'bg-emerald-500'}`}
                              />
                           ))}
                           {dayEvents.length > 4 && <span className="text-[8px] text-slate-400">+</span>}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Coluna Direita: Detalhes do Dia */}
         <div className="w-full md:w-80 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
               <p className="text-xs text-slate-500 uppercase font-bold">Agenda do Dia</p>
               <h3 className="text-2xl font-bold text-slate-800 capitalize">
                  {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}
               </h3>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
               {eventsOnSelectedDate.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                     <Clock size={32} className="mx-auto mb-2 opacity-20" />
                     <p className="text-sm">Nenhum compromisso.</p>
                     <button
                        onClick={handleAddTask}
                        className="mt-4 text-xs text-accent hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                     >
                        <Plus size={12} /> Adicionar Tarefa
                     </button>
                  </div>
               ) : (
                  eventsOnSelectedDate.map(evt => (
                     <div key={evt.id} className={`p-3 rounded-lg border border-l-4 shadow-sm flex flex-col gap-1
                     ${evt.type === 'TASK' ? 'border-slate-200 border-l-slate-400' :
                           evt.type === 'HEARING' ? 'border-violet-100 border-l-violet-500 bg-violet-50/30' :
                              'border-emerald-100 border-l-emerald-500 bg-emerald-50/30'}`}
                     >
                        <div className="flex justify-between items-start">
                           <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded
                           ${evt.type === 'TASK' ? 'bg-slate-100 text-slate-600' :
                                 evt.type === 'HEARING' ? 'bg-violet-100 text-violet-700' :
                                    'bg-emerald-100 text-emerald-700'}`}>
                              {evt.type === 'TASK' ? 'Tarefa' : evt.type === 'HEARING' ? 'Audiência/Prazo' : 'Financeiro'}
                           </span>
                           {evt.priority === 'HIGH' && <AlertCircle size={14} className="text-red-500" />}
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm mt-1 leading-tight">{evt.title}</h4>
                        {evt.description && <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>}

                        {evt.meta?.caseNumber && (
                           <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                              <MapPin size={10} /> {evt.meta.caseNumber}
                           </p>
                        )}
                     </div>
                  ))
               )}
            </div>

            {/* Botão adicionar tarefa quando tem eventos */}
            {eventsOnSelectedDate.length > 0 && (
               <div className="p-4 border-t border-slate-100">
                  <button
                     onClick={handleAddTask}
                     className="w-full bg-accent hover:bg-sky-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                     <Plus size={16} /> Adicionar Tarefa
                  </button>
               </div>
            )}

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-center text-slate-400">
               Sincronizado com Processos e Financeiro
            </div>
         </div>

         {/* Modal Nova Tarefa */}
         {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-lg font-bold text-slate-800">Nova Tarefa</h2>
                     <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                     >
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handleSaveTask} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">O que precisa ser feito?</label>
                        <input
                           required
                           autoFocus
                           type="text"
                           className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-accent/20 outline-none"
                           placeholder="Ex: Protocolar Petição Inicial"
                           value={newTask.title || ''}
                           onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                        <input
                           type="date"
                           className="w-full border border-slate-200 p-2.5 rounded-lg"
                           value={newTask.dueDate || ''}
                           onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                           <select
                              className="w-full border border-slate-200 p-2.5 rounded-lg"
                              value={newTask.priority}
                              onChange={e => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                           >
                              <option value="LOW">Baixa</option>
                              <option value="MEDIUM">Normal</option>
                              <option value="HIGH">Urgente</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                           <select
                              className="w-full border border-slate-200 p-2.5 rounded-lg"
                              value={newTask.clientId || ''}
                              onChange={e => setNewTask({ ...newTask, clientId: e.target.value })}
                           >
                              <option value="">Sem vínculo</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (opcional)</label>
                        <textarea
                           className="w-full border border-slate-200 p-2.5 rounded-lg resize-none"
                           rows={2}
                           placeholder="Detalhes adicionais..."
                           value={newTask.description || ''}
                           onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                        />
                     </div>

                     <div className="flex gap-3 pt-4">
                        <button
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           className="flex-1 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                        >
                           Cancelar
                        </button>
                        <button
                           type="submit"
                           disabled={saving}
                           className="flex-1 bg-accent text-white py-2.5 rounded-lg hover:bg-sky-600 font-medium disabled:opacity-50 transition-colors"
                        >
                           {saving ? 'Salvando...' : 'Salvar Tarefa'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

      </div>
   );
};
