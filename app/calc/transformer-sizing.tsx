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
import { useHistory } from '../../src/hooks/useHistory';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';
import { ShareButton } from '../../src/components/ShareButton';
import { ShareSheet } from '../../src/components/ShareSheet';
import { ShareData } from '../../src/services/shareService';
import {
  calculateTransformerSpecs,
  calculateFLA,
  sizeOCPD,
  getTypicalImpedance,
  formatAmps,
} from '../../src/services/transformerService';
import {
  TransformerInput,
  TransformerPhase,
  VoltageLevel,
  COMMON_KVA_RATINGS,
  STANDARD_VOLTAGES,
  VOLTAGE_DESCRIPTIONS,
} from '../../src/types/transformer';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';

export default function TransformerSizingScreen() {
  const { colors } = useTheme();
  const { addEntry } = useHistory();
  const accentColor = '#8b5cf6'; // Purple for transformer

  // Input state
  const [kva, setKva] = useState<string>('75');
  const [phase, setPhase] = useState<TransformerPhase>('three');
  const [primaryVoltage, setPrimaryVoltage] = useState<VoltageLevel>(480);
  const [secondaryVoltage, setSecondaryVoltage] = useState<VoltageLevel>(208);
  const [impedancePercent, setImpedancePercent] = useState<string>('1.5');
  const [showResults, setShowResults] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  const result = useMemo(() => {
    const kvaNum = parseFloat(kva);
    const impedanceNum = parseFloat(impedancePercent);

    if (!kvaNum || kvaNum <= 0 || !impedanceNum || impedanceNum <= 0) {
      return null;
    }

    try {
      const input: TransformerInput = {
        kva: kvaNum,
        primaryVoltage,
        secondaryVoltage,
        phase,
        impedancePercent: impedanceNum,
      };
      return calculateTransformerSpecs(input);
    } catch (error) {
      return null;
    }
  }, [kva, primaryVoltage, secondaryVoltage, phase, impedancePercent]);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
    if (result) {
      addEntry({
        type: 'transformer-sizing',
        timestamp: Date.now(),
        inputs: {
          kva: parseFloat(kva),
          phase,
          primaryVoltage,
          secondaryVoltage,
          impedancePercent: parseFloat(impedancePercent),
        },
        result: {
          primaryFLA: result.primaryFLA,
          secondaryFLA: result.secondaryFLA,
          primaryOCPD: result.primaryOCPD,
          secondaryOCPD: result.secondaryOCPD,
          faultCurrent: result.faultCurrent,
          turnsRatio: result.turnsRatio,
        },
      });
    }
  }, [result, kva, phase, primaryVoltage, secondaryVoltage, impedancePercent, addEntry]);

  const setTypicalImpedance = useCallback(() => {
    const kvaNum = parseFloat(kva);
    if (kvaNum > 0) {
      const typical = getTypicalImpedance(kvaNum);
      setImpedancePercent(typical.toString());
    }
  }, [kva]);


  // Build share data from result
  const buildShareData = (): ShareData | null => {
    if (!result) return null;

    const primaryVoltageLabel = VOLTAGE_DESCRIPTIONS[primaryVoltage] || `${primaryVoltage}V`;
    const secondaryVoltageLabel = VOLTAGE_DESCRIPTIONS[secondaryVoltage] || `${secondaryVoltage}V`;

    return {
      calculatorType: "transformer-sizing",
      calculatorTitle: "Transformer Sizing Calculator",
      inputs: {
        kva: `${kva} kVA`,
        phase: phase === "single" ? "Single Phase" : "Three Phase",
        primaryVoltage: primaryVoltageLabel,
        secondaryVoltage: secondaryVoltageLabel,
        impedance: `${impedancePercent}%`,
      },
      result: {
        value: `${result.secondaryFLA}A`,
        label: "Secondary FLA",
        details: {
          primaryFLA: `${result.primaryFLA}A`,
          primaryOCPD: result.primaryOCPD,
          secondaryOCPD: result.secondaryOCPD,
          faultCurrent: result.faultCurrent ? formatAmps(result.faultCurrent) : "N/A",
          turnsRatio: result.turnsRatio.toFixed(2),
        },
      },
      necArticle: "450.3",
      necReference: "NEC 2023 Article 450.3",
      timestamp: new Date(),
    };
  };
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1, padding: Spacing.lg, paddingBottom: 150 }}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="flash" size={28} color={accentColor} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transformer Sizing</Text>
      </View>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
        Calculate FLA, OCPD, and fault current per NEC 450
      </Text>

      {/* Phase Selection */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>PHASE</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            { borderColor: colors.border },
            phase === 'single' && { backgroundColor: accentColor, borderColor: accentColor },
          ]}
          onPress={() => { setPhase('single'); setShowResults(false); }}
        >
          <Text style={[styles.toggleText, { color: phase === 'single' ? '#fff' : colors.textSecondary }]}>
            1-Phase
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            { borderColor: colors.border },
            phase === 'three' && { backgroundColor: accentColor, borderColor: accentColor },
          ]}
          onPress={() => { setPhase('three'); setShowResults(false); }}
        >
          <Text style={[styles.toggleText, { color: phase === 'three' ? '#fff' : colors.textSecondary }]}>
            3-Phase
          </Text>
        </TouchableOpacity>
      </View>

      {/* KVA Input */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>TRANSFORMER SIZE (KVA)</Text>
      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Ionicons name="cube" size={20} color={accentColor} />
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={kva}
          onChangeText={(v) => { setKva(v); setShowResults(false); }}
          keyboardType="decimal-pad"
          placeholder="e.g., 75"
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={[styles.inputUnit, { color: colors.textTertiary }]}>KVA</Text>
      </View>

      {/* Quick KVA Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {COMMON_KVA_RATINGS.map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.chip,
              { borderColor: colors.border },
              kva === rating.toString() && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => { setKva(rating.toString()); setShowResults(false); }}
          >
            <Text style={[styles.chipText, { color: kva === rating.toString() ? '#fff' : colors.textSecondary }]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Primary Voltage */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>PRIMARY VOLTAGE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {STANDARD_VOLTAGES.map((voltage) => (
          <TouchableOpacity
            key={`pri-${voltage}`}
            style={[
              styles.chip,
              { borderColor: colors.border },
              primaryVoltage === voltage && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => { setPrimaryVoltage(voltage); setShowResults(false); }}
          >
            <Text style={[styles.chipText, { color: primaryVoltage === voltage ? '#fff' : colors.textSecondary }]}>
              {voltage}V
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Secondary Voltage */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>SECONDARY VOLTAGE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {STANDARD_VOLTAGES.map((voltage) => (
          <TouchableOpacity
            key={`sec-${voltage}`}
            style={[
              styles.chip,
              { borderColor: colors.border },
              secondaryVoltage === voltage && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => { setSecondaryVoltage(voltage); setShowResults(false); }}
          >
            <Text style={[styles.chipText, { color: secondaryVoltage === voltage ? '#fff' : colors.textSecondary }]}>
              {voltage}V
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Impedance */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        IMPEDANCE (%)
        <Text style={[styles.optional, { color: colors.textTertiary }]}> — typical: 1.5-2%</Text>
      </Text>
      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <Ionicons name="pulse" size={20} color={accentColor} />
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={impedancePercent}
          onChangeText={(v) => { setImpedancePercent(v); setShowResults(false); }}
          keyboardType="decimal-pad"
          placeholder="e.g., 1.5"
          placeholderTextColor={colors.textTertiary}
        />
        <Text style={[styles.inputUnit, { color: colors.textTertiary }]}>%</Text>
      </View>

      <TouchableOpacity style={styles.quickButton} onPress={setTypicalImpedance}>
        <Text style={[styles.quickButtonText, { color: accentColor }]}>
          Use Typical Impedance for {kva || '?'} KVA
        </Text>
      </TouchableOpacity>

      {/* Calculate Button */}
      <TouchableOpacity
        style={[styles.calcButton, { backgroundColor: accentColor }]}
        onPress={handleCalculate}
        activeOpacity={0.8}
      >
        <Ionicons name="calculator" size={22} color="#fff" />
        <Text style={styles.calcButtonText}>Calculate Transformer Specs</Text>
      </TouchableOpacity>

      {/* Results */}
      {showResults && result && (
        <View style={styles.resultsSection}>
          {/* Primary Side */}
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Ionicons name="arrow-up" size={20} color={accentColor} />
              <Text style={[styles.resultTitle, { color: colors.text }]}>Primary Side</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Full-Load Amps</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatAmps(result.primaryFLA)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>OCPD Size (125%)</Text>
              <Text style={[styles.resultValueHighlight, { color: accentColor }]}>{result.primaryOCPD}A</Text>
            </View>
          </View>

          {/* Secondary Side */}
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Ionicons name="arrow-down" size={20} color={colors.success} />
              <Text style={[styles.resultTitle, { color: colors.text }]}>Secondary Side</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Full-Load Amps</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatAmps(result.secondaryFLA)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>OCPD Size (125%)</Text>
              <Text style={[styles.resultValueHighlight, { color: colors.success }]}>{result.secondaryOCPD}A</Text>
            </View>
          </View>

          {/* Additional Info */}
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Ionicons name="information-circle" size={20} color={colors.warning} />
              <Text style={[styles.resultTitle, { color: colors.text }]}>Additional Specs</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Turns Ratio</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{result.turnsRatio.toFixed(2)}:1</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Fault Current (est.)</Text>
              <Text style={[styles.resultValue, { color: result.faultCurrent > 10000 ? colors.error : colors.text }]}>
                {Math.round(result.faultCurrent).toLocaleString()}A
              </Text>
            </View>
          </View>

          {/* Notes */}
          <View style={[styles.notesCard, { backgroundColor: colors.surface + '80', borderColor: colors.border }]}>
            <Text style={[styles.notesTitle, { color: colors.textSecondary }]}>NOTES</Text>
            {result.notes.map((note, idx) => (
              <Text key={idx} style={[styles.noteText, { color: colors.textSecondary }]}>
                • {note}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Legal Disclaimer */}
      <LegalDisclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optional: {
    fontWeight: '400',
    textTransform: 'none',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputUnit: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  chipScroll: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  quickButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  quickButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  calcButtonText: {
    color: '#fff',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  resultsSection: {
    marginTop: Spacing.md,
  },
  resultCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  resultTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resultLabel: {
    fontSize: FontSizes.md,
  },
  resultValue: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  resultValueHighlight: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  notesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  notesTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  noteText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
});
