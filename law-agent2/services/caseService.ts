import { supabase } from './supabase';
import { LegalCase, CaseStatus, CaseEvent } from '../types';

export const getCases = async (): Promise<LegalCase[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('title');

  if (error) {
    console.error('Error fetching cases:', error);
    return [];
  }
  return data || [];
};

export const getCasesByClientId = async (clientId: string): Promise<LegalCase[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('clientId', clientId);

  if (error) {
    console.error('Error fetching cases by client:', error);
    return [];
  }
  return data || [];
};

export const getCaseById = async (id: string): Promise<LegalCase | undefined> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return undefined;
  return data;
}

export const createCase = async (legalCase: Partial<LegalCase>): Promise<LegalCase> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  const newCase: Partial<LegalCase> = {
    ...legalCase,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from('cases')
    .insert(newCase)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCase = async (legalCase: LegalCase): Promise<LegalCase> => {
  const { data, error } = await supabase
    .from('cases')
    .update(legalCase)
    .eq('id', legalCase.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addEventToCase = async (caseId: string, event: Omit<CaseEvent, 'id'>): Promise<void> => {
  // Como timeline é um array JSONB no Postgres ou uma tabela separada?
  // Opção A: Array JSONB na coluna 'timeline' (Mais simples para MVP)

  // 1. Fetch current timeline
  const currentCase = await getCaseById(caseId);
  if (!currentCase) return;

  const newEvent: CaseEvent = {
    ...event,
    id: crypto.randomUUID()
  };

  const updatedTimeline = [newEvent, ...(currentCase.timeline || [])];

  // 2. Update
  const { error } = await supabase
    .from('cases')
    .update({ timeline: updatedTimeline } as any)
    .eq('id', caseId);

  if (error) throw error;
};
