import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, FontSizes, BorderRadius } from '../theme';
import { ShareData, copyToClipboard, shareToEmail, shareToSMS, sharePDF } from '../services/shareService';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  data: ShareData;
  accentColor?: string;
}

interface ShareOptionProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  color: string;
}

function ShareOption({ icon, label, sublabel, onPress, color }: ShareOptionProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.option, { backgroundColor: colors.surfaceElevated }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.optionIconContainer, { backgroundColor: color + '20' }]}>
        <Text style={[styles.optionIcon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
        {sublabel && (
          <Text style={[styles.optionSublabel, { color: colors.textTertiary }]}>{sublabel}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function ShareSheet({ visible, onClose, data, accentColor }: ShareSheetProps) {
  const { colors } = useTheme();
  const primaryColor = accentColor || colors.primary;

  const handleCopy = async () => {
    try {
      await copyToClipboard(data);
      onClose();
      // Could show toast here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleEmail = () => {
    shareToEmail(data);
    onClose();
  };

  const handlePDF = async () => {
    try {
      await sharePDF(data);
      onClose();
    } catch (error) {
      console.error('Failed to share PDF:', error);
    }
  };

  const handleSMS = () => {
    shareToSMS(data);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.title, { color: colors.text }]}>
            Share Calculation
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {data.calculatorTitle}
          </Text>

          <View style={styles.optionsGrid}>
            <ShareOption
              icon="📋"
              label="Copy"
              sublabel="Copy to clipboard"
              onPress={handleCopy}
              color="#4A9EFF"
            />
            
            <ShareOption
              icon="📧"
              label="Email"
              sublabel="Send via email"
              onPress={handleEmail}
              color="#FF6B35"
            />
            
            <ShareOption
              icon="📄"
              label="PDF"
              sublabel="Export as PDF"
              onPress={handlePDF}
              color="#34C759"
            />
            
            <ShareOption
              icon="💬"
              label="SMS"
              sublabel="Send as message"
              onPress={handleSMS}
              color="#FFD60A"
            />
          </View>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.surfaceElevated }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  option: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionTextContainer: {
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSublabel: {
    fontSize: FontSizes.xs,
  },
  cancelButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
