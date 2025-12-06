
import { supabase } from './supabase';
import { Proposal, ProposalStatus } from '../types';

export const getProposals = async (): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*, clients(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching proposals:', error);
    return [];
  }

  return data.map((p: any) => ({
    ...p,
    createdAt: p.created_at, // Map snake_case to camelCase
    clientName: p.clients?.name || 'Cliente Desconhecido',
    paymentTerms: p.payment_terms
  }));
};

export const getProposalsByClientId = async (clientId: string): Promise<Proposal[]> => {
  const { data, error } = await supabase
    .from('proposals')
    .select('*, clients(name)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client proposals:', error);
    return [];
  }

  return data.map((p: any) => ({
    ...p,
    createdAt: p.created_at,
    clientName: p.clients?.name,
    paymentTerms: p.payment_terms
  }));
};

export const createProposal = async (proposal: any): Promise<Proposal> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  const dbProposal = {
    user_id: user.id,
    client_id: proposal.clientId,
    title: proposal.serviceDescription || 'Proposta',
    status: proposal.status || 'EM_PREPARO',
    value: proposal.totalValue,
    payment_terms: proposal.paymentTerms
  };

  const { data, error } = await supabase
    .from('proposals')
    .insert(dbProposal)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    createdAt: data.created_at,
    paymentTerms: data.payment_terms,
    clientId: data.client_id,
    totalValue: data.value,
    serviceDescription: data.title
  };
};

export const updateProposalStatus = async (id: string, status: ProposalStatus): Promise<void> => {
  const { error } = await supabase
    .from('proposals')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
};
