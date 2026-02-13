import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { calculateMotorCircuit } from '../../src/services/motorCircuitService';
import { MotorHP, MotorVoltage } from '../../src/data/motor-fla-data';
import { ConductorMaterial } from '../../src/types/motor';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';

export default function MotorCircuitScreen() {
  const { colors } = useTheme();
  const accentColor = '#8b5cf6'; // Purple - matches home screen
  
  const [hp, setHP] = useState<MotorHP>('5');
  const [voltage, setVoltage] = useState<MotorVoltage>('240V-3ph');
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [terminalRating, setTerminalRating] = useState<60 | 75 | 90>(75);
  const [continuousLoad, setContinuousLoad] = useState(false);

  const result = useMemo(() => {
    try {
      return calculateMotorCircuit({
        hp,
        voltage,
        conductorMaterial: material,
        terminalRating,
        continuousLoad
      });
    } catch {
      return null;
    }
  }, [hp, voltage, material, terminalRating, continuousLoad]);

  const hpOptions: MotorHP[] = ['1/6', '1/4', '1/3', '1/2', '3/4', '1', '1.5', '2', '3', '5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200'];
  
  const voltageOptions: { value: MotorVoltage; label: string }[] = [
    { value: '120V-1ph', label: '120V 1Φ' },
    { value: '240V-1ph', label: '240V 1Φ' },
    { value: '208V-3ph', label: '208V 3Φ' },
    { value: '240V-3ph', label: '240V 3Φ' },
    { value: '480V-3ph', label: '480V 3Φ' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HP Selector */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>MOTOR HORSEPOWER</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
        {hpOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.hpButton,
              { borderColor: colors.border },
              hp === option && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setHP(option)}
          >
            <Text style={[styles.hpButtonText, { color: hp === option ? '#fff' : colors.textSecondary }]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Voltage Selector */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>VOLTAGE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
        {voltageOptions.map((v) => (
          <TouchableOpacity
            key={v.value}
            style={[
              styles.voltageButton,
              { borderColor: colors.border },
              voltage === v.value && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setVoltage(v.value)}
          >
            <Text style={[styles.voltageButtonText, { color: voltage === v.value ? '#fff' : colors.textSecondary }]}>
              {v.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Material Toggle */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUCTOR MATERIAL</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            { borderColor: colors.border },
            material === 'copper' && { backgroundColor: accentColor, borderColor: accentColor },
          ]}
          onPress={() => setMaterial('copper')}
        >
          <Text style={[styles.toggleText, { color: material === 'copper' ? '#fff' : colors.textSecondary }]}>
            Copper
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            { borderColor: colors.border },
            material === 'aluminum' && { backgroundColor: accentColor, borderColor: accentColor },
          ]}
          onPress={() => setMaterial('aluminum')}
        >
          <Text style={[styles.toggleText, { color: material === 'aluminum' ? '#fff' : colors.textSecondary }]}>
            Aluminum
          </Text>
        </TouchableOpacity>
      </View>

      {/* Terminal Rating */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>TERMINAL RATING</Text>
      <View style={styles.toggleRow}>
        {([60, 75, 90] as const).map((temp) => (
          <TouchableOpacity
            key={temp}
            style={[
              styles.terminalBtn,
              { borderColor: colors.border },
              terminalRating === temp && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setTerminalRating(temp)}
          >
            <Text style={[styles.toggleText, { color: terminalRating === temp ? '#fff' : colors.textSecondary }]}>
              {temp}°C
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Continuous Load */}
      <View style={[styles.switchRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>
          CONTINUOUS LOAD (3+ hours)
        </Text>
        <Switch
          value={continuousLoad}
          onValueChange={setContinuousLoad}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor="#fff"
        />
      </View>

      {/* Results - Unified Card */}
      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Motor Spec Header */}
          <View style={styles.resultHeader}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              MOTOR SPECIFICATION
            </Text>
            <Text style={[styles.resultMotor, { color: accentColor }]}>
              {hp} HP @ {voltageOptions.find(v => v.value === voltage)?.label}
            </Text>
            <Text style={[styles.resultFLA, { color: colors.text }]}>
              Full-Load Amps: {result.fla}A
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* NEC Calculations */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CONDUCTOR SIZING (NEC 430.22)</Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Min Ampacity: {result.minConductorAmpacity}A
          </Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Recommended: #{result.recommendedConductorSize} AWG {material}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>OCPD (NEC 430.52)</Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>{result.recommendedOCPD}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DISCONNECT (NEC 430.110)</Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Minimum Rating: {result.minDisconnectRating}A
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>OVERLOAD (NEC 430.32)</Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Range: {result.overloadMin}A - {result.overloadMax}A
          </Text>

          <Text style={[styles.reference, { color: colors.textTertiary }]}>
            Reference: NEC 2023 Article {result.necArticle}
          </Text>

          {result.warnings.length > 0 && (
            <View style={{ marginTop: Spacing.md }}>
              {result.warnings.map((warning, i) => (
                <Text key={i} style={[styles.warning, { color: colors.warning }]}>
                  {warning}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  hpButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  hpButtonText: { fontSize: FontSizes.sm, fontWeight: '600' },
  voltageButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  voltageButtonText: { fontSize: FontSizes.sm, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  terminalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: { fontSize: FontSizes.md, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    marginBottom: Spacing.lg,
  },
  switchLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  resultHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  resultLabel: { fontSize: FontSizes.xs, fontWeight: '700', letterSpacing: 1, textAlign: 'center' },
  resultMotor: { fontSize: FontSizes.xxl, fontWeight: '900', marginTop: Spacing.xs, textAlign: 'center' },
  resultFLA: { fontSize: FontSizes.md, marginTop: Spacing.xs, fontWeight: '600', textAlign: 'center' },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  resultValue: { fontSize: FontSizes.md, marginBottom: Spacing.xs },
  reference: { fontSize: FontSizes.xs, marginTop: Spacing.md, fontStyle: 'italic' },
  warning: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
});
