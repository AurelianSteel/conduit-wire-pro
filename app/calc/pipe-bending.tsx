import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import {
  calculateOffset,
  calculateSaddle,
  calculateNinety,
  calculateRollingOffset,
  formatMeasurement,
  recommendAngle,
  getOffsetQuickReference,
} from '../../src/services/pipeBendingService';
import {
  BendAngle,
  ConduitSize,
  OFFSET_MULTIPLIERS,
  TAKE_UP_VALUES,
} from '../../src/types/pipeBending';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import { LegalDisclaimer } from '../../src/components/LegalDisclaimer';

type CalcMode = 'offset' | 'saddle' | 'ninety' | 'rolling';

export default function PipeBendingScreen() {
  const { colors } = useTheme();
  const accentColor = '#f59e0b'; // Amber/orange for pipe bending

  const [calcMode, setCalcMode] = useState<CalcMode>('offset');
  const [conduitSize, setConduitSize] = useState<ConduitSize>('3/4');

  // Offset state
  const [obstructionHeight, setObstructionHeight] = useState<string>('6');
  const [offsetAngle, setOffsetAngle] = useState<BendAngle>(30);
  const [advanceDistance, setAdvanceDistance] = useState<string>('0');

  // Saddle state
  const [obstructionWidth, setObstructionWidth] = useState<string>('6');
  const [saddleType, setSaddleType] = useState<'3pt' | '4pt'>('3pt');
  const [saddleAngle, setSaddleAngle] = useState<BendAngle>(30);
  const [saddleCenter, setSaddleCenter] = useState<string>('0');

  // 90-degree state
  const [legLength, setLegLength] = useState<string>('24');

  // Rolling offset state
  const [verticalOffset, setVerticalOffset] = useState<string>('6');
  const [horizontalOffset, setHorizontalOffset] = useState<string>('8');
  const [rollingAngle, setRollingAngle] = useState<BendAngle>(30);

  // Quick reference
  const [showQuickRef, setShowQuickRef] = useState(false);

  const result = useMemo(() => {
    try {
      switch (calcMode) {
        case 'offset': {
          const height = parseFloat(obstructionHeight);
          const advance = parseFloat(advanceDistance) || 0;
          if (isNaN(height) || height <= 0) return null;
          return {
            type: 'offset' as const,
            data: calculateOffset({
              obstructionHeight: height,
              angle: offsetAngle,
              conduitSize,
              advanceDistance: advance,
            }),
          };
        }
        case 'saddle': {
          const width = parseFloat(obstructionWidth);
          const center = parseFloat(saddleCenter) || 0;
          if (isNaN(width) || width <= 0) return null;
          return {
            type: 'saddle' as const,
            data: calculateSaddle({
              obstructionWidth: width,
              angle: saddleAngle,
              conduitSize,
              saddleType,
              offsetCenter: center,
            }),
          };
        }
        case 'ninety': {
          const leg = parseFloat(legLength);
          if (isNaN(leg) || leg <= 0) return null;
          return {
            type: 'ninety' as const,
            data: calculateNinety({
              conduitSize,
              legLength: leg,
            }),
          };
        }
        case 'rolling': {
          const vert = parseFloat(verticalOffset);
          const horiz = parseFloat(horizontalOffset);
          if (isNaN(vert) || vert <= 0 || isNaN(horiz) || horiz <= 0) return null;
          return {
            type: 'rolling' as const,
            data: calculateRollingOffset({
              verticalOffset: vert,
              horizontalOffset: horiz,
              angle: rollingAngle,
              conduitSize,
            }),
          };
        }
      }
    } catch (error) {
      return { type: calcMode, error: error instanceof Error ? error.message : 'Calculation error' };
    }
  }, [
    calcMode, conduitSize,
    obstructionHeight, offsetAngle, advanceDistance,
    obstructionWidth, saddleType, saddleAngle, saddleCenter,
    legLength,
    verticalOffset, horizontalOffset, rollingAngle,
  ]);

  const quickRef = useMemo(() => {
    return getOffsetQuickReference(offsetAngle);
  }, [offsetAngle]);

  const conduitSizes: ConduitSize[] = ['1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '2-1/2', '3', '4'];
  const angleOptions: BendAngle[] = [10, 22.5, 30, 45, 60];

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      {[
        { key: 'offset', label: 'Offset', icon: '↗️' },
        { key: 'saddle', label: 'Saddle', icon: '⋂' },
        { key: 'ninety', label: '90°', icon: '∟' },
        { key: 'rolling', label: 'Rolling', icon: '↗' },
      ].map((mode) => (
        <TouchableOpacity
          key={mode.key}
          style={[
            styles.modeButton,
            { borderColor: colors.border },
            calcMode === mode.key && { backgroundColor: accentColor, borderColor: accentColor },
          ]}
          onPress={() => setCalcMode(mode.key as CalcMode)}
        >
          <Text style={[styles.modeIcon, { color: calcMode === mode.key ? '#fff' : colors.textSecondary }]}>
            {mode.icon}
          </Text>
          <Text style={[styles.modeLabel, { color: calcMode === mode.key ? '#fff' : colors.textSecondary }]}>
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderConduitSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>CONDUIT SIZE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.conduitRow}>
          {conduitSizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.conduitButton,
                { borderColor: colors.border },
                conduitSize === size && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
              onPress={() => setConduitSize(size)}
            >
              <Text style={[styles.conduitText, { color: conduitSize === size ? '#fff' : colors.textSecondary }]}>
                {size}"
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderInputs = () => {
    switch (calcMode) {
      case 'offset':
        return (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>OBSTRUCTION HEIGHT (inches)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              keyboardType="decimal-pad"
              value={obstructionHeight}
              onChangeText={setObstructionHeight}
              placeholder="e.g., 6"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>BEND ANGLE</Text>
            <View style={styles.angleRow}>
              {angleOptions.map((angle) => (
                <TouchableOpacity
                  key={angle}
                  style={[
                    styles.angleButton,
                    { borderColor: colors.border },
                    offsetAngle === angle && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                  onPress={() => setOffsetAngle(angle)}
                >
                  <Text style={[styles.angleText, { color: offsetAngle === angle ? '#fff' : colors.textSecondary }]}>
                    {angle}°
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>ADVANCE DISTANCE (inches, optional)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              keyboardType="decimal-pad"
              value={advanceDistance}
              onChangeText={setAdvanceDistance}
              placeholder="Distance to first bend"
              placeholderTextColor={colors.textTertiary}
            />

            <TouchableOpacity style={styles.quickRefToggle} onPress={() => setShowQuickRef(!showQuickRef)}>
              <Text style={[styles.quickRefText, { color: accentColor }]}>
                {showQuickRef ? '▼ Hide Quick Reference' : '▶ Show Quick Reference'}
              </Text>
            </TouchableOpacity>

            {showQuickRef && (
              <View style={[styles.quickRefCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.quickRefTitle, { color: colors.textSecondary }]}>
                  OFFSET MULTIPLIER: {OFFSET_MULTIPLIERS[offsetAngle]}×
                </Text>
                {quickRef.map((ref) => (
                  <View key={ref.offset} style={styles.quickRefRow}>
                    <Text style={[styles.quickRefLabel, { color: colors.text }]}>{ref.offset}" offset:</Text>
                    <Text style={[styles.quickRefValue, { color: accentColor }]}>{ref.spacing}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        );

      case 'saddle':
        return (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>SADDLE TYPE</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { borderColor: colors.border },
                  saddleType === '3pt' && { backgroundColor: accentColor, borderColor: accentColor },
                ]}
                onPress={() => setSaddleType('3pt')}
              >
                <Text style={[styles.toggleText, { color: saddleType === '3pt' ? '#fff' : colors.textSecondary }]}>
                  3-Point
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { borderColor: colors.border },
                  saddleType === '4pt' && { backgroundColor: accentColor, borderColor: accentColor },
                ]}
                onPress={() => setSaddleType('4pt')}
              >
                <Text style={[styles.toggleText, { color: saddleType === '4pt' ? '#fff' : colors.textSecondary }]}>
                  4-Point
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>OBSTRUCTION WIDTH (inches)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              keyboardType="decimal-pad"
              value={obstructionWidth}
              onChangeText={setObstructionWidth}
              placeholder="e.g., 6"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>BEND ANGLE</Text>
            <View style={styles.angleRow}>
              {angleOptions.slice(0, 4).map((angle) => (
                <TouchableOpacity
                  key={angle}
                  style={[
                    styles.angleButton,
                    { borderColor: colors.border },
                    saddleAngle === angle && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                  onPress={() => setSaddleAngle(angle)}
                >
                  <Text style={[styles.angleText, { color: saddleAngle === angle ? '#fff' : colors.textSecondary }]}>
                    {angle}°
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>CENTER POINT (inches, optional)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              keyboardType="decimal-pad"
              value={saddleCenter}
              onChangeText={setSaddleCenter}
              placeholder="Distance to center of obstruction"
              placeholderTextColor={colors.textTertiary}
            />
          </>
        );

      case 'ninety':
        return (
          <>
            <View style={[styles.infoCard, { backgroundColor: accentColor + '15', borderColor: accentColor }]}
            >
              <Text style={[styles.infoTitle, { color: accentColor }]}>Take-Up Reference</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {conduitSize}" conduit: {TAKE_UP_VALUES[conduitSize]}" take-up
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>LEG LENGTH (inches)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              keyboardType="decimal-pad"
              value={legLength}
              onChangeText={setLegLength}
              placeholder="e.g., 24"
              placeholderTextColor={colors.textTertiary}
            />
          </>
        );

      case 'rolling':
        return (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>VERTICAL OFFSET (inches)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              keyboardType="decimal-pad"
              value={verticalOffset}
              onChangeText={setVerticalOffset}
              placeholder="Rise"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>HORIZONTAL OFFSET (inches)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              keyboardType="decimal-pad"
              value={horizontalOffset}
              onChangeText={setHorizontalOffset}
              placeholder="Run"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>BEND ANGLE</Text>
            <View style={styles.angleRow}>
              {angleOptions.slice(1).map((angle) => (
                <TouchableOpacity
                  key={angle}
                  style={[
                    styles.angleButton,
                    { borderColor: colors.border },
                    rollingAngle === angle && { backgroundColor: accentColor, borderColor: accentColor },
                  ]}
                  onPress={() => setRollingAngle(angle)}
                >
                  <Text style={[styles.angleText, { color: rollingAngle === angle ? '#fff' : colors.textSecondary }]}>
                    {angle}°
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
    }
  };

  const renderResults = () => {
    if (!result) return null;
    if ('error' in result) {
      return (
        <View style={[styles.errorCard, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{result.error}</Text>
        </View>
      );
    }

    switch (result.type) {
      case 'offset': {
        const data = result.data;
        return (
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: accentColor }]}>
            <Text style={[styles.resultTitle, { color: accentColor }]}>OFFSET BEND</Text>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Multiplier:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{data.multiplier}×</Text>
            </View>

            <View style={styles.resultHighlight}>
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>DISTANCE BETWEEN BENDS</Text>
              <Text style={[styles.highlightValue, { color: accentColor }]}>
                {formatMeasurement(data.distanceBetweenBends)}
              </Text>
            </View>

            {data.bendMarks.firstBend > 0 && (
              <>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>First Bend Mark:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {formatMeasurement(data.bendMarks.firstBend)}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Second Bend Mark:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {formatMeasurement(data.bendMarks.secondBend)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Shrinkage:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatMeasurement(data.shrinkage)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Gain:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatMeasurement(data.gain)}</Text>
            </View>

            {data.notes.length > 0 && (
              <View style={styles.notesContainer}>
                {data.notes.map((note, idx) => (
                  <Text key={idx} style={[styles.noteText, { color: colors.textSecondary }]}>{note}</Text>
                ))}
              </View>
            )}

            <LegalDisclaimer />
          </View>
        );
      }

      case 'saddle': {
        const data = result.data;
        return (
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: accentColor }]}>
            <Text style={[styles.resultTitle, { color: accentColor }]}>{data.saddleType === '3pt' ? '3-POINT' : '4-POINT'} SADDLE</Text>

            <View style={styles.resultHighlight}>
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>BEND MARKS</Text>
              {data.marks.map((mark, idx) => (
                <Text key={idx} style={[styles.markText, { color: colors.text }]}>
                  {idx + 1}. {formatMeasurement(mark)}
                </Text>
              ))}
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Shrinkage:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatMeasurement(data.shrinkage)}</Text>
            </View>

            {data.notes.length > 0 && (
              <View style={styles.notesContainer}>
                {data.notes.map((note, idx) => (
                  <Text key={idx} style={[styles.noteText, { color: colors.textSecondary }]}>{note}</Text>
                ))}
              </View>
            )}

            <LegalDisclaimer />
          </View>
        );
      }

      case 'ninety': {
        const data = result.data;
        return (
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: accentColor }]}>
            <Text style={[styles.resultTitle, { color: accentColor }]}>90° BEND</Text>

            <View style={styles.resultHighlight}>
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>CUT LENGTH</Text>
              <Text style={[styles.highlightValue, { color: accentColor }]}>
                {formatMeasurement(data.cutLength)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Take-Up:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatMeasurement(data.takeUp)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Bend Mark (from end):</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatMeasurement(data.bendMark)}</Text>
            </View>

            {data.notes.length > 0 && (
              <View style={styles.notesContainer}>
                {data.notes.map((note, idx) => (
                  <Text key={idx} style={[styles.noteText, { color: colors.textSecondary }]}>{note}</Text>
                ))}
              </View>
            )}

            <LegalDisclaimer />
          </View>
        );
      }

      case 'rolling': {
        const data = result.data;
        return (
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: accentColor }]}>
            <Text style={[styles.resultTitle, { color: accentColor }]}>ROLLING OFFSET</Text>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>True Offset:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>
                {formatMeasurement(data.rollingOffset)}
              </Text>
            </View>

            <View style={styles.resultHighlight}>
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>DISTANCE BETWEEN BENDS</Text>
              <Text style={[styles.highlightValue, { color: accentColor }]}>
                {formatMeasurement(data.distanceBetweenBends)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Travel Length:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>
                {formatMeasurement(data.travelLength)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Shrinkage:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{formatMeasurement(data.shrinkage)}</Text>
            </View>

            {data.notes.length > 0 && (
              <View style={styles.notesContainer}>
                {data.notes.map((note, idx) => (
                  <Text key={idx} style={[styles.noteText, { color: colors.textSecondary }]}>{note}</Text>
                ))}
              </View>
            )}

            <LegalDisclaimer />
          </View>
        );
      }
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
      bounces={true}
    >
      {renderModeSelector()}
      {renderConduitSelector()}

      <View style={styles.inputsContainer}>
        {renderInputs()}
      </View>

      {renderResults()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  modeLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  conduitRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  conduitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  conduitText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  inputsContainer: {
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FontSizes.md,
    marginBottom: Spacing.md,
  },
  angleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  angleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  angleText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: FontSizes.sm,
  },
  quickRefToggle: {
    marginVertical: Spacing.sm,
  },
  quickRefText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  quickRefCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickRefTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  quickRefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  quickRefLabel: {
    fontSize: FontSizes.sm,
  },
  quickRefValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  resultTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  resultLabel: {
    fontSize: FontSizes.md,
  },
  resultValue: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  resultHighlight: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.md,
  },
  highlightLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  highlightValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
  },
  markText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginTop: 4,
  },
  notesContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  noteText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  errorCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
});
