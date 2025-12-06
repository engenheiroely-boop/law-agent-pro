import { supabase } from './supabase';
import { Client } from '../types';

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return data || [];
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return undefined;
  }

  return data;
};

export const createClient = async (client: Partial<Client>): Promise<Client> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario nao autenticado');

  const newClient: Partial<Client> = {
    ...client,
    user_id: user.id
  };

  // Remove ID if empty to allow Supabase to generate it
  if (!newClient.id) {
    delete newClient.id;
  }

  const { data, error } = await supabase
    .from('clients')
    .insert(newClient)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateClient = async (client: Client): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', client.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
