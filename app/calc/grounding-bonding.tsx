import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, FlatList } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { BorderRadius, FontSizes, Spacing } from '../../src/theme';
import {
  calculateEGCSize,
  calculateGECSize,
  calculateMBJSize,
  groundingBondingData,
} from '../../src/services/groundingBondingService';
import { ConductorSize, GroundingMaterial } from '../../src/types/groundingBonding';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';

type ActiveTab = 'egc' | 'gec' | 'mbj';

export default function GroundingBondingScreen() {
  const { colors } = useTheme();
  const accentColor = '#22c55e';

  const [activeTab, setActiveTab] = useState<ActiveTab>('egc');
  const [material, setMaterial] = useState<GroundingMaterial>('copper');

  const [ocpdRating, setOcpdRating] = useState<number>(100);
  const [conductorSize, setConductorSize] = useState<ConductorSize>('4/0');
  const [showConductorPicker, setShowConductorPicker] = useState(false);

  const result = useMemo(() => {
    if (activeTab === 'egc') {
      return calculateEGCSize({ ocpdRating, material });
    }
    if (activeTab === 'gec') {
      return calculateGECSize({ largestUngroundedConductor: conductorSize, material });
    }
    return calculateMBJSize({ largestUngroundedConductor: conductorSize, material });
  }, [activeTab, ocpdRating, material, conductorSize]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
      bounces={true}
      scrollEnabled={true}
    >
      <View style={[styles.tabRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {([
          { key: 'egc', label: 'EGC Sizing' },
          { key: 'gec', label: 'GEC Sizing' },
          { key: 'mbj', label: 'MBJ Sizing' },
        ] as const).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && { backgroundColor: accentColor },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#fff' : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'egc' ? (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>OCPD RATING (A)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.md }}>
            {groundingBondingData.egcOcpdRatings.map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  ocpdRating === rating && { backgroundColor: accentColor, borderColor: accentColor },
                ]}
                onPress={() => setOcpdRating(rating)}
              >
                <Text style={[styles.chipText, { color: ocpdRating === rating ? '#fff' : colors.textSecondary }]}>
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>LARGEST UNGROUNDED CONDUCTOR</Text>
          <TouchableOpacity
            style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setShowConductorPicker(true)}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>{conductorSize}</Text>
            <Text style={{ color: colors.textSecondary }}>▼</Text>
          </TouchableOpacity>

          <Modal visible={showConductorPicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}> 
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Conductor Size</Text>
                <FlatList
                  data={groundingBondingData.conductorSizes}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.modalOption,
                        { borderBottomColor: colors.border },
                        conductorSize === item && { backgroundColor: accentColor + '20' },
                      ]}
                      onPress={() => {
                        setConductorSize(item);
                        setShowConductorPicker(false);
                      }}
                    >
                      <Text style={[styles.modalOptionText, { color: conductorSize === item ? accentColor : colors.text }]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={[styles.modalCancel, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => setShowConductorPicker(false)}
                >
                  <Text style={{ color: accentColor, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}

      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUCTOR MATERIAL</Text>
      <View style={styles.toggleRow}>
        {(['copper', 'aluminum'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.toggleBtn,
              { borderColor: colors.border },
              material === m && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => setMaterial(m)}
          >
            <Text style={[styles.toggleText, { color: material === m ? '#fff' : colors.textSecondary }]}>
              {m === 'copper' ? 'Copper' : 'Aluminum'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>MINIMUM SIZE</Text>
        <Text style={[styles.resultValue, { color: accentColor }]}>{result.minimumSize}</Text>
          <LegalDisclaimer />
        <Text style={[styles.resultReference, { color: colors.textSecondary }]}>NEC Reference: {result.necReference}</Text>
        <Text style={[styles.resultDetails, { color: colors.text }]}>{result.details}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  tabRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
    minWidth: 44,
    alignItems: 'center',
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dropdownText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  resultLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  resultValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '900',
    marginBottom: Spacing.sm,
  },
  resultReference: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.sm,
  },
  resultDetails: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
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
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  modalOptionText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  modalCancel: {
    marginVertical: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
});
