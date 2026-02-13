import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';

interface CalcCard {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

export default function HomeScreen() {
  const { colors } = useTheme();

  const calculators: CalcCard[] = [
    {
      title: 'Conduit Fill',
      subtitle: 'Size your conduit',
      icon: 'albums-outline',
      route: '/calc/conduit-fill',
      color: colors.primary,
    },
    {
      title: 'Box Fill',
      subtitle: 'Check box capacity',
      icon: 'cube-outline',
      route: '/calc/box-fill',
      color: colors.secondary,
    },
    {
      title: 'Voltage Drop',
      subtitle: 'Calculate wire loss',
      icon: 'flash-outline',
      route: '/calc/voltage-drop',
      color: colors.success,
    },
    {
      title: 'Wire Ampacity',
      subtitle: 'Derate conductor ampacity',
      icon: 'flame-outline',
      route: '/calc/wire-ampacity',
      color: '#f59e0b', // Amber
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Conduit & Wire Pro</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Four essential calculators for electricians
        </Text>
      </View>
      <View style={styles.grid}>
        {calculators.map((calc) => (
          <TouchableOpacity
            key={calc.route}
            style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => router.push(calc.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: calc.color + '20' }]}>
              <Ionicons name={calc.icon} size={32} color={calc.color} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{calc.title}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{calc.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 20, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 16, marginTop: 4 },
  grid: { gap: 16 },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubtitle: { fontSize: 14, marginTop: 2 },
});
