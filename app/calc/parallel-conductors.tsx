import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { calculateParallelConductors, recommendParallelRuns } from '../../src/services/parallelConductorService';
import { ConductorSize } from '../../src/data/motor-conductor-data';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';

export default function ParallelConductorsScreen() {
  const { colors } = useTheme();
  const accentColor = '#f59e0b'; // Amber color for parallel conductors

  const [totalAmpacity, setTotalAmpacity] = useState<string>('400');
  const [numRuns, setNumRuns] = useState<number>(2);
  const [material, setMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [terminalRating, setTerminalRating] = useState<60 | 75 | 90>(75);
  const [includeNeutral, setIncludeNeutral] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);

  const result = useMemo(() => {
    try {
      const ampacity = parseInt(totalAmpacity, 10);
      if (isNaN(ampacity) || ampacity <= 0) return null;
      
      return calculateParallelConductors({
        totalAmpacity: ampacity,
        numRuns,
        conductorMaterial: material,
        terminalRating,
        includeNeutral,
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Calculation error' };
    }
  }, [totalAmpacity, numRuns, material, terminalRating, includeNeutral]);

  const recommendations = useMemo(() => {
    try {
      const ampacity = parseInt(totalAmpacity, 10);
      if (isNaN(ampacity) || ampacity <= 0) return [];
      return recommendParallelRuns(ampacity, material, terminalRating);
    } catch {
      return [];
    }
  }, [totalAmpacity, material, terminalRating]);

  const runOptions = [2, 3, 4, 5, 6];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Ampacity Input */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>REQUIRED TOTAL AMPACITY (A)</Text>
      <TextInput
        style={[styles.input, { 
          borderColor: colors.border, 
          color: colors.text,
          backgroundColor: colors.surface 
        }]}
        keyboardType="number-pad"
        value={totalAmpacity}
        onChangeText={setTotalAmpacity}
        placeholder="Enter ampacity (e.g., 400)"
        placeholderTextColor={colors.textTertiary}
      />

      {/* Number of Runs */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>PARALLEL RUNS</Text>
      <View style={styles.toggleRow}>
        {runOptions.map((runs) => (
          <TouchableOpacity
            key={runs}
            style={[
              styles.runButton,
              { borderColor: colors.border },
              numRuns === runs && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setNumRuns(runs)}
          >
            <Text style={[styles.runButtonText, { color: numRuns === runs ? '#fff' : colors.textSecondary }]}>
              {runs}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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

      {/* Include Neutral */}
      <View style={[styles.switchRow, { borderTopColor: colors.border, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>
          INCLUDE NEUTRAL SIZING
        </Text>
        <Switch
          value={includeNeutral}
          onValueChange={setIncludeNeutral}
          trackColor={{ false: colors.border, true: accentColor }}
          thumbColor="#fff"
        />
      </View>

      {/* Optimization Toggle */}
      <TouchableOpacity 
        style={styles.optimizerToggle}
        onPress={() => setShowOptimizer(!showOptimizer)}
      >
        <Text style={[styles.optimizerText, { color: accentColor }]}>
          {showOptimizer ? '▼ Hide Run Optimizer' : '▶ Show Run Optimizer'}
        </Text>
      </TouchableOpacity>

      {/* Recommendations */}
      {showOptimizer && recommendations.length > 0 && (
        <View style={[styles.optimizerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.optimizerTitle, { color: colors.textSecondary }]}>
            RECOMMENDED CONFIGURATIONS
          </Text>
          <Text style={[styles.optimizerSubtitle, { color: colors.textTertiary }]}>
            Sorted by efficiency (ampacity utilization)
          </Text>
          {recommendations.slice(0, 3).map((rec, idx) => (
            <View key={rec.numRuns} style={styles.recommendationRow}>
              <Text style={[styles.recText, { color: colors.text }]}>
                {idx === 0 ? '🏆 ' : ''}{rec.numRuns} runs of {rec.size} AWG
              </Text>
              <Text style={[styles.recEfficiency, { color: rec.efficiency > 85 ? colors.success : colors.warning }]}>
                {rec.efficiency}% eff
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Error Display */}
      {result && 'error' in result && (
        <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.error }]}>
          <Text style={[styles.errorIcon, { color: colors.error }]}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: colors.error }]}>Calculation Error</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {result.error}
          </Text>
        </View>
      )}

      {/* Results */}
      {result && !('error' in result) && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.resultHeader}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              PARALLEL CONDUCTOR SIZING
            </Text>
            <Text style={[styles.resultMain, { color: accentColor }]}>
              {result.parallelSets} × {result.recommendedSize} AWG
            </Text>
            <Text style={[styles.resultSub, { color: colors.text }]}>
              {result.conductorMaterial === 'copper' ? 'Copper' : 'Aluminum'} @ {result.terminalRating}°C
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Ampacity Breakdown */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            AMPACITY BREAKDOWN
          </Text>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Per Conductor:</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              {result.ampacityPerConductor}A required
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Per Conductor Rating:</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              {Math.round(result.totalAmpacityAchieved / result.parallelSets)}A rated
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Total Achieved:</Text>
            <Text style={[styles.breakdownValue, { color: colors.success }]}>
              {result.totalAmpacityAchieved}A
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Headroom:</Text>
            <Text style={[styles.breakdownValue, { color: result.headroomPercent > 20 ? colors.success : colors.warning }]}>
              +{result.headroomPercent}%
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Wire Specifications */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            WIRE SPECIFICATIONS
          </Text>
          <View style={styles.wireSpecRow}>
            <Text style={styles.wireSpecLabel}>Phase:</Text>
            <Text style={[styles.wireSpecValue, { color: colors.text }]}>
              {result.wireSpecs.phase}
            </Text>
          </View>
          {result.wireSpecs.neutral && (
            <View style={styles.wireSpecRow}>
              <Text style={styles.wireSpecLabel}>Neutral:</Text>
              <Text style={[styles.wireSpecValue, { color: colors.text }]}>
                {result.wireSpecs.neutral}
              </Text>
            </View>
          )}
          <View style={styles.wireSpecRow}>
            <Text style={styles.wireSpecLabel}>Ground:</Text>
            <Text style={[styles.wireSpecValue, { color: colors.text }]}>
              {result.wireSpecs.ground}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Installation Notes */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            INSTALLATION NOTES
          </Text>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            • All parallel conductors must be same length, size, and material{'\n'}
            • Use separate raceways or bundled with proper supports{'\n'}
            • Each parallel set must have its own equipment ground{'\n'}
            • Minimum 1/0 AWG for parallel per NEC 310.10(G)
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
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FontSizes.md,
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  runButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  runButtonText: { fontSize: FontSizes.md, fontWeight: '600' },
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
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
  },
  switchLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  optimizerToggle: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optimizerText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  optimizerCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  optimizerTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  optimizerSubtitle: {
    fontSize: FontSizes.xs,
    marginBottom: Spacing.sm,
  },
  recommendationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  recText: { fontSize: FontSizes.sm, fontWeight: '500' },
  recEfficiency: { fontSize: FontSizes.sm, fontWeight: '600' },
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
  resultMain: { fontSize: FontSizes.xxl, fontWeight: '900', marginTop: Spacing.xs, textAlign: 'center' },
  resultSub: { fontSize: FontSizes.md, marginTop: Spacing.xs, fontWeight: '600', textAlign: 'center' },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: { fontSize: FontSizes.sm },
  breakdownValue: { fontSize: FontSizes.sm, fontWeight: '600' },
  wireSpecRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  wireSpecLabel: {
    width: 70,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#888',
  },
  wireSpecValue: {
    flex: 1,
    fontSize: FontSizes.sm,
  },
  noteText: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  reference: { fontSize: FontSizes.xs, marginTop: Spacing.md, fontStyle: 'italic' },
  warning: { fontSize: FontSizes.sm, marginTop: Spacing.xs },
  errorCard: {
    marginTop: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
});
