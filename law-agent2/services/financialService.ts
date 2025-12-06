
import { supabase } from './supabase';
import { FinancialTransaction, Proposal, TransactionStatus } from '../types';

export const getTransactions = async (): Promise<FinancialTransaction[]> => {
  const { data, error } = await supabase
    .from('financial_transactions')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  // Map snake_case to camelCase
  return data.map((t: any) => ({
    ...t,
    dueDate: t.due_date,
    proposalId: t.proposal_id,
    clientId: t.client_id,
    paidDate: t.paid_date
  }));
};

export const updateTransactionStatus = async (id: string, status: TransactionStatus): Promise<void> => {
  const updateData: any = { status };

  if (status === 'PAID') {
    updateData.paid_date = new Date().toISOString();
  } else {
    updateData.paid_date = null;
  }

  const { error } = await supabase
    .from('financial_transactions')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

/**
 * Gera automaticamente os lançamentos financeiros baseados em uma proposta aceita.
 */
export const generateFinancialsFromProposal = async (proposal: Proposal): Promise<void> => {
  const terms = proposal.paymentTerms;
  if (!terms) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  const transactions = [];
  const today = new Date();

  // 1. Entrada
  if (terms.entryAmount > 0) {
    transactions.push({
      user_id: user.id,
      client_id: proposal.clientId,
      proposal_id: proposal.id,
      description: `Entrada - ${proposal.serviceDescription}`,
      amount: terms.entryAmount,
      due_date: today.toISOString(),
      type: 'INCOME',
      status: 'PENDING',
      category: 'Honorários Iniciais'
    });
  }

  // 2. Parcelas
  if (terms.installments > 0 && terms.installmentAmount > 0) {
    for (let i = 1; i <= terms.installments; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + i);

      transactions.push({
        user_id: user.id,
        client_id: proposal.clientId,
        proposal_id: proposal.id,
        description: `Parcela ${i}/${terms.installments} - ${proposal.serviceDescription}`,
        amount: terms.installmentAmount,
        due_date: dueDate.toISOString(),
        type: 'INCOME',
        status: 'PENDING',
        category: 'Honorários Mensais'
      });
    }
  }

  if (transactions.length > 0) {
    const { error } = await supabase
      .from('financial_transactions')
      .insert(transactions);

    if (error) {
      console.error("Erro ao gerar financeiro:", error);
      throw error;
    }
  }
};
