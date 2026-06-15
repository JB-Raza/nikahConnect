import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type IntroActionsProps = {
  isLastSlide: boolean;
  onNext: () => void;
  onContinueGoogle: () => void;
  onContinueEmail: () => void;
};

export function IntroActions({ isLastSlide, onNext, onContinueGoogle, onContinueEmail }: IntroActionsProps) {
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
    <View style={styles.ctaWrap}>
      <Pressable
        onPress={onContinueGoogle}
        style={({ pressed }) => [styles.googleButton, { opacity: pressed ? 0.9 : 1 }]}>
        <Ionicons name="logo-google" size={18} color={palette.textPrimary} />
        <Text style={[styles.googleLabel, { color: palette.textPrimary }]}>Continue with Google</Text>
      </Pressable>

      <Pressable
        onPress={onContinueEmail}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: pressed ? palette.primaryPressed : palette.primary },
        ]}>
        <Ionicons name="mail-outline" size={18} color={palette.textOnPrimary} />
        <Text style={[styles.primaryLabel, { color: palette.textOnPrimary }]}>Continue with Email</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaWrap: {
    gap: spacing.sm,
  },
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
  googleButton: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizing.buttonHeight,
    paddingHorizontal: spacing.md,
    backgroundColor: '#ffffff',
  },
  googleLabel: {
    fontSize: typography.button,
    fontWeight: '700',
  },
});
