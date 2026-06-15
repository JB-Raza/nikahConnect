import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

export default function AuthEntryScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>Choose sign in method</Text>
      <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
        Continue with your preferred account to start profile setup.
      </Text>

      <Pressable
        onPress={() => router.replace('/(tabs)/marriage')}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: pressed ? palette.primaryPressed : palette.primary },
        ]}>
        <Text style={[styles.primaryLabel, { color: palette.textOnPrimary }]}>Continue with Google</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace('/(tabs)/marriage')}
        style={({ pressed }) => [
          styles.secondaryButton,
          { borderColor: palette.border, backgroundColor: palette.surface, opacity: pressed ? 0.75 : 1 },
        ]}>
        <Text style={[styles.secondaryLabel, { color: palette.textPrimary }]}>Continue with Email</Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backText, { color: palette.textSecondary }]}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.title,
    lineHeight: 38,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  primaryButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primaryLabel: {
    fontSize: typography.button,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryLabel: {
    fontSize: typography.button,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  backText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
});
