import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { useSettings } from './useSettings';

export type ThemeColors = typeof colors.dark;

export function useTheme() {
  const { settings } = useSettings();
  const systemScheme = useColorScheme();
  const activeScheme = settings.theme === 'system' ? systemScheme : settings.theme;
  const isDark = activeScheme === 'dark';
  
  return {
    colors: isDark ? colors.dark : colors.light,
    isDark,
  };
}
