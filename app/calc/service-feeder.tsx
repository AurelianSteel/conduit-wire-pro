import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { calculateServiceFeeder } from '../../src/services/serviceFeederService';
import { ServiceFeederInput } from '../../src/types/serviceFeeder';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';

export default function ServiceFeederScreen() {
  const { colors } = useTheme();
  const accentColor = '#8b5cf6'; // Violet/purple for service/feeder

  // Dwelling info
  const [squareFootage, setSquareFootage] = useState<string>('2000');
  
  // General loads
  const [smallApplianceCircuits, setSmallApplianceCircuits] = useState<number>(2);
  const [includeLaundryCircuit, setIncludeLaundryCircuit] = useState(true);
  
  // Major appliances
  const [includeRange, setIncludeRange] = useState(true);
  const [rangeKW, setRangeKW] = useState<string>('8');
  const [includeDryer, setIncludeDryer] = useState(true);
  const [dryerKW, setDryerKW] = useState<string>('5');
  
  // HVAC
  const [heatingKW, setHeatingKW] = useState<string>('0');
  const [coolingKW, setCoolingKW] = useState<string>('5');
  
  // Other loads
  const [otherLoadsText, setOtherLoadsText] = useState<string>('');
  
  // Voltage
  const [voltage, setVoltage] = useState<string>('240');

  const result = useMemo(() => {
    try {
      const sqFt = parseInt(squareFootage, 10);
      if (isNaN(sqFt) || sqFt <= 0) return null;

      // Parse other loads (comma-separated kW values, convert to VA)
      const fastenedAppliancesVa = otherLoadsText
        .split(',')
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n) && n > 0)
        .map(kw => kw * 1000);

      const input: ServiceFeederInput = {
        squareFootage: sqFt,
        smallApplianceCircuits,
        includeLaundryCircuit,
        includeRange,
        rangeVa: (parseFloat(rangeKW) || 0) * 1000,
        includeDryer,
        dryerVa: (parseFloat(dryerKW) || 0) * 1000,
        heatingVa: (parseFloat(heatingKW) || 0) * 1000,
        coolingVa: (parseFloat(coolingKW) || 0) * 1000,
        fastenedAppliancesVa,
        voltage: parseInt(voltage, 10) || 240,
      };

      return calculateServiceFeeder(input);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Calculation error' };
    }
  }, [
    squareFootage, smallApplianceCircuits, includeLaundryCircuit,
    includeRange, rangeKW, includeDryer, dryerKW,
    heatingKW, coolingKW, otherLoadsText, voltage
  ]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  const circuitOptions = [1, 2, 3, 4];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      {/* Dwelling Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>DWELLING INFO</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>SQUARE FOOTAGE</Text>
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.surface 
          }]}
          keyboardType="number-pad"
          value={squareFootage}
          onChangeText={setSquareFootage}
          placeholder="Enter sq ft"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>SYSTEM VOLTAGE</Text>
        <View style={styles.toggleRow}>
          {['120', '240', '208'].map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.voltageButton,
                { borderColor: colors.border },
                voltage === v && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
              onPress={() => setVoltage(v)}
            >
              <Text style={[
                styles.voltageButtonText,
                { color: voltage === v ? '#fff' : colors.text }
              ]}>
                {v}V
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* General Loads Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>GENERAL LOADS</Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>SMALL APPLIANCE CIRCUITS</Text>
        <View style={styles.toggleRow}>
          {circuitOptions.map((circuits) => (
            <TouchableOpacity
              key={circuits}
              style={[
                styles.circuitButton,
                { borderColor: colors.border },
                smallApplianceCircuits === circuits && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
              onPress={() => setSmallApplianceCircuits(circuits)}
            >
              <Text style={[
                styles.circuitButtonText,
                { color: smallApplianceCircuits === circuits ? '#fff' : colors.text }
              ]}>
                {circuits}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>LAUNDRY CIRCUIT (1500 VA)</Text>
          <Switch
            value={includeLaundryCircuit}
            onValueChange={setIncludeLaundryCircuit}
            trackColor={{ false: colors.border, true: accentColor }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Range Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>ELECTRIC RANGE</Text>
        
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>INCLUDE RANGE</Text>
          <Switch
            value={includeRange}
            onValueChange={setIncludeRange}
            trackColor={{ false: colors.border, true: accentColor }}
            thumbColor="#fff"
          />
        </View>

        {includeRange && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>RANGE LOAD (kW)</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border, 
                color: colors.text,
                backgroundColor: colors.surface 
              }]}
              keyboardType="decimal-pad"
              value={rangeKW}
              onChangeText={setRangeKW}
              placeholder="8"
              placeholderTextColor={colors.textTertiary}
            />
          </>
        )}
      </View>

      {/* Dryer Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>ELECTRIC DRYER</Text>
        
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>INCLUDE DRYER</Text>
          <Switch
            value={includeDryer}
            onValueChange={setIncludeDryer}
            trackColor={{ false: colors.border, true: accentColor }}
            thumbColor="#fff"
          />
        </View>

        {includeDryer && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>DRYER LOAD (kW)</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: colors.border, 
                color: colors.text,
                backgroundColor: colors.surface 
              }]}
              keyboardType="decimal-pad"
              value={dryerKW}
              onChangeText={setDryerKW}
              placeholder="5"
              placeholderTextColor={colors.textTertiary}
            />
          </>
        )}
      </View>

      {/* HVAC Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>HVAC LOAD</Text>
        <Text style={[styles.helpText, { color: colors.textTertiary }]}>
          NEC 220.82: Use larger of heating OR cooling, not both
        </Text>
        
        <Text style={[styles.label, { color: colors.textSecondary }]}>HEATING (kW)</Text>
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.surface 
          }]}
          keyboardType="decimal-pad"
          value={heatingKW}
          onChangeText={setHeatingKW}
          placeholder="0 (if gas)"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>COOLING (kW)</Text>
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.surface 
          }]}
          keyboardType="decimal-pad"
          value={coolingKW}
          onChangeText={setCoolingKW}
          placeholder="5"
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      {/* Other Loads Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>OTHER LOADS</Text>
        <Text style={[styles.helpText, { color: colors.textTertiary }]}>
          Fastened-in-place appliances (water heater, dishwasher, disposal, hot tub, pool, EV charger, etc.)
        </Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>ADDITIONAL LOADS (kW, comma-separated)</Text>
        <TextInput
          style={[styles.input, { 
            borderColor: colors.border, 
            color: colors.text,
            backgroundColor: colors.surface 
          }]}
          keyboardType="default"
          value={otherLoadsText}
          onChangeText={setOtherLoadsText}
          placeholder="e.g., 4.5, 1.2, 0.75 (water heater, dishwasher, disposal)"
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      {/* Results Section */}
      {result && !('error' in result) && (
        <View style={[styles.resultsContainer, { backgroundColor: colors.surface, borderColor: accentColor }]}>
          <Text style={[styles.resultsTitle, { color: accentColor }]}>CALCULATED LOAD</Text>
          
          {/* Load Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={[styles.breakdownTitle, { color: colors.textSecondary }]}>LOAD BREAKDOWN</Text>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>General Lighting:</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>{formatNumber(result.breakdown.generalLightingVa)} VA</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Small Appliance:</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>{formatNumber(result.breakdown.smallApplianceVa)} VA</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Laundry:</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>{formatNumber(result.breakdown.laundryVa)} VA</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Range:</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>{formatNumber(result.breakdown.rangeVa)} VA</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Dryer:</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>{formatNumber(result.breakdown.dryerVa)} VA</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>HVAC (larger of H/C):</Text>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>{formatNumber(result.breakdown.hvacLargestVa)} VA</Text>
            </View>
            {result.breakdown.fastenedAppliancesVa > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Other Appliances:</Text>
                <Text style={[styles.breakdownValue, { color: colors.text }]}>{formatNumber(result.breakdown.fastenedAppliancesVa)} VA</Text>
              </View>
            )}
          </View>

          {/* Total Connected Load */}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Connected Load:</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{formatNumber(result.breakdown.connectedLoadVa)} VA</Text>
          </View>

          {/* Demand Adjusted */}
          <View style={[styles.totalRow, { borderTopWidth: 0 }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>After Demand Factor:</Text>
            <Text style={[styles.totalValue, { color: accentColor }]}>{formatNumber(result.breakdown.demandAdjustedVa)} VA</Text>
          </View>

          {/* Final Results */}
          <View style={[styles.finalResultBox, { backgroundColor: accentColor + '20' }]}>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Calculated Amps:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatNumber(result.calculatedAmps)} A</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Utilization:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{result.utilizationPercent}%</Text>
            </View>
          </View>

          {/* Service Recommendation */}
          <View style={[styles.serviceBox, { backgroundColor: accentColor }]}>
            <Text style={styles.serviceLabel}>RECOMMENDED SERVICE</Text>
            <Text style={styles.serviceValue}>{result.recommendedService}A</Text>
            {result.exceeds80PercentRule && (
              <Text style={styles.serviceWarning}>⚠️ Exceeds 80% rule</Text>
            )}
          </View>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              {result.warnings.map((warning: string, index: number) => (
                <Text key={index} style={[styles.warningText, { color: colors.error || '#ef4444' }]}>
                  {warning}
                </Text>
              ))}
            </View>
          )}

          {/* NEC Reference */}
          <Text style={[styles.necRef, { color: colors.textTertiary }]}>
            Based on NEC Article {result.necArticle}
          </Text>
        </View>
      )}

      {'error' in (result || {}) && (
        <View style={[styles.errorContainer, { backgroundColor: (colors.error || '#ef4444') + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error || '#ef4444' }]}>
            {(result as any).error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  helpText: {
    fontSize: FontSizes.xs,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  voltageButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  voltageButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  circuitButton: {
    width: 50,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circuitButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultsContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  resultsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  breakdownSection: {
    marginBottom: Spacing.md,
  },
  breakdownTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  breakdownLabel: {
    fontSize: FontSizes.sm,
  },
  breakdownValue: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  finalResultBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  resultLabel: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  serviceBox: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  serviceLabel: {
    color: '#fff',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  serviceValue: {
    color: '#fff',
    fontSize: FontSizes.xl,
    fontWeight: '800',
    marginVertical: Spacing.sm,
  },
  serviceWarning: {
    color: '#fff',
    fontSize: FontSizes.sm,
    opacity: 0.9,
    fontWeight: '500',
  },
  warningsContainer: {
    marginBottom: Spacing.md,
  },
  warningText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  necRef: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
});
