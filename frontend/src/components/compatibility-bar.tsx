import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, gradients, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;

function tier(score: number): string {
  if (score >= 85) return 'Strong match';
  if (score >= 70) return 'Great match';
  if (score >= 50) return 'Good match';
  return 'Some things in common';
}

export default function CompatibilityBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
          <Ionicons name="sparkles" size={14} color={palette.textOnPrimary} />
          <Text style={styles.badgeText}>{clamped}%</Text>
        </LinearGradient>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{tier(clamped)}</Text>
          <Text style={styles.subtitle}>Based on shared values, goals & interests</Text>
        </View>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${clamped}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.textOnPrimary,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  subtitle: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    marginTop: 1,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
});
