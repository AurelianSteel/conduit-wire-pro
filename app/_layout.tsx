import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HistoryContext, useHistoryProvider } from '../src/hooks/useHistory';
import { useTheme } from '../src/hooks/useTheme';
import { SettingsProvider } from '../src/contexts/SettingsContext';

function AppContent() {
  const { colors, isDark } = useTheme();
  const historyValue = useHistoryProvider();

  return (
    <HistoryContext.Provider value={historyValue}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="calc/conduit-fill" options={{ title: 'Conduit Fill', headerBackTitle: 'Back', presentation: 'card' }} />
        <Stack.Screen name="calc/box-fill" options={{ title: 'Box Fill', headerBackTitle: 'Back', presentation: 'card' }} />
        <Stack.Screen name="calc/voltage-drop" options={{ title: 'Voltage Drop', headerBackTitle: 'Back', presentation: 'card' }} />
        <Stack.Screen name="calc/wire-ampacity" options={{ title: 'Wire Ampacity', headerBackTitle: 'Back', presentation: 'card' }} />
        <Stack.Screen name="calc/motor-circuit" options={{ title: 'Motor Circuit', headerBackTitle: 'Back', presentation: 'card' }} />
        <Stack.Screen name="calc/parallel-conductors" options={{ title: 'Parallel Conductors', headerBackTitle: 'Back', presentation: 'card' }} />
        <Stack.Screen name="calc/grounding-bonding" options={{ title: 'Grounding & Bonding', headerBackTitle: 'Back', presentation: 'card' }} />
        <Stack.Screen name="calc/service-feeder" options={{ title: 'Service Feeder', headerBackTitle: 'Back', presentation: 'card' }} />
      </Stack>
    </HistoryContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
