import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSizes, BorderRadius } from '../../theme';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  keyboardType?: 'numeric' | 'decimal-pad' | 'default';
  error?: string;
  editable?: boolean;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  keyboardType = 'decimal-pad',
  error,
  editable = true,
}: InputFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[
        styles.inputRow,
        { backgroundColor: colors.surfaceElevated, borderColor: error ? colors.error : colors.border },
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          editable={editable}
        />
        {unit && (
          <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: { fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 48,
  },
  input: { flex: 1, fontSize: FontSizes.lg, fontWeight: '500' },
  unit: { fontSize: FontSizes.md, fontWeight: '500', marginLeft: Spacing.sm },
  error: { fontSize: FontSizes.xs, marginTop: Spacing.xs },
});
