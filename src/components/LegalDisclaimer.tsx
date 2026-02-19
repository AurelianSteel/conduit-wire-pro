import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSizes, BorderRadius } from './index';

export function LegalDisclaimer() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
      <Text style={[styles.title, { color: colors.warning }]}>
        ⚠️ FOR REFERENCE ONLY
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        This calculator provides reference values based on NEC 2023 formulas. 
        Always verify with a licensed electrician and your local Authority Having 
        Jurisdiction (AHJ). Local codes may have amendments.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  text: {
    fontSize: FontSizes.xs,
    lineHeight: 18,
  },
});
