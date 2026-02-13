import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useHistory } from '../../src/hooks/useHistory';
import { Spacing, FontSizes, BorderRadius } from '../../src/theme';
import { HistoryEntry } from '../../src/types';

const typeIcons: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  'conduit-fill': { icon: 'albums-outline', color: '#4A9EFF' },
  'box-fill': { icon: 'cube-outline', color: '#FF6B35' },
  'voltage-drop': { icon: 'flash-outline', color: '#34C759' },
};

const typeLabels: Record<string, string> = {
  'conduit-fill': 'Conduit Fill',
  'box-fill': 'Box Fill',
  'voltage-drop': 'Voltage Drop',
};

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { entries, clearHistory } = useHistory();

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    const meta = typeIcons[item.type] || { icon: 'calculator' as const, color: colors.primary };
    return (
      <View style={[styles.item, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: meta.color + '20' }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemType, { color: colors.text }]}>{typeLabels[item.type] || item.type}</Text>
          {item.label && <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>{item.label}</Text>}
          <Text style={[styles.itemTime, { color: colors.textTertiary }]}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No calculations yet.{'\n'}Results will appear here.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
          <TouchableOpacity style={[styles.clearBtn, { borderColor: colors.error }]} onPress={clearHistory}>
            <Text style={{ color: colors.error, fontWeight: '600' }}>Clear History</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  emptyText: { fontSize: FontSizes.md, textAlign: 'center', lineHeight: 22 },
  list: { padding: Spacing.lg },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemType: { fontSize: FontSizes.md, fontWeight: '600' },
  itemLabel: { fontSize: FontSizes.sm, marginTop: 2 },
  itemTime: { fontSize: FontSizes.xs, marginTop: 4 },
  clearBtn: {
    margin: Spacing.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
});
