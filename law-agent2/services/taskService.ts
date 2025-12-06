import { supabase } from './supabase';
import { Task, TaskStatus } from '../types';

export const getTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('dueDate', { ascending: true }); // Then local sort by priority if needed

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
};

export const createTask = async (task: Partial<Task>): Promise<Task> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  const newTask: Partial<Task> = {
    ...task,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(newTask)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTask = async (task: Task): Promise<Task> => {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
};

export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Calcula a data final baseada em dias úteis ou corridos.
 * @param startDate Data de início (string YYYY-MM-DD)
 * @param days Quantidade de dias
 * @param type 'BUSINESS' (Úteis) ou 'CALENDAR' (Corridos)
 */
export const calculateDeadline = (startDate: string, days: number, type: 'BUSINESS' | 'CALENDAR'): string => {
  if (!startDate || days <= 0) return startDate;

  let currentDate = new Date(startDate);
  // Ajuste fuso horário para garantir cálculo correto da data
  currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());

  let addedDays = 0;

  while (addedDays < days) {
    // Avança um dia
    currentDate.setDate(currentDate.getDate() + 1);

    if (type === 'CALENDAR') {
      addedDays++;
    } else {
      // Dias Úteis: Ignora Sábado (6) e Domingo (0)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }
  }

  return currentDate.toISOString().split('T')[0];
};
