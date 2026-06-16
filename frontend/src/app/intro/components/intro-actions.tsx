import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type IntroActionsProps = {
  isLastSlide: boolean;
  onNext: () => void;
  onGetStarted: () => void;
};

export default function IntroActions({ isLastSlide, onNext, onGetStarted }: IntroActionsProps) {
  if (!isLastSlide) {
    return (
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: pressed ? palette.primaryPressed : palette.primary },
        ]}>
        <Text style={[styles.primaryLabel, { color: palette.textOnPrimary }]}>Next</Text>
        <Ionicons name="arrow-forward" size={18} color={palette.textOnPrimary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onGetStarted}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: pressed ? palette.primaryPressed : palette.primary },
      ]}>
      <Text style={[styles.primaryLabel, { color: palette.textOnPrimary }]}>Get started</Text>
      <Ionicons name="arrow-forward" size={18} color={palette.textOnPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizing.buttonHeight,
    paddingHorizontal: spacing.md,
  },
  primaryLabel: {
    fontSize: typography.button,
    fontWeight: '700',
  },
});
