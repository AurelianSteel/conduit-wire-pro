import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { calculateMotorCircuit } from '../../src/services/motorCircuitService';
import { MotorHP, MotorVoltage } from '../../src/data/motor-fla-data';
import { ConductorMaterial } from '../../src/types/motor';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';

const MotorCircuitScreen: React.FC = () => {
  const { colors } = useTheme();
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

  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      {/* HP Selector */}
      <View style={[styles.gridContainer, styles.marginBottom]}>
        {['1/6', '1/4', '1/3', '1/2', '3/4', '1', '1.5', '2', '3', '5', '7.5', '10', '15', '20', '25', '30', '40', '50'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.gridButton,
              hp === option && { backgroundColor: colors.primary },
            ]}
            onPress={() => setHP(option as MotorHP)}
          >
            <Text style={[styles.gridButtonText, hp === option && { color: colors.text }]}>{option} HP</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Voltage Selector */}
      <View style={[styles.gridContainer, styles.marginBottom]}>
        {['120V 1Φ', '240V 1Φ', '208V 3Φ', '240V 3Φ', '480V 3Φ'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.gridButton,
              voltage === option && { backgroundColor: colors.primary },
            ]}
            onPress={() => setVoltage(option as MotorVoltage)}
          >
            <Text style={[styles.gridButtonText, voltage === option && { color: colors.text }]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Material Selector */}
      <View style={[styles.gridContainer, styles.marginBottom]}>
        {['Copper', 'Aluminum'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.gridButton,
              material === option.toLowerCase() && { backgroundColor: colors.primary },
            ]}
            onPress={() => setMaterial(option.toLowerCase() as ConductorMaterial)}
          >
            <Text style={[styles.gridButtonText, material === option.toLowerCase() && { color: colors.text }]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Terminal Rating Selector */}
      <View style={[styles.gridContainer, styles.marginBottom]}>
        {([60, 75, 90] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.gridButton,
              terminalRating === option && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTerminalRating(option)}
          >
            <Text style={[styles.gridButtonText, terminalRating === option && { color: colors.text }]}>{option}°C</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Continuous Load Switch */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Continuous Load:</Text>
        <TouchableOpacity
          onPress={() => setContinuousLoad(!continuousLoad)}
          style={[
            styles.switch,
            continuousLoad && { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons name={continuousLoad ? 'toggle' : 'toggle-outline'} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {result && (
        <View style={[styles.resultContainer, styles.marginTop]}>
          <Text style={styles.resultTitle}>Motor: {hp} HP @ {voltage}</Text>
          <Text style={styles.resultValue}>Full-Load Amps: {result.fla}A</Text>

          <View style={styles.divider} />

          <Text style={styles.resultSubtitle}>CONDUCTOR SIZING (NEC 430.22)</Text>
          <Text style={styles.resultValue}>Min Ampacity: {result.minConductorAmpacity}A</Text>
          <Text style={styles.resultValue}>Recommended: {result.recommendedConductorSize} {material}</Text>

          <View style={styles.divider} />

          <Text style={styles.resultSubtitle}>OCPD (NEC 430.52)</Text>
          <Text style={styles.resultValue}>{result.recommendedOCPD}</Text>

          <View style={styles.divider} />

          <Text style={styles.resultSubtitle}>DISCONNECT (NEC 430.110)</Text>
          <Text style={styles.resultValue}>Minimum Rating: {result.minDisconnectRating}A</Text>

          <View style={styles.divider} />

          <Text style={styles.resultSubtitle}>OVERLOAD (NEC 430.32)</Text>
          <Text style={styles.resultValue}>Range: {result.overloadMin}A - {result.overloadMax}A</Text>

          <View style={styles.divider} />

          <Text style={styles.resultSubtitle}>Reference: NEC 2023 Article {result.necArticle}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    // backgroundColor via inline style
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridButton: {
    width: '48%',
    aspectRatio: 1.5,
    marginVertical: Spacing.sm / 2,
    // backgroundColor via inline style
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  gridButtonText: {
    fontSize: FontSizes.md,
    // color via inline style
  },
  marginBottom: {
    marginBottom: Spacing.lg,
  },
  marginTop: {
    marginTop: Spacing.lg,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  switchLabel: {
    fontSize: FontSizes.md,
    // color via inline style
  },
  switch: {
    width: 50,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor via inline style
  },
  resultContainer: {
    padding: Spacing.md,
    // backgroundColor via inline style
    borderRadius: BorderRadius.lg,
  },
  resultTitle: {
    fontSize: FontSizes.xl,
    // color via inline style
  },
  resultSubtitle: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
    // color via inline style
  },
  resultValue: {
    fontSize: FontSizes.md,
    marginVertical: Spacing.sm / 2,
    // color via inline style
  },
  divider: {
    height: 1,
    // backgroundColor via inline style
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
});

export default MotorCircuitScreen;
