import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { calculateDeratedAmpacity } from '../../src/services/ampacityService';
import { WireSize, InsulationType, ConductorCountRange, AmpacityInput } from '../../src/types/ampacity';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';

export default function WireAmpacityScreen() {
  const { colors } = useTheme();
  const accentColor = '#f59e0b'; // Amber - matches home screen icon
  
  const [wireSize, setWireSize] = useState<WireSize>('12');
  const [insulationType, setInsulationType] = useState<InsulationType>('THHN/THWN-2');
  const [ambientTempC, setAmbientTempC] = useState<number>(30);
  const [conductorCountRange, setConductorCountRange] = useState<ConductorCountRange>('1-3');
  const [continuousLoad, setContinuousLoad] = useState<boolean>(false);

  const result = useMemo(() => {
    try {
      const input: AmpacityInput = {
        wireSize,
        insulationType,
        ambientTempC,
        conductorCountRange,
        continuousLoad
      };
      return calculateDeratedAmpacity(input);
    } catch (error) {
      return null;
    }
  }, [wireSize, insulationType, ambientTempC, conductorCountRange, continuousLoad]);

  const wireSizes: WireSize[] = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '400', '500'];
  const insulationTypes: InsulationType[] = ['THHN/THWN', 'THHN/THWN-2', 'XHHW-2', 'RHW-2'];
  const ambientTemperatures: number[] = [30, 35, 40, 45, 50];
  const conductorCountRanges: ConductorCountRange[] = ['1-3', '4-6', '7-9', '10-20', '21-30', '31-40', '41+'];

  const celsiusToFahrenheit = (c: number): number => Math.round((c * 9/5) + 32);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      {/* Wire Size Selector */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>WIRE SIZE (AWG)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }} scrollEnabled={true}>
        {wireSizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.wireSizeButton,
              { borderColor: colors.border },
              wireSize === size && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setWireSize(size)}
          >
            <Text style={[styles.wireSizeButtonText, { color: wireSize === size ? '#fff' : colors.textSecondary }]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Insulation Type */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>INSULATION TYPE</Text>
      <View style={styles.toggleRow}>
        {insulationTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.toggleBtn,
              { borderColor: colors.border },
              insulationType === type && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setInsulationType(type)}
          >
            <Text style={[styles.toggleText, { color: insulationType === type ? '#fff' : colors.textSecondary }]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ambient Temperature */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>AMBIENT TEMPERATURE</Text>
      <View style={styles.toggleRow}>
        {ambientTemperatures.map((temp) => (
          <TouchableOpacity
            key={temp}
            style={[
              styles.tempBtn,
              { borderColor: colors.border },
              ambientTempC === temp && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setAmbientTempC(temp)}
          >
            <Text style={[styles.toggleText, { color: ambientTempC === temp ? '#fff' : colors.textSecondary }]}>
              {temp}°C
            </Text>
            <Text style={[styles.tempSubtext, { color: ambientTempC === temp ? '#fff' : colors.textTertiary }]}>
              {celsiusToFahrenheit(temp)}°F
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conductor Count */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUCTORS IN RACEWAY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }} scrollEnabled={true}>
        {conductorCountRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.conductorBtn,
              { borderColor: colors.border },
              conductorCountRange === range && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setConductorCountRange(range)}
          >
            <Text style={[styles.toggleText, { color: conductorCountRange === range ? '#fff' : colors.textSecondary }]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          {/* Header */}
          <View style={styles.resultHeader}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              WIRE AMPACITY
            </Text>
            <Text style={[styles.resultWireSize, { color: accentColor }]}>
              #{wireSize} AWG {insulationType}
            </Text>
            <Text style={[styles.resultBaseAmpacity, { color: colors.text }]}>
              Base Ampacity: {result.baseAmpacity}A
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Derating Factors */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DERATING FACTORS (NEC 310.15)</Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Temperature ({ambientTempC}°C): × {result.temperatureCorrectionFactor.toFixed(2)}
          </Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Conductor Count ({conductorCountRange}): × {result.adjustmentFactor.toFixed(2)}
          </Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Continuous Load: × {result.continuousFactor.toFixed(2)}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Final Result */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>FINAL AMPACITY</Text>
          <Text style={[styles.finalAmpacity, { color: accentColor }]}>
            {result.deratedAmpacity}A
          </Text>

          <LegalDisclaimer />
          <Text style={[styles.reference, { color: colors.textTertiary }]}>
            Reference: NEC 2023 Article {result.necArticle}
          </Text>

          {result.warnings.length > 0 && (
            <View style={{ marginTop: Spacing.md }}>
              {result.warnings.map((warning: string, i: number) => (
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
  wireSizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  wireSizeButtonText: { fontSize: FontSizes.sm, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  toggleBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  tempBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  conductorBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  toggleText: { fontSize: FontSizes.sm, fontWeight: '600' },
  tempSubtext: { fontSize: FontSizes.xs, marginTop: 2 },
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
  resultWireSize: { fontSize: FontSizes.xxl, fontWeight: '900', marginTop: Spacing.xs, textAlign: 'center' },
  resultBaseAmpacity: { fontSize: FontSizes.md, marginTop: Spacing.xs, fontWeight: '600', textAlign: 'center' },
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
  finalAmpacity: { fontSize: 32, fontWeight: '900', marginBottom: Spacing.xs },
  reference: { fontSize: FontSizes.xs, marginTop: Spacing.md, fontStyle: 'italic' },
  warning: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
});
