import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { useSettings } from '../../src/hooks/useSettings';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import { ConduitType } from '../../src/data/conduit-dimensions';
import { WireInsulationType } from '../../src/data/wire-dimensions';
import { calculateConduitFill } from '../../src/engines/conduit-fill-engine';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';
import { ShareButton } from '../../src/components/ShareButton';
import { ShareSheet } from '../../src/components/ShareSheet';
import { ShareData } from '../../src/services/shareService';

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

type WireEntryUI = {
  id: string;
  awg: string;
  insulation: WireInsulationType;
  quantity: number;
};

const makeEntryId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function ConduitFillScreen() {
  const { colors } = useTheme();
  const { settings } = useSettings();

  const mapSettingsToConduitType = (setting: string): ConduitType => {
    if (setting === 'PVC') return 'PVC-40';
    if (setting === 'GRC') return 'RMC';
    return setting as ConduitType;
  };

  const [conduitType, setConduitType] = useState<ConduitType>(mapSettingsToConduitType(settings.defaultConduit));
  const [tradeSize, setTradeSize] = useState('3/4');
  const [showTradeSizePicker, setShowTradeSizePicker] = useState(false);

  const [wireEntries, setWireEntries] = useState<WireEntryUI[]>([
    { id: makeEntryId(), awg: '12', insulation: 'THHN', quantity: 3 },
  ]);

  const [showAddConductorModal, setShowAddConductorModal] = useState(false);
  const [newWireSize, setNewWireSize] = useState('12');
  const [newInsulationType, setNewInsulationType] = useState<WireInsulationType>('THHN');
  const [newWireCount, setNewWireCount] = useState(1);
  const [showShareSheet, setShowShareSheet] = useState(false);

  const result = useMemo(() => {
    return calculateConduitFill({
      conduitType,
      conduitSize: tradeSize,
      wires: wireEntries.map(({ awg, insulation, quantity }) => ({ awg, insulation, quantity })),
    });
  }, [conduitType, tradeSize, wireEntries]);

  const totalConductors = wireEntries.reduce((sum, w) => sum + w.quantity, 0);
  const maxFillPercent = totalConductors <= 0 ? 0 : totalConductors === 1 ? 53 : totalConductors === 2 ? 31 : 40;
  const fillLabel = totalConductors <= 0 ? 'No conductors' : totalConductors === 1 ? '1 conductor' : totalConductors === 2 ? '2 conductors' : '3+ conductors';
  const selectedResult = result.selectedResult;

  const summaryText = wireEntries.length > 0
    ? wireEntries
        .map((w) => `${w.quantity} × #${w.awg} ${INSULATION_GROUPS.find(g => g.key === w.insulation)?.label || w.insulation}`)
        .join(', ')
    : 'No conductors added';

  const adjustEntryCount = (id: string, delta: number) => {
    setWireEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, quantity: Math.max(1, Math.min(50, entry.quantity + delta)) }
          : entry,
      ),
    );
  };

  const removeEntry = (id: string) => {
    setWireEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addEntry = () => {
    setWireEntries((prev) => [
      ...prev,
      {
        id: makeEntryId(),
        awg: newWireSize,
        insulation: newInsulationType,
        quantity: Math.max(1, newWireCount),
      },
    ]);
    setNewWireSize('12');
    setNewInsulationType('THHN');
    setNewWireCount(1);
    setShowAddConductorModal(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUIT TYPE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} scrollEnabled={true}>
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

      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUCTORS</Text>
      {wireEntries.map((entry) => {
        const insLabel = INSULATION_GROUPS.find(g => g.key === entry.insulation)?.label || entry.insulation;
        return (
          <View key={entry.id} style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={styles.entryTopRow}>
              <View style={[styles.entryChip, { backgroundColor: colors.primary + '22' }]}>
                <Text style={[styles.entryChipText, { color: colors.primary }]}>#{entry.awg}</Text>
              </View>
              <View style={[styles.entryChip, { backgroundColor: colors.surfaceElevated }]}> 
                <Text style={[styles.entryChipText, { color: colors.textSecondary }]}>{insLabel}</Text>
              </View>
              <TouchableOpacity onPress={() => removeEntry(entry.id)} style={[styles.deleteBtn, { borderColor: colors.error }]}> 
                <Text style={[styles.deleteBtnText, { color: colors.error }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.counterRow, { marginTop: Spacing.sm }]}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
                onPress={() => adjustEntryCount(entry.id, -1)}
              >
                <Text style={[styles.counterBtnText, { color: colors.primary }]}>−</Text>
              </TouchableOpacity>
              <View style={[styles.counterDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <Text style={[styles.counterValue, { color: colors.text }]}>{entry.quantity}</Text>
              </View>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
                onPress={() => adjustEntryCount(entry.id, 1)}
              >
                <Text style={[styles.counterBtnText, { color: colors.primary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        onPress={() => setShowAddConductorModal(true)}
      >
        <Text style={[styles.addBtnText, { color: colors.primary }]}>+ Add Conductor</Text>
      </TouchableOpacity>

      <Modal visible={showAddConductorModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '75%' }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Conductor</Text>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 0 }]}>WIRE SIZE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} scrollEnabled={true}>
              {WIRE_SIZES.map((ws) => (
                <TouchableOpacity
                  key={ws}
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    newWireSize === ws && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setNewWireSize(ws)}
                >
                  <Text style={[styles.chipText, { color: newWireSize === ws ? '#fff' : colors.textSecondary }]}>#{ws}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>INSULATION TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} scrollEnabled={true}>
              {INSULATION_GROUPS.map((ins) => (
                <TouchableOpacity
                  key={ins.key}
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    newInsulationType === ins.key && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setNewInsulationType(ins.key)}
                >
                  <Text style={[styles.chipText, { color: newInsulationType === ins.key ? '#fff' : colors.textSecondary }]}>
                    {ins.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>QUANTITY</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
                onPress={() => setNewWireCount((c) => Math.max(1, c - 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.primary }]}>−</Text>
              </TouchableOpacity>
              <View style={[styles.counterDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <Text style={[styles.counterValue, { color: colors.text }]}>{newWireCount}</Text>
              </View>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
                onPress={() => setNewWireCount((c) => Math.min(50, c + 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.primary }]}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalAction, { backgroundColor: colors.primary, opacity: newWireCount > 0 ? 1 : 0.5 }]}
              onPress={addEntry}
              disabled={newWireCount <= 0}
            >
              <Text style={styles.modalActionText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancel, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => setShowAddConductorModal(false)}
            >
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: FontSizes.md }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={[styles.resultCard, {
        backgroundColor: selectedResult?.passes ? colors.success + '15' : colors.error + '15',
        borderColor: selectedResult?.passes ? colors.success : colors.error,
      }]}> 
        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>CONDUIT FILL</Text>
        <Text style={[styles.resultValue, {
          color: selectedResult?.passes ? colors.success : colors.error,
        }]}> 
          {selectedResult ? selectedResult.fillPercent.toFixed(1) + '%' : 'N/A'}
        </Text>
        <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}>
          {totalConductors} conductors total in {tradeSize}" {conduitType}
        </Text>
        <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}>
          {summaryText}
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

      {selectedResult && (
        <ShareButton
          data={{
            calculatorType: 'conduit-fill',
            calculatorTitle: 'Conduit Fill Calculator',
            inputs: {
              conduitType,
              tradeSize: tradeSize + '"',
              conductors: summaryText,
              totalConductors,
            },
            result: {
              value: selectedResult.fillPercent.toFixed(1) + '%',
              label: 'Conduit Fill',
              details: {
                passes: selectedResult.passes ? 'Yes' : 'No',
                maxFill: maxFillPercent + '%',
              },
            },
            necArticle: 'Chapter 9, Table 1',
            necReference: 'NEC 2023 Chapter 9, Table 1',
            timestamp: new Date(),
          }}
          onPress={() => setShowShareSheet(true)}
          accentColor={colors.primary}
        />
      )}

      <ShareSheet
        visible={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        data={{
          calculatorType: 'conduit-fill',
          calculatorTitle: 'Conduit Fill Calculator',
          inputs: {
            conduitType,
            tradeSize: tradeSize + '"',
            conductors: summaryText,
            totalConductors,
          },
          result: {
            value: selectedResult ? selectedResult.fillPercent.toFixed(1) + '%' : 'N/A',
            label: 'Conduit Fill',
            details: {
              passes: selectedResult?.passes ? 'Yes' : 'No',
              maxFill: maxFillPercent + '%',
            },
          },
          necArticle: 'Chapter 9, Table 1',
          necReference: 'NEC 2023 Chapter 9, Table 1',
          timestamp: new Date(),
        }}
        accentColor={colors.primary}
      />

      <LegalDisclaimer />

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
            <Text style={[styles.dataCell, { flex: 0.5 }]}>{r.passes ? '✅' : '❌'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, padding: Spacing.lg, paddingBottom: 100 },
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
  entryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  entryChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  deleteBtn: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addBtnText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
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
    textAlign: 'center',
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
    paddingHorizontal: Spacing.lg,
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
  modalAction: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalActionText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  modalCancel: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
});