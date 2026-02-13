import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Units = 'imperial' | 'metric';
export type Theme = 'system' | 'light' | 'dark';
export type Material = 'Cu' | 'Al';
export type ConduitType = 'EMT' | 'PVC' | 'RMC' | 'GRC';

interface Settings {
  units: Units;
  theme: Theme;
  defaultMaterial: Material;
  defaultConduit: ConduitType;
}

interface SettingsContextType {
  settings: Settings;
  setUnits: (units: Units) => void;
  setTheme: (theme: Theme) => void;
  setDefaultMaterial: (material: Material) => void;
  setDefaultConduit: (conduit: ConduitType) => void;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  units: 'imperial',
  theme: 'dark',
  defaultMaterial: 'Cu',
  defaultConduit: 'EMT',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'app_settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const setUnits = (units: Units) => {
    saveSettings({ ...settings, units });
  };

  const setTheme = (theme: Theme) => {
    saveSettings({ ...settings, theme });
  };

  const setDefaultMaterial = (material: Material) => {
    saveSettings({ ...settings, defaultMaterial: material });
  };

  const setDefaultConduit = (conduit: ConduitType) => {
    saveSettings({ ...settings, defaultConduit: conduit });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setUnits,
        setTheme,
        setDefaultMaterial,
        setDefaultConduit,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
