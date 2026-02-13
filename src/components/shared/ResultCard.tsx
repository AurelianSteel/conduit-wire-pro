import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSizes, BorderRadius } from '../../theme';

interface ResultRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ResultCardProps {
  title: string;
  rows: ResultRow[];
  status?: 'pass' | 'fail' | 'warning' | 'info';
  statusMessage?: string;
}

const statusColors = {
  pass: '#34C759',
  fail: '#FF453A',
  warning: '#FFD60A',
  info: '#4A9EFF',
};

export function ResultCard({ title, rows, status, statusMessage }: ResultCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {status && (
          <View style={[styles.badge, { backgroundColor: statusColors[status] + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColors[status] }]}>
              {status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {statusMessage && (
        <Text style={[styles.statusMessage, { color: status ? statusColors[status] : colors.textSecondary }]}>
          {statusMessage}
        </Text>
      )}

      {rows.map((row, i) => (
        <View key={i} style={[styles.row, i < rows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
          <Text style={[
            styles.rowValue,
            { color: row.highlight ? colors.primary : colors.text },
          ]}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSizes.lg, fontWeight: '700' },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: { fontSize: FontSizes.xs, fontWeight: '800' },
  statusMessage: { fontSize: FontSizes.sm, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  rowLabel: { fontSize: FontSizes.md },
  rowValue: { fontSize: FontSizes.md, fontWeight: '600' },
});
