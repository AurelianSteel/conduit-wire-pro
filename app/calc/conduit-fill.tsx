import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import { ConduitType, conduitSizes } from '../../src/data/conduit-dimensions';
import { WireInsulationType } from '../../src/data/wire-dimensions';
import { calculateConduitFill } from '../../src/engines/conduit-fill-engine';

const CONDUIT_TYPES: ConduitType[] = ['EMT', 'IMC', 'RMC', 'PVC-40', 'PVC-80'];
const TRADE_SIZES = ['1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '2-1/2', '3', '3-1/2', '4'];
const WIRE_SIZES = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '400', '500'];
const INSULATION_GROUPS: { key: WireInsulationType; label: string }[] = [
  { key: 'THHN', label: 'THHN/THWN-2' },
  { key: 'THW', label: 'THW/THW-2' },
  { key: 'TW', label: 'TW' },
  { key: 'XHHW', label: 'XHHW/USE-2' },
  { key: 'RHH', label: 'RHH/RHW' },
  { key: 'NM-B', label: 'NM-B' },
];

export default function ConduitFillScreen() {
  const { colors } = useTheme();
  const [conduitType, setConduitType] = useState<ConduitType>('EMT');
  const [tradeSize, setTradeSize] = useState('3/4');
  const [showTradeSizePicker, setShowTradeSizePicker] = useState(false);
  const [wireSize, setWireSize] = useState('12');
  const [insulationType, setInsulationType] = useState<WireInsulationType>('THHN');
  const [wireCount, setWireCount] = useState(3);

  const result = useMemo(() => {
    const entry = { awg: wireSize, insulation: insulationType, quantity: wireCount };
    return calculateConduitFill({ conduitType, conduitSize: tradeSize, wires: [entry] });
  }, [conduitType, tradeSize, wireSize, insulationType, wireCount]);

  const maxFillPercent = wireCount === 1 ? 53 : wireCount === 2 ? 31 : 40;
  const fillLabel = wireCount === 1 ? '1 conductor' : wireCount === 2 ? '2 conductors' : '3+ conductors';
  const insLabel = INSULATION_GROUPS.find(g => g.key === insulationType)?.label || insulationType;
  const selectedResult = result.selectedResult;

  const adjustCount = (delta: number) => {
    setWireCount(Math.max(1, Math.min(50, wireCount + delta)));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Conduit Type */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUIT TYPE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {CONDUIT_TYPES.map((ct) => (
          <TouchableOpacity
            key={ct}
            style={[
              styles.chip,
              { borderColor: colors.border },
              conduitType === ct && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setConduitType(ct)}
          >
            <Text style={[styles.chipText, { color: conduitType === ct ? '#fff' : colors.textSecondary }]}>
              {ct}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trade Size Dropdown */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUIT TRADE SIZE</Text>
      <TouchableOpacity
        style={[styles.dropdown, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        onPress={() => setShowTradeSizePicker(true)}
      >
        <Text style={[styles.dropdownText, { color: colors.text }]}>{tradeSize}"</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={showTradeSizePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Trade Size</Text>
            <FlatList
              data={TRADE_SIZES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border },
                    item === tradeSize && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => { setTradeSize(item); setShowTradeSizePicker(false); }}
                >
                  <Text style={[styles.modalOptionText, { color: item === tradeSize ? colors.primary : colors.text }]}>
                    {item}"
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalCancel, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => setShowTradeSizePicker(false)}
            >
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: FontSizes.md }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Wire Size */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>WIRE SIZE (AWG/kcmil)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {WIRE_SIZES.map((ws) => (
          <TouchableOpacity
            key={ws}
            style={[
              styles.chip,
              { borderColor: colors.border },
              wireSize === ws && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setWireSize(ws)}
          >
            <Text style={[styles.chipText, { color: wireSize === ws ? '#fff' : colors.textSecondary }]}>
              #{ws}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Insulation Type */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>INSULATION TYPE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {INSULATION_GROUPS.map((ins) => (
          <TouchableOpacity
            key={ins.key}
            style={[
              styles.chip,
              { borderColor: colors.border },
              insulationType === ins.key && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setInsulationType(ins.key)}
          >
            <Text style={[styles.chipText, { color: insulationType === ins.key ? '#fff' : colors.textSecondary }]}>
              {ins.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Wire Count */}
      <Text style={[styles.label, { color: colors.textSecondary }]}>NUMBER OF CONDUCTORS</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => adjustCount(-1)}
        >
          <Text style={[styles.counterBtnText, { color: colors.primary }]}>−</Text>
        </TouchableOpacity>
        <View style={[styles.counterDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.counterValue, { color: colors.text }]}>{wireCount}</Text>
        </View>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => adjustCount(1)}
        >
          <Text style={[styles.counterBtnText, { color: colors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Result Card */}
      <View style={[styles.resultCard, {
        backgroundColor: selectedResult?.passes ? colors.success + '15' : colors.error + '15',
        borderColor: selectedResult?.passes ? colors.success : colors.error,
      }]}>
        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
          CONDUIT FILL
        </Text>
        <Text style={[styles.resultValue, {
          color: selectedResult?.passes ? colors.success : colors.error,
        }]}>
          {selectedResult ? selectedResult.fillPercent.toFixed(1) + '%' : 'N/A'}
        </Text>
        <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}>
          {wireCount} × #{wireSize} {insLabel} in {tradeSize}" {conduitType}
        </Text>
        <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}>
          Max fill: {maxFillPercent}% ({fillLabel})
          {selectedResult ? (selectedResult.passes ? ' — ✅ PASS' : ' — ❌ FAIL') : ''}
        </Text>
        {result.minimumSize && result.minimumSize.conduitSize !== tradeSize && (
          <Text style={[styles.resultSubtext, { color: colors.primary, marginTop: 6, fontWeight: '600' }]}>
            Min size: {result.minimumSize.conduitSize}" {conduitType}
          </Text>
        )}
      </View>

      {/* Fill by conduit size table */}
      <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.tableTitle, { color: colors.text }]}>Fill % by Conduit Size</Text>
        <View style={[styles.headerRow, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.headerCell, { flex: 1, color: colors.text }]}>Trade Size</Text>
          <Text style={[styles.headerCell, { flex: 1, color: colors.text }]}>Fill %</Text>
          <Text style={[styles.headerCell, { flex: 0.5, color: colors.text }]}>OK?</Text>
        </View>
        {result.allResults.map((r, idx) => (
          <View
            key={r.conduitSize}
            style={[
              styles.dataRow,
              { borderBottomColor: colors.border },
              idx % 2 === 1 && { backgroundColor: colors.surfaceElevated + '40' },
            ]}
          >
            <Text style={[styles.dataCell, { flex: 1, color: colors.text }]}>{r.conduitSize}"</Text>
            <Text style={[styles.dataCell, {
              flex: 1,
              color: r.passes ? colors.success : colors.error,
              fontWeight: '600',
            }]}>
              {r.fillPercent.toFixed(1)}%
            </Text>
            <Text style={[styles.dataCell, { flex: 0.5 }]}>
              {r.passes ? '✅' : '❌'}
            </Text>
          </View>
        ))}
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
    fontSize: 36,
    fontWeight: '900',
    marginBottom: Spacing.sm,
  },
  resultSubtext: {
    fontSize: FontSizes.sm,
    marginTop: 2,
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
  headerRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  headerCell: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
  },
  dataCell: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownText: { fontSize: 18, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.lg,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 0.5,
  },
  modalOptionText: { fontSize: 16, fontWeight: '500' },
  modalCancel: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
});
