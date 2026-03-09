import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';
import { Ionicons } from '@expo/vector-icons';
import {
  calculateFaultCurrent,
  getTypicalImpedance,
  formatFaultCurrent,
} from '../../src/services/faultCurrentService';
import {
  FaultCurrentInput,
  COMMON_KVA_RATINGS,
  Phase,
  ConductorMaterial,
} from '../../src/types/faultCurrent';

type InputField = 'kva' | 'primaryVoltage' | 'secondaryVoltage' | 'impedance' | 'length' | 'motorHp';

const COMMON_SECONDARY_VOLTAGES = [120, 208, 240, 277, 480];
const COMMON_PRIMARY_VOLTAGES = [240, 480, 2400, 4160, 12470, 24940];
const CONDUCTOR_SIZES = ['14', '12', '10', '8', '6', '4', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '400', '500', '600', '750', '1000'];

export default function FaultCurrentScreen() {
  const { colors } = useTheme();
  const accentColor = '#ef4444'; // Red for fault current (safety critical)

  // Input state
  const [kva, setKva] = useState<string>('75');
  const [primaryVoltage, setPrimaryVoltage] = useState<string>('12470');
  const [secondaryVoltage, setSecondaryVoltage] = useState<string>('480');
  const [impedance, setImpedance] = useState<string>('2.0');
  const [phase, setPhase] = useState<Phase>('three');
  const [includeConductor, setIncludeConductor] = useState<boolean>(false);
  const [conductorLength, setConductorLength] = useState<string>('100');
  const [conductorSize, setConductorSize] = useState<string>('4/0');
  const [conductorType, setConductorType] = useState<ConductorMaterial>('copper');
  const [includeMotor, setIncludeMotor] = useState<boolean>(false);
  const [motorHp, setMotorHp] = useState<string>('50');

  // Calculate result
  const result = useMemo(() => {
    try {
      const input: FaultCurrentInput = {
        kva: parseFloat(kva) || 0,
        primaryVoltage: parseFloat(primaryVoltage) || 0,
        secondaryVoltage: parseFloat(secondaryVoltage) || 0,
        impedancePercent: parseFloat(impedance) || 0,
        phase,
        conductorLength: includeConductor ? parseFloat(conductorLength) || 0 : 0,
        conductorSize: includeConductor ? conductorSize : undefined,
        conductorType: includeConductor ? conductorType : undefined,
        includeMotorContribution: includeMotor,
        motorHp: includeMotor ? parseFloat(motorHp) || 0 : 0,
      };

      if (input.kva <= 0 || input.secondaryVoltage <= 0 || input.impedancePercent <= 0) {
        return null;
      }

      return calculateFaultCurrent(input);
    } catch {
      return null;
    }
  }, [kva, primaryVoltage, secondaryVoltage, impedance, phase, includeConductor, conductorLength, conductorSize, conductorType, includeMotor, motorHp]);

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const renderChip = (
    label: string,
    selected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.chip,
        { 
          backgroundColor: selected ? accentColor : colors.surfaceElevated,
          borderColor: selected ? accentColor : colors.border,
        }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.chipText,
        { color: selected ? '#fff' : colors.text }
      ]]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    placeholder: string,
    keyboardType: 'numeric' | 'decimal-pad' = 'numeric',
    unit?: string
  ) => (
    <View style={styles.inputRow}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
        />
        {unit && (
          <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
          <Ionicons name="flash-off-outline" size={32} color={accentColor} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Fault Current</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Calculate available fault current for SCCR sizing
        </Text>
      </View>

      {/* Transformer Section */}
      {renderSection('Transformer', (
        <>
          <Text style={[styles.label, { color: colors.text }]}>kVA Rating</Text>
          <View style={styles.chipContainer}>
            {COMMON_KVA_RATINGS.slice(0, 12).map((rating) => (
              renderChip(
                rating.toString(),
                kva === rating.toString(),
                () => {
                  setKva(rating.toString());
                  setImpedance(getTypicalImpedance(rating).toString());
                }
              )
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: Spacing.md }]}>Phase</Text>
          <View style={styles.chipContainer}>
            {renderChip('Single', phase === 'single', () => setPhase('single'))}
            {renderChip('Three', phase === 'three', () => setPhase('three'))}
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: Spacing.md }]}>Secondary Voltage</Text>
          <View style={styles.chipContainer}>
            {COMMON_SECONDARY_VOLTAGES.map((v) => (
              renderChip(
                `${v}V`,
                secondaryVoltage === v.toString(),
                () => setSecondaryVoltage(v.toString())
              )
            ))}
          </View>

          {renderInput(
            'Transformer Impedance (%Z)',
            impedance,
            setImpedance,
            '2.0',
            'decimal-pad',
            '%'
          )}
        </>
      ))}

      {/* Conductor Section */}
      {renderSection('Conductor Run (Optional)', (
        <>
          <View style={styles.toggleRow}>
            <Text style={[styles.label, { color: colors.text, flex: 1 }]}>
              Include Conductor Impedance
            </Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: includeConductor ? accentColor : colors.border }
              ]}
              onPress={() => setIncludeConductor(!includeConductor)}
            >
              <View style={[
                styles.toggleKnob,
                { 
                  backgroundColor: '#fff',
                  transform: [{ translateX: includeConductor ? 20 : 0 }]
                }
              ]} />
            </TouchableOpacity>
          </View>

          {includeConductor && (
            <>
              {renderInput('Length', conductorLength, setConductorLength, '100', 'numeric', 'ft')}
              
              <Text style={[styles.label, { color: colors.text, marginTop: Spacing.sm }]}>Conductor Size</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizeScroll}>
                <View style={styles.chipContainer}>
                  {CONDUCTOR_SIZES.map((size) => (
                    renderChip(
                      size,
                      conductorSize === size,
                      () => setConductorSize(size)
                    )
                  ))}
                </View>
              </ScrollView>

              <Text style={[styles.label, { color: colors.text, marginTop: Spacing.sm }]}>Material</Text>
              <View style={styles.chipContainer}>
                {renderChip('Copper', conductorType === 'copper', () => setConductorType('copper'))}
                {renderChip('Aluminum', conductorType === 'aluminum', () => setConductorType('aluminum'))}
              </View>
            </>
          )}
        </>
      ))}

      {/* Motor Contribution Section */}
      {renderSection('Motor Contribution (Optional)', (
        <>
          <View style={styles.toggleRow}>
            <Text style={[styles.label, { color: colors.text, flex: 1 }]}>
              Include Motor Fault Contribution
            </Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: includeMotor ? accentColor : colors.border }
              ]}
              onPress={() => setIncludeMotor(!includeMotor)}
            >
              <View style={[
                styles.toggleKnob,
                { 
                  backgroundColor: '#fff',
                  transform: [{ translateX: includeMotor ? 20 : 0 }]
                }
              ]} />
            </TouchableOpacity>
          </View>

          {includeMotor && renderInput(
            'Total Motor HP',
            motorHp,
            setMotorHp,
            '50',
            'numeric',
            'HP'
          )}
        </>
      ))}

      {/* Results Section */}
      {result && (
        <View style={[styles.resultsContainer, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>Results</Text>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Transformer FLA
            </Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {result.transformerFLA.toFixed(1)} A
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Transformer Fault Current
            </Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {formatFaultCurrent(result.transformerFaultCurrent)}
            </Text>
          </View>

          {includeConductor && result.totalConductorImpedance && (
            <>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  Conductor Impedance
                </Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>
                  {result.totalConductorImpedance.toFixed(4)} Ω
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  Fault Current at Point
                </Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>
                  {formatFaultCurrent(result.faultCurrentAtPoint)}
                </Text>
              </View>
            </>
          )}

          {includeMotor && result.motorContribution > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  Motor Contribution
                </Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>
                  {formatFaultCurrent(result.motorContribution)}
                </Text>
              </View>
            </>
          )}

          <View style={[styles.totalContainer, { backgroundColor: accentColor + '15' }]}>
            <View style={styles.resultRow}>
              <Text style={[styles.totalLabel, { color: accentColor }]}>
                Total Available Fault Current
              </Text>
              <Text style={[styles.totalValue, { color: accentColor }]}>
                {formatFaultCurrent(result.totalFaultCurrent)}
              </Text>
            </View>
          </View>

          <View style={[styles.sccrContainer, { backgroundColor: colors.success + '15' }]}>
            <View style={styles.resultRow}>
              <Text style={[styles.sccrLabel, { color: colors.success }]}>
                Required SCCR Rating
              </Text>
              <Text style={[styles.sccrValue, { color: colors.success }]}>
                {result.sccrRequired}
              </Text>
            </View>
            <Text style={[styles.sccrNote, { color: colors.textSecondary }]}>
              Safety margin: {result.safetyMargin.toFixed(0)}%
            </Text>
          </View>
        </View>
      )}

      <LegalDisclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSizes.md,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  inputRow: {
    marginTop: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
  },
  unit: {
    marginLeft: Spacing.sm,
    fontSize: FontSizes.md,
    fontWeight: '600',
    minWidth: 30,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  sizeScroll: {
    marginBottom: Spacing.sm,
  },
  resultsContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  resultsTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resultLabel: {
    fontSize: FontSizes.sm,
  },
  resultValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: Spacing.sm,
  },
  totalContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
  },
  sccrContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  sccrLabel: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  sccrValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
  },
  sccrNote: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
});
