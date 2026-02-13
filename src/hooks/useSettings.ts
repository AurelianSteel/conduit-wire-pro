import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

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

const SETTINGS_KEY = 'app_settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    units: 'imperial',
    theme: 'system',
    defaultMaterial: 'Cu',
    defaultConduit: 'EMT',
  });

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

  return {
    settings,
    setUnits,
    setTheme,
    setDefaultMaterial,
    setDefaultConduit,
    isLoading,
  };
}