
import { UserSettings, BackupData } from '../types';
import { getClients } from './clientService';
import { getCases } from './caseService';
import { getProposals } from './proposalService';
import { getTransactions } from './financialService';
import { getTasks } from './taskService';

const SETTINGS_KEY = 'lawagent_settings';

const DEFAULT_SETTINGS: UserSettings = {
  lawyerName: 'Dr. Advogado',
  oabNumber: 'OAB/UF 00.000',
  officeName: 'Law Agent Advocacia',
  officeAddress: 'Endereço Profissional, 100',
  theme: 'slate',
  aiTone: 'formal'
};

export const saveSettings = (settings: UserSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('settings-updated'));
};

export const getSettings = (): UserSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
};

export const createBackup = async (): Promise<BackupData> => {
  // Gather all data from other services
  // Note: We are directly accessing localStorage keys here for simplicity and speed in this "MicroSaaS" context
  // ideally we should use the service getters, but direct access ensures we get the raw stored state
  
  const clients = JSON.parse(localStorage.getItem('lawagent_clients') || '[]');
  const cases = JSON.parse(localStorage.getItem('lawagent_cases') || '[]');
  const proposals = JSON.parse(localStorage.getItem('lawagent_proposals') || '[]');
  const transactions = JSON.parse(localStorage.getItem('lawagent_financials') || '[]');
  const tasks = JSON.parse(localStorage.getItem('lawagent_tasks') || '[]');
  const settings = getSettings();

  return {
    version: '1.0',
    date: new Date().toISOString(),
    clients,
    cases,
    proposals,
    transactions,
    tasks,
    settings
  };
};

export const restoreBackup = async (data: BackupData): Promise<void> => {
  if (!data.clients || !data.settings) {
    throw new Error('Arquivo de backup inválido');
  }

  localStorage.setItem('lawagent_clients', JSON.stringify(data.clients));
  localStorage.setItem('lawagent_cases', JSON.stringify(data.cases));
  localStorage.setItem('lawagent_proposals', JSON.stringify(data.proposals));
  localStorage.setItem('lawagent_financials', JSON.stringify(data.transactions));
  localStorage.setItem('lawagent_tasks', JSON.stringify(data.tasks));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
};

export const clearAllData = () => {
  localStorage.clear();
};
