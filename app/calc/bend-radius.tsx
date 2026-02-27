import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { calculateBendRadius, getAvailableConductorSizes, getCableTypeInfo } from '../../src/services/bendRadiusService';
import { CableType, BendRadiusInput } from '../../src/types/bendRadius';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';

export default function BendRadiusScreen() {
  const { colors } = useTheme();
  const accentColor = '#f97316'; // Orange - distinct from other calculators

  const [cableType, setCableType] = useState<CableType>('nonshielded');
  const [conductorSize, setConductorSize] = useState<string>('12');
  const [overallDiameter, setOverallDiameter] = useState<string>('');
  const [showDiameterInput, setShowDiameterInput] = useState<boolean>(false);

  const result = useMemo(() => {
    try {
      const input: BendRadiusInput = {
        cableType,
        conductorSize,
        overallDiameter: showDiameterInput && overallDiameter ? parseFloat(overallDiameter) : undefined,
      };
      return calculateBendRadius(input);
    } catch (error) {
      return null;
    }
  }, [cableType, conductorSize, overallDiameter, showDiameterInput]);

  const cableTypes: CableType[] = ['nonshielded', 'shielded', 'interlocked', 'smooth', 'corrugated', 'mc', 'ac'];
  const conductorSizes = getAvailableConductorSizes();

  const getCableTypeLabel = (type: CableType): string => {
    const labels: Record<CableType, string> = {
      nonshielded: 'Nonshielded',
      shielded: 'Shielded',
      interlocked: 'Interlocked Armor',
      smooth: 'Smooth Sheath',
      corrugated: 'Corrugated Sheath',
      mc: 'MC Cable',
      ac: 'AC (BX) Cable',
    };
    return labels[type];
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      {/* Cable Type Selector */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>CABLE TYPE</Text>
      <View style={styles.toggleRow}>
        {cableTypes.slice(0, 4).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              { borderColor: colors.border },
              cableType === type && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setCableType(type)}
          >
            <Text style={[styles.typeButtonText, { color: cableType === type ? '#fff' : colors.textSecondary }]}>
              {getCableTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.toggleRow}>
        {cableTypes.slice(4).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              { borderColor: colors.border },
              cableType === type && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setCableType(type)}
          >
            <Text style={[styles.typeButtonText, { color: cableType === type ? '#fff' : colors.textSecondary }]}>
              {getCableTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cable Type Info */}
      {result && (
        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {getCableTypeInfo(cableType).appliesTo}
          </Text>
          <Text style={[styles.infoMultiplier, { color: accentColor }]}>
            {getCableTypeInfo(cableType).multiplier}x diameter minimum
          </Text>
        </View>
      )}

      {/* Conductor Size */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUCTOR SIZE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
        {conductorSizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeButton,
              { borderColor: colors.border },
              conductorSize === size && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setConductorSize(size)}
          >
            <Text style={[styles.sizeButtonText, { color: conductorSize === size ? '#fff' : colors.textSecondary }]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Overall Diameter (Optional) */}
      <View style={[styles.optionalSection, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.optionalToggle}
          onPress={() => setShowDiameterInput(!showDiameterInput)}
        >
          <Text style={[styles.optionalLabel, { color: colors.text }]}>
            MEASURED DIAMETER (OPTIONAL)
          </Text>
          <Text style={[styles.optionalHint, { color: colors.textSecondary }]}>
            {showDiameterInput ? '▼ Tap to hide' : '▶ Tap to enter measured diameter'}
          </Text>
        </TouchableOpacity>
        
        {showDiameterInput && (
          <View style={styles.diameterInputContainer}>
            <TextInput
              style={[
                styles.diameterInput,
                { 
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="Enter diameter in inches"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              value={overallDiameter}
              onChangeText={setOverallDiameter}
            />
            <Text style={[styles.inputHint, { color: colors.textTertiary }]}>
              For more precise results, measure the actual cable diameter with calipers
            </Text>
          </View>
        )}
      </View>

      {/* Results */}
      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.resultHeader}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              MINIMUM BEND RADIUS
            </Text>
            <Text style={[styles.resultSize, { color: accentColor }]}>
              {result.minRadiusInches.toFixed(2)}″
            </Text>
            <Text style={[styles.resultMetric, { color: colors.text }]}>
              {result.minRadiusMm} mm
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Calculation Details */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CALCULATION DETAILS</Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Multiplier: {result.multiplier}x diameter
          </Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            Reference Diameter: {result.referenceDiameter.toFixed(3)}″
          </Text>
          <Text style={[styles.resultSubtext, { color: colors.textTertiary }]}>
            {result.referenceDiameterType}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Formula */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>FORMULA (NEC {result.necArticle})</Text>
          <Text style={[styles.formula, { color: colors.text }]}>
            {result.multiplier} × {result.referenceDiameter.toFixed(3)}″ = {result.minRadiusInches.toFixed(2)}″
          </Text>

          <LegalDisclaimer />
          <Text style={[styles.reference, { color: colors.textTertiary }]}>
            Reference: NEC 2023 Article {result.necArticle}
          </Text>

          {result.warnings.length > 0 && (
            <View style={{ marginTop: Spacing.md }}>
              {result.warnings.map((warning, i) => (
                <Text key={i} style={[styles.warning, { color: colors.warning }]}>
                  ⚠️ {warning}
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
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonText: { fontSize: FontSizes.sm, fontWeight: '600' },
  infoBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  infoText: { fontSize: FontSizes.sm, marginBottom: Spacing.xs },
  infoMultiplier: { fontSize: FontSizes.md, fontWeight: '700' },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 55,
    alignItems: 'center',
  },
  sizeButtonText: { fontSize: FontSizes.sm, fontWeight: '600' },
  optionalSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  optionalToggle: {
    marginBottom: Spacing.sm,
  },
  optionalLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  optionalHint: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  diameterInputContainer: {
    marginTop: Spacing.sm,
  },
  diameterInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
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
  resultSize: { fontSize: 48, fontWeight: '900', marginTop: Spacing.xs, textAlign: 'center' },
  resultMetric: { fontSize: FontSizes.lg, marginTop: Spacing.xs, fontWeight: '600', textAlign: 'center' },
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
  resultSubtext: { fontSize: FontSizes.xs, marginBottom: Spacing.xs, fontStyle: 'italic' },
  formula: { 
    fontSize: FontSizes.md, 
    fontWeight: '600',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  reference: { fontSize: FontSizes.xs, marginTop: Spacing.md, fontStyle: 'italic' },
  warning: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
});
