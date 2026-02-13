// app/calc/wire-ampacity.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { calculateDeratedAmpacity } from '../../src/services/ampacityService';
import { WireSize, InsulationType, ConductorCountRange, AmpacityInput } from '../../src/types/ampacity';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';

const WireAmpacityScreen: React.FC = () => {
  const theme = useTheme();

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
      console.error('Calculation error:', error);
      return null;
    }
  }, [wireSize, insulationType, ambientTempC, conductorCountRange, continuousLoad]);

  const wireSizes: WireSize[] = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '400', '500'];
  const insulationTypes: InsulationType[] = ['THHN/THWN', 'THHN/THWN-2', 'XHHW-2', 'RHW-2'];
  const ambientTemperatures: number[] = [30, 35, 40, 45, 50];
  const conductorCountRanges: ConductorCountRange[] = ['1-3', '4-6', '7-9', '10-20', '21-30', '31-40', '41+'];

  const handleWireSizeSelect = (size: WireSize) => {
    setWireSize(size);
  };

  const handleInsulationTypeSelect = (type: InsulationType) => {
    setInsulationType(type);
  };

  const handleAmbientTempSelect = (temp: number) => {
    setAmbientTempC(temp);
  };

  const handleConductorCountRangeSelect = (range: ConductorCountRange) => {
    setConductorCountRange(range);
  };

  const toggleContinuousLoad = () => {
    setContinuousLoad(!continuousLoad);
  };

  function celsiusToFahrenheit(c: number): number {
    return Math.round((c * 9/5) + 32);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.title}>Wire Ampacity Calculator</Text>
        
        {/* Wire Size Selector */}
        <Text style={styles.sectionTitle}>Wire Size</Text>
        <View style={styles.buttonGrid}>
          {wireSizes.map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.button,
                wireSize === size && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => handleWireSizeSelect(size)}
            >
              <Text style={styles.buttonText}>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Insulation Type Selector */}
        <Text style={styles.sectionTitle}>Insulation Type</Text>
        <View style={styles.buttonGrid}>
          {insulationTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.button,
                insulationType === type && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => handleInsulationTypeSelect(type)}
            >
              <Text style={styles.buttonText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ambient Temperature Selector */}
        <Text style={styles.sectionTitle}>Ambient Temperature (°C)</Text>
        <View style={styles.buttonGrid}>
          {ambientTemperatures.map(temp => (
            <TouchableOpacity
              key={temp}
              style={[
                styles.button,
                ambientTempC === temp && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => handleAmbientTempSelect(temp)}
            >
              <Text style={styles.buttonText}>{`${temp}°C (${celsiusToFahrenheit(temp)}°F)`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conductor Count Selector */}
        <Text style={styles.sectionTitle}>Conductor Count</Text>
        <View style={styles.buttonGrid}>
          {conductorCountRanges.map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.button,
                conductorCountRange === range && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => handleConductorCountRangeSelect(range)}
            >
              <Text style={styles.buttonText}>{range}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continuous Load Toggle */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            continuousLoad && { backgroundColor: theme.colors.primary },
          ]}
          onPress={toggleContinuousLoad}
        >
          <Ionicons name="checkbox" size={24} color={continuousLoad ? theme.colors.background : theme.colors.text} />
          <Text style={styles.toggleButtonText}>Continuous Load</Text>
        </TouchableOpacity>

        {/* Results Display */}
        {result && (
          <View style={[styles.resultsCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={styles.resultTitle}>Results</Text>
            <Text style={styles.resultText}>
              Base Ampacity: {result.baseAmpacity}A ({insulationType})
            </Text>
            <Text style={styles.resultSubtitle}>Derating Factors:</Text>
            <Text style={styles.resultDetail}>
              Temperature ({ambientTempC}°C): × {result.temperatureCorrectionFactor.toFixed(2)}
            </Text>
            <Text style={styles.resultDetail}>
              Conductor Count ({conductorCountRange}): × {result.adjustmentFactor.toFixed(2)}
            </Text>
            <Text style={styles.resultDetail}>
              Continuous Load: × {result.continuousFactor.toFixed(2)}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.resultTitle}>Final Derated Ampacity: {result.deratedAmpacity}A</Text>
            <Text style={styles.resultDetail}>Reference: NEC 2023 Article {result.necArticle}</Text>
          </View>
        )}

        {/* Warnings */}
        {result?.warnings && (
          result.warnings.map((warning, index) => (
            <View key={index} style={[styles.warningBox, { backgroundColor: theme.colors.warning }]}>
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: '#fff',
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    color: '#333',
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    color: '#666',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    width: '45%',
    aspectRatio: 1,
    marginHorizontal: '2.5%',
    marginBottom: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: BorderRadius.md,
  },
  buttonText: {
    fontSize: FontSizes.md,
    color: '#333',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#eee',
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
  },
  toggleButtonText: {
    fontSize: FontSizes.md,
    marginLeft: Spacing.sm,
    color: '#333',
  },
  resultsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    color: '#333',
  },
  resultSubtitle: {
    fontSize: FontSizes.md,
    marginVertical: Spacing.sm,
    color: '#666',
  },
  resultText: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.sm,
    color: '#333',
  },
  resultDetail: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xs,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: Spacing.md,
  },
  warningBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  warningText: {
    fontSize: FontSizes.md,
    color: '#333',
  },
});

export default WireAmpacityScreen;
