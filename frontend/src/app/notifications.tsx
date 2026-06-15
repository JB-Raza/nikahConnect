import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/theme';

export default function NotificationsScreen() {
  const palette = colors.light;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>Notifications</Text>
      <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
        Notifications UI stub for now. Backend integration will be added later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.titleMd,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: typography.body,
    textAlign: 'center',
  },
});
