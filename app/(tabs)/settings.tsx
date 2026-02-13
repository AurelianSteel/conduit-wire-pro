import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useSettings } from '../../src/hooks/useSettings';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';

interface SettingRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { settings, setTheme, setUnits, setDefaultMaterial, setDefaultConduit } = useSettings();

  const rows: SettingRow[] = [
    { icon: 'information-circle-outline', label: 'About', value: 'Conduit & Wire Pro v1.0.0' },
    { icon: 'business-outline', label: 'Developer', value: 'IllWired LLC' },
    { icon: 'mail-outline', label: 'Contact', value: 'hello@illwired.com', onPress: () => Linking.openURL('mailto:hello@illwired.com') },
    { icon: 'globe-outline', label: 'Website', value: 'illwired.com', onPress: () => Linking.openURL('https://illwired.com') },
    { icon: 'shield-checkmark-outline', label: 'Privacy Policy', onPress: () => Linking.openURL('https://illwired.com/privacy') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        {rows.map((row, i) => (
          <TouchableOpacity
            key={row.label}
            style={[styles.row, i < rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}
            onPress={row.onPress}
            disabled={!row.onPress}
            activeOpacity={row.onPress ? 0.7 : 1}
          >
            <Ionicons name={row.icon} size={20} color={colors.textSecondary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
            {row.value && <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{row.value}</Text>}
            {row.onPress && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.section, { marginTop: Spacing.lg }]}>
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Preferences</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentButton, settings.theme === 'system' && styles.segmentButtonActive]}
            onPress={() => setTheme('system')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.theme === 'system' ? colors.primary : colors.textSecondary }
            ]}>System</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, settings.theme === 'light' && styles.segmentButtonActive]}
            onPress={() => setTheme('light')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.theme === 'light' ? colors.primary : colors.textSecondary }
            ]}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, settings.theme === 'dark' && styles.segmentButtonActive]}
            onPress={() => setTheme('dark')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.theme === 'dark' ? colors.primary : colors.textSecondary }
            ]}>Dark</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentButton, settings.units === 'imperial' && styles.segmentButtonActive]}
            onPress={() => setUnits('imperial')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.units === 'imperial' ? colors.primary : colors.textSecondary }
            ]}>Imperial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, settings.units === 'metric' && styles.segmentButtonActive]}
            onPress={() => setUnits('metric')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.units === 'metric' ? colors.primary : colors.textSecondary }
            ]}>Metric</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, { marginTop: Spacing.lg }]}>
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Defaults</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentButton, settings.defaultMaterial === 'Cu' && styles.segmentButtonActive]}
            onPress={() => setDefaultMaterial('Cu')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.defaultMaterial === 'Cu' ? colors.primary : colors.textSecondary }
            ]}>Copper</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, settings.defaultMaterial === 'Al' && styles.segmentButtonActive]}
            onPress={() => setDefaultMaterial('Al')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.defaultMaterial === 'Al' ? colors.primary : colors.textSecondary }
            ]}>Aluminum</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentButton, settings.defaultConduit === 'EMT' && styles.segmentButtonActive]}
            onPress={() => setDefaultConduit('EMT')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.defaultConduit === 'EMT' ? colors.primary : colors.textSecondary }
            ]}>EMT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, settings.defaultConduit === 'PVC' && styles.segmentButtonActive]}
            onPress={() => setDefaultConduit('PVC')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.defaultConduit === 'PVC' ? colors.primary : colors.textSecondary }
            ]}>PVC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, settings.defaultConduit === 'RMC' && styles.segmentButtonActive]}
            onPress={() => setDefaultConduit('RMC')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.defaultConduit === 'RMC' ? colors.primary : colors.textSecondary }
            ]}>RMC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, settings.defaultConduit === 'GRC' && styles.segmentButtonActive]}
            onPress={() => setDefaultConduit('GRC')}
          >
            <Text style={[
              styles.segmentText, 
              { color: settings.defaultConduit === 'GRC' ? colors.primary : colors.textSecondary }
            ]}>GRC</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={[styles.disclaimerText, { color: colors.textTertiary }]}>
          Calculations based on published manufacturer specifications and physics formulas.
          Always verify against applicable local codes and standards.
          This app is not a substitute for professional judgment.
        </Text>
      </View>

      <Text style={[styles.footer, { color: colors.textTertiary }]}>
        © 2026 IllWired LLC{'\n'}All rights reserved.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  card: { borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rowLabel: { fontSize: FontSizes.md, fontWeight: '500', flex: 1 },
  rowValue: { fontSize: FontSizes.sm },
  disclaimer: { marginTop: Spacing.xxl, paddingHorizontal: Spacing.md },
  disclaimerText: { fontSize: FontSizes.xs, lineHeight: 18, textAlign: 'center' },
  footer: { fontSize: FontSizes.xs, textAlign: 'center', marginTop: Spacing.xl },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionHeader: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  segmentButtonActive: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});
