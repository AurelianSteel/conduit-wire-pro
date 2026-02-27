import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSizes, BorderRadius } from '../theme';
import { ShareData } from '../services/shareService';

interface ShareButtonProps {
  data: ShareData;
  onPress: () => void;
  accentColor?: string;
}

export function ShareButton({ data, onPress, accentColor }: ShareButtonProps) {
  const { colors } = useTheme();
  const buttonColor = accentColor || colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: buttonColor },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { color: buttonColor }]}>↗</Text>
        <Text style={[styles.text, { color: buttonColor }]}>
          Share Results
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: FontSizes.md,
    marginRight: Spacing.sm,
    fontWeight: '600',
  },
  text: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
