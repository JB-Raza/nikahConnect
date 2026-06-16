import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { SettingsScaffold, settingsPalette } from '@/components/settings-kit';
import { radius, spacing, typography } from '@/theme/theme';

const palette = settingsPalette;

export default function BlockedUsersScreen() {
  return (
    <SettingsScaffold title="Blocked users">
      <View style={styles.empty}>
        <View style={styles.icon}>
          <Ionicons name="ban-outline" size={32} color={palette.textSecondary} />
        </View>
        <Text style={styles.title}>You haven’t blocked anyone</Text>
        <Text style={styles.body}>
          When you block someone, they won’t be able to message you or see your profile. They’ll appear here so you can
          unblock them anytime.
        </Text>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xxl,
    gap: spacing.xs,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
});
