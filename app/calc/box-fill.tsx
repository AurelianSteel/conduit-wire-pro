import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { Spacing, FontSizes } from '../../src/theme';
import {
  BoxSize,
  ConductorEntry,
  ALL_BOXES,
} from '../../src/data/box-dimensions';
import { calculateBoxFill } from '../../src/engines/box-fill-engine';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';
import { ShareButton } from '../../src/components/ShareButton';
import { ShareSheet } from '../../src/components/ShareSheet';
import { ShareData } from '../../src/services/shareService';

const WIRE_SIZES = [14, 12, 10, 8, 6];

type ConductorEntryUI = {
  id: string;
  awg: number;
  quantity: number;
};

const makeEntryId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function BoxFillScreen() {
  const { colors } = useTheme();

  const [conductorEntries, setConductorEntries] = useState<ConductorEntryUI[]>([
    { id: makeEntryId(), awg: 14, quantity: 4 },
  ]);
  const [deviceYokes, setDeviceYokes] = useState(1);
  const [hasClamps, setHasClamps] = useState(true);
  const [hasGrounds, setHasGrounds] = useState(true);

  const [showAddConductorsModal, setShowAddConductorsModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [newWireSize, setNewWireSize] = useState(14);
  const [newWireCount, setNewWireCount] = useState(1);

  const dummyBox: BoxSize = useMemo(() => ({
    id: 'dummy',
    name: 'Calc',
    type: 'square',
    volumeIn3: 999,
  }), []);

  const conductors: ConductorEntry[] = useMemo(
    () => conductorEntries.map(({ awg, quantity }) => ({ awg, quantity })),
    [conductorEntries],
  );

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

  const boxesThatFit = useMemo(() => {
    return ALL_BOXES
      .filter(b => b.volumeIn3 >= totalVolume)
      .sort((a, b) => a.volumeIn3 - b.volumeIn3);
  }, [totalVolume]);

  const minimumBox = boxesThatFit.length > 0 ? boxesThatFit[0] : null;

  const totalConductors = conductorEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const conductorSummary = conductorEntries
    .map((entry) => `${entry.quantity} × #${entry.awg}`)
    .join(', ');

  const adjustCount = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    current: number,
    delta: number,
    min = 0,
    max = 50,
  ) => {
    setter(Math.max(min, Math.min(max, current + delta)));
  };

  const adjustEntryCount = (id: string, delta: number) => {
    setConductorEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, quantity: Math.max(1, Math.min(50, entry.quantity + delta)) }
          : entry,
      ),
    );
  };

  const removeEntry = (id: string) => {
    setConductorEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const addEntry = () => {
    setConductorEntries((prev) => [
      ...prev,
      {
        id: makeEntryId(),
        awg: newWireSize,
        quantity: Math.max(1, newWireCount),
      },
    ]);
    setNewWireSize(14);
    setNewWireCount(1);
    setShowAddConductorsModal(false);
  };

  const breakdownRows = [
    ...breakdown.conductors.details.map((detail) => ({
      label: `#${detail.awg} conductors (${detail.count})`,
      value: detail.subtotal,
    })),
    ...(hasClamps ? [{ label: 'Cable clamps (internal)', value: breakdown.clamps.volume }] : []),
    ...(deviceYokes > 0 ? [{ label: 'Device yokes', value: breakdown.deviceYokes.volume }] : []),
    ...(hasGrounds ? [{ label: 'Equipment grounds (all)', value: breakdown.grounds.volume }] : []),
  ];


  // Build share data from result
  const buildShareData = (): ShareData | null => {
    if (!minimumBox) return null;

    return {
      calculatorType: "box-fill",
      calculatorTitle: "Box Fill Calculator",
      inputs: {
        conductors: conductorSummary,
        totalConductors,
        deviceYokes,
        hasClamps: hasClamps ? "Yes" : "No",
        hasGrounds: hasGrounds ? "Yes" : "No",
      },
      result: {
        value: minimumBox.name,
        label: "Minimum Box Size",
        details: {
          volume: `${minimumBox.volumeIn3} in³`,
          requiredVolume: `${totalVolume.toFixed(2)} in³`,
          boxType: minimumBox.type,
        },
      },
      necArticle: "314.16",
      necReference: "NEC 2023 Article 314.16",
      timestamp: new Date(),
    };
  };
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUCTORS</Text>
      {conductorEntries.map((entry) => (
        <View key={entry.id} style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.entryTopRow}>
            <View style={[styles.entryChip, { backgroundColor: colors.secondary + '22' }]}>
              <Text style={[styles.entryChipText, { color: colors.secondary }]}>#{entry.awg} AWG</Text>
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
              <Text style={[styles.counterBtnText, { color: colors.secondary }]}>−</Text>
            </TouchableOpacity>
            <View style={[styles.counterDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Text style={[styles.counterValue, { color: colors.text }]}>{entry.quantity}</Text>
            </View>
            <TouchableOpacity
              style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => adjustEntryCount(entry.id, 1)}
            >
              <Text style={[styles.counterBtnText, { color: colors.secondary }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        onPress={() => setShowAddConductorsModal(true)}
      >
        <Text style={[styles.addBtnText, { color: colors.secondary }]}>+ Add Conductors</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.textSecondary }]}>DEVICE YOKES (switches/receptacles)</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => adjustCount(setDeviceYokes, deviceYokes, -1)}
        >
          <Text style={[styles.counterBtnText, { color: colors.secondary }]}>−</Text>
        </TouchableOpacity>
        <View style={[styles.counterDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.counterValue, { color: colors.text }]}>{deviceYokes}</Text>
        </View>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
          onPress={() => adjustCount(setDeviceYokes, deviceYokes, 1)}
        >
          <Text style={[styles.counterBtnText, { color: colors.secondary }]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.toggleRow, { borderColor: colors.border }]}> 
        <Text style={[styles.toggleLabel, { color: colors.text }]}>Internal Cable Clamps</Text>
        <Switch
          value={hasClamps}
          onValueChange={setHasClamps}
          trackColor={{ true: colors.secondary, false: colors.border }}
        />
      </View>
      <View style={[styles.toggleRow, { borderColor: colors.border }]}> 
        <Text style={[styles.toggleLabel, { color: colors.text }]}>Equipment Grounds</Text>
        <Switch
          value={hasGrounds}
          onValueChange={setHasGrounds}
          trackColor={{ true: colors.secondary, false: colors.border }}
        />
      </View>

      <View style={[styles.resultCard, {
        backgroundColor: minimumBox ? colors.success + '15' : colors.error + '15',
        borderColor: minimumBox ? colors.success : colors.error,
      }]}> 
        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>MINIMUM BOX SIZE</Text>
        <Text style={[styles.resultValue, { color: minimumBox ? colors.success : colors.error }]}> 
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
        <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}> 
          {totalConductors} conductors total
        </Text>
        <Text style={[styles.resultSubtext, { color: colors.textSecondary }]}> 
          {conductorSummary || 'No conductors added'}
        </Text>
      </View>

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
          <Text style={[styles.breakdownItem, { color: colors.secondary, fontWeight: '700' }]}>Total</Text>
          <Text style={[styles.breakdownValue, { color: colors.secondary, fontWeight: '700' }]}>
            {totalVolume.toFixed(2)} in³
          </Text>
        </View>
      </View>

      <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.tableTitle, { color: colors.text }]}>✅ Boxes That Fit ({boxesThatFit.length})</Text>
        {boxesThatFit.length === 0 ? (
          <Text style={[styles.noBoxText, { color: colors.error }]}>No standard box is large enough. Reduce conductors or use a larger box.</Text>
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
              <Text style={[styles.boxVolume, { color: colors.success }]}>{box.volumeIn3} in³</Text>
            </View>
          ))
        )}
      </View>

      <LegalDisclaimer />

      {buildShareData() && (
        <ShareButton
          data={buildShareData()!}
          onPress={() => setShowShareSheet(true)}
          accentColor={colors.secondary}
        />
      )}

      <ShareSheet
        visible={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        data={buildShareData() || {
          calculatorType: "box-fill",
          calculatorTitle: "Box Fill Calculator",
          inputs: {},
          result: { value: "", label: "" },
          necArticle: "314.16",
          necReference: "NEC 2023 Article 314.16",
        }}
        accentColor={colors.secondary}
      />

      <Modal visible={showAddConductorsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '72%' }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Conductors</Text>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 0 }]}>WIRE SIZE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} scrollEnabled={true}>
              {WIRE_SIZES.map((ws) => (
                <TouchableOpacity
                  key={ws}
                  style={[
                    styles.chip,
                    { borderColor: colors.border },
                    newWireSize === ws && { backgroundColor: colors.secondary, borderColor: colors.secondary },
                  ]}
                  onPress={() => setNewWireSize(ws)}
                >
                  <Text style={[styles.chipText, { color: newWireSize === ws ? '#fff' : colors.textSecondary }]}>#{ws}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>QUANTITY</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
                onPress={() => setNewWireCount((count) => Math.max(1, count - 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.secondary }]}>−</Text>
              </TouchableOpacity>
              <View style={[styles.counterDisplay, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <Text style={[styles.counterValue, { color: colors.text }]}>{newWireCount}</Text>
              </View>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.surfaceElevated }]}
                onPress={() => setNewWireCount((count) => Math.min(50, count + 1))}
              >
                <Text style={[styles.counterBtnText, { color: colors.secondary }]}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalAction, { backgroundColor: colors.secondary, opacity: newWireCount > 0 ? 1 : 0.5 }]}
              onPress={addEntry}
              disabled={newWireCount <= 0}
            >
              <Text style={styles.modalActionText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancel, { backgroundColor: colors.surfaceElevated }]}
              onPress={() => setShowAddConductorsModal(false)}
            >
              <Text style={{ color: colors.secondary, fontWeight: '700', fontSize: FontSizes.md }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    textAlign: 'center',
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
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
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
