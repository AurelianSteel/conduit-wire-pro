import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import {
  BoxSize,
  ConductorEntry,
  ALL_BOXES,
} from '../../src/data/box-dimensions';
import { calculateBoxFill } from '../../src/engines/box-fill-engine';

const WIRE_SIZES = [14, 12, 10, 8, 6];

export default function BoxFillScreen() {
  const { colors } = useTheme();
  const [wireSize, setWireSize] = useState(14);
  const [wireCount, setWireCount] = useState(4);
  const [deviceYokes, setDeviceYokes] = useState(1);
  const [hasClamps, setHasClamps] = useState(true);
  const [hasGrounds, setHasGrounds] = useState(true);

  // Build a dummy "large enough" box so the engine calculates total volume
  const dummyBox: BoxSize = useMemo(() => ({
    id: 'dummy',
    name: 'Calc',
    type: 'square',
    dimensions: '',
    volumeIn3: 999,
  }), []);

  const conductors: ConductorEntry[] = useMemo(() => [
    { awg: wireSize, quantity: wireCount },
  ], [wireSize, wireCount]);

  const calculation = useMemo(() => {
    return calculateBoxFill({
      selectedBox: dummyBox,
      conductors,
      hasInternalClamps: hasClamps,
      deviceYokeCount: deviceYokes,
      hasGroundingConductors: hasGrounds,
    });
  }, [dummyBox, conductors, hasClamps, deviceYokes, hasGrounds]);

  const totalVolume = calculation.selectedResult.totalVolume;
  const breakdown = calculation.selectedResult.breakdown;

  // Find boxes that fit
  const boxesThatFit = useMemo(() => {
    return ALL_BOXES
      .filter(b => b.volumeIn3 >= totalVolume)
      .sort((a, b) => a.volumeIn3 - b.volumeIn3);
  }, [totalVolume]);

  const minimumBox = boxesThatFit.length > 0 ? boxesThatFit[0] : null;

  const adjustCount = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    current: number,
    delta: number,
    min = 0,
    max = 20,
  ) => {
    setter(Math.max(min, Math.min(max, current + delta)));
  };

  // Breakdown rows
  const breakdownRows = [
    { label: `#${wireSize} conductors`, value: breakdown.conductors.totalVolume },
    ...(hasClamps ? [{ label: 'Cable clamps (internal)', value: breakdown.clamps.volume }] : []),
    ...(deviceYokes > 0 ? [{ label: 'Device yokes', value: breakdown.deviceYokes.volume }] : []),
    ...(hasGrounds ? [{ label: 'Equipment grounds (all)', value: breakdown.grounds.volume }] : []),
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Conductor Size */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUCTOR SIZE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {WIRE_SIZES.map((ws) => (
          <TouchableOpacity
            key={ws}
            style={[
              styles.chip,
              { borderColor: colors.border },
              wireSize === ws && { backgroundColor: '#FF8C42', borderColor: '#FF8C42' },
            ]}
            onPress={() => setWireSize(ws)}
          >
            <Text style={[styles.chipText, { color: wireSize === ws ? '#fff' : colors.textSecondary }]}>
              #{ws}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Number of Conductors */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>NUMBER OF CONDUCTORS</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => adjustCount(setWireCount, wireCount, -1, 1)}
        >
          <Text style={[styles.counterBtnText, { color: '#FF8C42' }]}>−</Text>
        </TouchableOpacity>
        <View style={[styles.counterDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.counterValue, { color: colors.text }]}>{wireCount}</Text>
        </View>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => adjustCount(setWireCount, wireCount, 1)}
        >
          <Text style={[styles.counterBtnText, { color: '#FF8C42' }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Device Yokes */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>DEVICE YOKES (switches/receptacles)</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => adjustCount(setDeviceYokes, deviceYokes, -1)}
        >
          <Text style={[styles.counterBtnText, { color: '#FF8C42' }]}>−</Text>
        </TouchableOpacity>
        <View style={[styles.counterDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.counterValue, { color: colors.text }]}>{deviceYokes}</Text>
        </View>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => adjustCount(setDeviceYokes, deviceYokes, 1)}
        >
          <Text style={[styles.counterBtnText, { color: '#FF8C42' }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Toggles */}
      <View style={[styles.toggleRow, { borderColor: colors.border }]}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>Internal Cable Clamps</Text>
        <Switch
          value={hasClamps}
          onValueChange={setHasClamps}
          trackColor={{ true: '#FF8C42', false: colors.border }}
        />
      </View>
      <View style={[styles.toggleRow, { borderColor: colors.border }]}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>Equipment Grounds</Text>
        <Switch
          value={hasGrounds}
          onValueChange={setHasGrounds}
          trackColor={{ true: '#FF8C42', false: colors.border }}
        />
      </View>

      {/* Result Card — Minimum Box */}
      <View style={[styles.resultCard, {
        backgroundColor: minimumBox ? colors.success + '15' : colors.error + '15',
        borderColor: minimumBox ? colors.success : colors.error,
      }]}>
        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
          MINIMUM BOX SIZE
        </Text>
        <Text style={[styles.resultValue, {
          color: minimumBox ? colors.success : colors.error,
        }]}>
          {minimumBox ? minimumBox.name : 'No standard box'}
        </Text>
        {minimumBox && (
          <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}>
            {minimumBox.volumeIn3} cu in
          </Text>
        )}
        <Text style={[styles.resultSubtext, { color: colors.textSecondary, marginTop: 4 }]}>
          Required volume: {totalVolume.toFixed(2)} in³
        </Text>
      </View>

      {/* Volume Breakdown */}
      <View style={[styles.breakdownCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.breakdownTitle, { color: colors.text }]}>Volume Breakdown</Text>
        {breakdownRows.map((row, idx) => (
          <View key={idx} style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.breakdownItem, { color: colors.textSecondary }]}>{row.label}</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              {row.value.toFixed(2)} in³
            </Text>
          </View>
        ))}
        <View style={[styles.breakdownRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.breakdownItem, { color: '#FF8C42', fontWeight: '700' }]}>Total</Text>
          <Text style={[styles.breakdownValue, { color: '#FF8C42', fontWeight: '700' }]}>
            {totalVolume.toFixed(2)} in³
          </Text>
        </View>
      </View>

      {/* Boxes That Fit */}
      <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.tableTitle, { color: colors.text }]}>
          ✅ Boxes That Fit ({boxesThatFit.length})
        </Text>
        {boxesThatFit.length === 0 ? (
          <Text style={[styles.noBoxText, { color: colors.error }]}>
            No standard box is large enough. Reduce conductors or use a larger box.
          </Text>
        ) : (
          boxesThatFit.slice(0, 10).map((box, idx) => (
            <View
              key={box.id}
              style={[
                styles.boxRow,
                { borderBottomColor: colors.border },
                idx % 2 === 1 && { backgroundColor: colors.surfaceElevated + '40' },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.boxName, { color: colors.text }]}>{box.name}</Text>
                <Text style={[styles.boxDims, { color: colors.textSecondary }]}>{box.type}</Text>
              </View>
              <Text style={[styles.boxVolume, { color: colors.success }]}>
                {box.volumeIn3} in³
              </Text>
            </View>
          ))
        )}
      </View>
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
  chipRow: {
    flexDirection: 'row',
    maxHeight: 44,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 24,
    fontWeight: '700',
  },
  counterDisplay: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
  },
  toggleLabel: {
    fontSize: FontSizes.md,
  },
  resultCard: {
    marginTop: Spacing.xl,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  resultSubtext: {
    fontSize: FontSizes.sm,
  },
  breakdownCard: {
    marginTop: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  breakdownTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    padding: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
  },
  breakdownItem: {
    fontSize: FontSizes.sm,
  },
  breakdownValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  tableCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
  tableTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    padding: Spacing.md,
  },
  noBoxText: {
    padding: Spacing.lg,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
  },
  boxName: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  boxDims: {
    fontSize: FontSizes.xs,
  },
  boxVolume: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
