
import { OABTableStatus, ImportReport, ImportHistoryEntry } from '../types';
import { loadFeesForState } from './feeService';

const STORAGE_KEY = 'lawagent_oab_status';

// Helper to get from local storage
const getStoredStatus = (): OABTableStatus[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);

  // Initial Seed for SC since the JSON file exists
  return [{
      uf: 'SC',
      lastImportDate: new Date().toISOString(),
      lastReport: { validItems: 7, itemsWithWarnings: 0 },
      history: []
  }];
};

// Helper to save to local storage
const saveStatus = (statusList: OABTableStatus[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statusList));
};

export const getOabStatus = (): OABTableStatus[] => {
  return getStoredStatus();
};

export const importOabTable = async (uf: string, file: File): Promise<ImportReport> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulating validation logic
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Arquivo muito grande (Max 5MB)');
  }

  // Mock processing result
  const mockReport: ImportReport = {
    validItems: Math.floor(Math.random() * 100) + 50,
    itemsWithWarnings: Math.floor(Math.random() * 5)
  };

  const newEntry: ImportHistoryEntry = {
    date: new Date().toISOString(),
    success: true,
    report: mockReport
  };

  const currentList = getStoredStatus();
  const existingIndex = currentList.findIndex(s => s.uf === uf);

  if (existingIndex >= 0) {
    // Update existing
    const existing = currentList[existingIndex];
    const history = existing.history || [];
    
    // Add new entry to start, keep max 3
    const newHistory = [newEntry, ...history].slice(0, 3);
    
    currentList[existingIndex] = {
      ...existing,
      lastImportDate: newEntry.date,
      lastReport: mockReport,
      history: newHistory
    };
  } else {
    // Create new
    currentList.push({
      uf,
      lastImportDate: newEntry.date,
      lastReport: mockReport,
      history: [newEntry]
    });
  }

  saveStatus(currentList);
  
  // Trigger fee service reload (simulation)
  await loadFeesForState(uf);

  return mockReport;
};
