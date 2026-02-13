import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationResult, HistoryEntry, CalculatorType } from '../types';

const STORAGE_KEY = '@cwp_history';
const MAX_ENTRIES = 50;

interface HistoryContextType {
  entries: HistoryEntry[];
  addEntry: (result: CalculationResult, label?: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  getByType: (type: CalculatorType) => HistoryEntry[];
}

export const HistoryContext = createContext<HistoryContextType>({
  entries: [],
  addEntry: async () => {},
  clearHistory: async () => {},
  getByType: () => [],
});

export function useHistory() {
  return useContext(HistoryContext);
}

export function useHistoryProvider(): HistoryContextType {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) setEntries(JSON.parse(data));
    });
  }, []);

  const save = useCallback(async (newEntries: HistoryEntry[]) => {
    setEntries(newEntries);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  }, []);

  const addEntry = useCallback(async (result: CalculationResult, label?: string) => {
    const entry: HistoryEntry = {
      ...result,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      label,
    };
    const updated = [entry, ...entries].slice(0, MAX_ENTRIES);
    await save(updated);
  }, [entries, save]);

  const clearHistory = useCallback(async () => {
    await save([]);
  }, [save]);

  const getByType = useCallback((type: CalculatorType) => {
    return entries.filter(e => e.type === type);
  }, [entries]);

  return { entries, addEntry, clearHistory, getByType };
}
