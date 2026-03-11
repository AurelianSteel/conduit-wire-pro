import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useSettings } from '../../src/hooks/useSettings';
import { systemVoltages, ConductorMaterial, PhaseType } from '../../src/data/resistance-data';
import {
  recommendWire,
  VoltageDropResult,
  getVDStatusColor,
  getVDStatusLabel,
  formatWireSize,
} from '../../src/engines/voltage-drop-engine';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import { useHistory } from '../../src/hooks/useHistory';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';
import { ShareButton } from '../../src/components/ShareButton';
import { ShareSheet } from '../../src/components/ShareSheet';
import { ShareData } from '../../src/services/shareService';

export default function VoltageDropScreen() {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { addEntry } = useHistory();

  // Map settings material to ConductorMaterial type
  const defaultMaterial: ConductorMaterial = settings.defaultMaterial === 'Cu' ? 'copper' : 'aluminum';

  // Input state
  const [voltageIdx, setVoltageIdx] = useState(0); // 120V 1Φ
  const [material, setMaterial] = useState<ConductorMaterial>(defaultMaterial);
  const [current, setCurrent] = useState('20');
  const [distance, setDistance] = useState('100');
  const [showResults, setShowResults] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  const selectedVoltage = systemVoltages[voltageIdx];

  const recommendation = useMemo(() => {
    const amps = parseFloat(current);
    const dist = parseFloat(distance);
    if (!amps || !dist || amps <= 0 || dist <= 0) return null;

    return recommendWire({
      voltage: selectedVoltage.value,
      phase: selectedVoltage.phase,
      current: amps,
      distance: dist,
      material,
    });
  }, [selectedVoltage, material, current, distance]);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
    if (recommendation?.bestChoice) {
      const best = recommendation.bestChoice;
      addEntry({
        type: 'voltage-drop',
        timestamp: Date.now(),
        inputs: {
          voltage: selectedVoltage.value,
          voltageLabel: selectedVoltage.label,
          phase: selectedVoltage.phase,
          material,
          current: parseFloat(current),
          distance: parseFloat(distance),
        },
        result: {
          recommendedWire: formatWireSize(best.wireSize),
          voltageDropPercent: best.voltageDropPercent,
          voltageDrop: best.voltageDrop,
          voltageAtLoad: best.voltageAtLoad,
        },
      });
    }
  }, [recommendation, selectedVoltage, material, current, distance, addEntry]);

  const best = recommendation?.bestChoice;


  // Build share data from result
  const buildShareData = (): ShareData | null => {
    if (!best) return null;

    return {
      calculatorType: "voltage-drop",
      calculatorTitle: "Voltage Drop Calculator",
      inputs: {
        voltage: selectedVoltage.label,
        material: material === "copper" ? "Copper" : "Aluminum",
        current: `${current}A`,
        distance: `${distance} ft`,
      },
      result: {
        value: formatWireSize(best.wireSize),
        label: "Recommended Wire Size",
        details: {
          voltageDrop: `${best.voltageDropPercent}%`,
          voltsLost: `${best.voltageDrop}V`,
          voltageAtLoad: `${best.voltageAtLoad}V`,
          status: getVDStatusLabel(best.voltageDropPercent),
        },
      },
      necArticle: "210.19, 215.2",
      necReference: "NEC 2023 Articles 210.19, 215.2",
      timestamp: new Date(),
    };
  };
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1, padding: Spacing.lg, paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      {/* System Voltage */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>SYSTEM VOLTAGE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} scrollEnabled={true}>
        {systemVoltages.map((v, idx) => (
          <TouchableOpacity
            key={`${v.value}-${v.phase}-${idx}`}
            style={[
              styles.chip,
              { borderColor: colors.border },
              voltageIdx === idx && { backgroundColor: colors.success, borderColor: colors.success },
            ]}
            onPress={() => { setVoltageIdx(idx); setShowResults(false); }}
          >
            <Text style={[
              styles.chipText,
              { color: voltageIdx === idx ? '#fff' : colors.textSecondary },
            ]}>
              {v.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Conductor Material */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUCTOR MATERIAL</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            material === 'copper' && { backgroundColor: colors.success, borderColor: colors.success },
            { borderColor: colors.border },
          ]}
          onPress={() => { setMaterial('copper'); setShowResults(false); }}
        >
          <Text style={[styles.toggleText, { color: material === 'copper' ? '#fff' : colors.textSecondary }]}>
            🟤 Copper
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            material === 'aluminum' && { backgroundColor: colors.success, borderColor: colors.success },
            { borderColor: colors.border },
          ]}
          onPress={() => { setMaterial('aluminum'); setShowResults(false); }}
        >
          <Text style={[styles.toggleText, { color: material === 'aluminum' ? '#fff' : colors.textSecondary }]}>
            ⚪ Aluminum
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>LOAD CURRENT</Text>
      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Ionicons name="flash" size={20} color={colors.success} />
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={current}
          onChangeText={(v) => { setCurrent(v); setShowResults(false); }}
          keyboardType="decimal-pad"
          placeholder="Enter amps"
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={[styles.inputUnit, { color: colors.textTertiary }]}>A</Text>
      </View>

      {/* Distance */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>ONE-WAY DISTANCE</Text>
      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Ionicons name="resize" size={20} color={colors.success} />
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={distance}
          onChangeText={(v) => { setDistance(v); setShowResults(false); }}
          keyboardType="decimal-pad"
          placeholder="Enter feet"
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={[styles.inputUnit, { color: colors.textTertiary }]}>ft</Text>
      </View>

      {/* Calculate Button */}
      <TouchableOpacity
        style={[styles.calcButton, { backgroundColor: colors.success }]}
        onPress={handleCalculate}
        activeOpacity={0.8}
      >
        <Ionicons name="flash" size={22} color="#fff" />
        <Text style={styles.calcButtonText}>Calculate Voltage Drop</Text>
      </TouchableOpacity>

      {/* Results */}
      {showResults && recommendation && best && (
        <View style={styles.resultsSection}>
          {/* Primary Result */}
          <View style={[styles.resultHero, {
            backgroundColor: getVDStatusColor(best.voltageDropPercent) + '15',
            borderColor: getVDStatusColor(best.voltageDropPercent),
          }]}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              RECOMMENDED WIRE SIZE
            </Text>
            <Text style={[styles.resultWireSize, { color: getVDStatusColor(best.voltageDropPercent) }]}>
              {formatWireSize(best.wireSize)}
            </Text>

            <View style={styles.resultStatsRow}>
              <View style={styles.resultStat}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {best.voltageDropPercent}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Voltage Drop
                </Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {best.voltageDrop}V
                </Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                  Volts Lost
                </Text>
              </View>
              <View style={styles.resultStat}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {best.voltageAtLoad}V
                </Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                  At Load
                </Text>
              </View>
            </View>

            <Text style={[styles.statusText, { color: getVDStatusColor(best.voltageDropPercent) }]}>
              {getVDStatusLabel(best.voltageDropPercent)}
            </Text>
          </View>

          {/* Wire Comparison Table */}
          <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.tableTitle, { color: colors.text }]}>Wire Size Comparison</Text>
            <View style={[styles.tableHeader, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[styles.thCell, { flex: 1, color: colors.textSecondary }]}>Wire</Text>
              <Text style={[styles.thCell, { flex: 1, color: colors.textSecondary }]}>VD %</Text>
              <Text style={[styles.thCell, { flex: 0.5, color: colors.textSecondary }]}>OK</Text>
            </View>
            {recommendation.results
              
              .slice(0, 10)
              .map((r, idx) => (
                <View
                  key={r.wireSize}
                  style={[
                    styles.tableRow,
                    r.wireSize === best.wireSize && { backgroundColor: colors.success + '10' },
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.tdCell, {
                    flex: 1,
                    color: r.wireSize === best.wireSize ? colors.success : colors.text,
                    fontWeight: r.wireSize === best.wireSize ? '700' : '400',
                  }]}>
                    {formatWireSize(r.wireSize)}
                    {r.wireSize === best.wireSize ? ' ★' : ''}
                  </Text>
                  <Text style={[styles.tdCell, {
                    flex: 0.8,
                    color: getVDStatusColor(r.voltageDropPercent),
                    fontWeight: '600',
                  }]}>
                    {r.voltageDropPercent}%
                  </Text>
                  <Text style={[styles.tdCell, { flex: 0.8, color: colors.textSecondary }]}>
                  </Text>
                  <Text style={[styles.tdCell, { flex: 0.5 }]}>
                    {r.passes3Percent ? '✅' : r.passes5Percent ? '⚠️' : '❌'}
                  </Text>
                </View>
              ))
            }
          </View>

          <LegalDisclaimer />

          {buildShareData() && (
            <ShareButton
              data={buildShareData()!}
              onPress={() => setShowShareSheet(true)}
              accentColor={colors.success}
            />
          )}
        </View>
      )}

      <ShareSheet
        visible={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        data={buildShareData() || {
          calculatorType: "voltage-drop",
          calculatorTitle: "Voltage Drop Calculator",
          inputs: {},
          result: { value: "", label: "" },
          necArticle: "210.19, 215.2",
          necReference: "NEC 2023 Articles 210.19, 215.2",
        }}
        accentColor={colors.success}
      />

      {showResults && !best && (
        <View style={[styles.errorCard, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
          <Ionicons name="alert-circle" size={24} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            No standard wire size can handle this load at this distance. Consider reducing distance, splitting circuits, or using parallel conductors.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  chipScroll: { flexDirection: 'row', maxHeight: 40 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  chipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  chipText: { fontSize: FontSizes.sm, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  toggleText: { fontSize: FontSizes.md, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    gap: Spacing.sm,
  },
  textInput: { flex: 1, fontSize: FontSizes.lg, fontWeight: '600' },
  inputUnit: { fontSize: FontSizes.lg, fontWeight: '600' },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  calcButtonText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: '700' },
  resultsSection: { marginTop: Spacing.xl },
  resultHero: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultLabel: { fontSize: FontSizes.xs, fontWeight: '700', letterSpacing: 1 },
  resultWireSize: { fontSize: FontSizes.hero, fontWeight: '900', marginVertical: Spacing.sm },
  resultStatsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  resultStat: { alignItems: 'center' },
  statValue: { fontSize: FontSizes.xl, fontWeight: '700' },
  statLabel: { fontSize: FontSizes.xs, marginTop: 2 },
  statusText: { fontSize: FontSizes.sm, fontWeight: '600', textAlign: 'center' },
  tableCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  tableTitle: { fontSize: FontSizes.md, fontWeight: '700', padding: Spacing.md },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  thCell: { fontSize: FontSizes.xs, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
  },
  tdCell: { fontSize: FontSizes.sm, textAlign: 'center' },
  errorCard: {
    flexDirection: 'row' as const,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.md,
    alignItems: 'center' as const,
    marginTop: Spacing.xl,
  },
  errorText: { flex: 1, fontSize: FontSizes.sm, lineHeight: 20 },
});
