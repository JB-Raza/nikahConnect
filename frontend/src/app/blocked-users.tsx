import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsScaffold, settingsPalette } from '@/components/settings-kit';
import { useAlert } from '@/features/alerts/alert-provider';
import { useProfileActions } from '@/features/profile/profile-actions-context';
import { radius, spacing, typography } from '@/theme/theme';

const palette = settingsPalette;

export default function BlockedUsersScreen() {
  const { showAlert, showToast } = useAlert();
  const { blockedUsers, unblockUser } = useProfileActions();

  const confirmUnblock = (name: string, id: string) =>
    showAlert({
      title: 'Unblock user',
      message: `Unblock ${name}? They will be able to see your profile and message you again.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            unblockUser(id);
            showToast({ type: 'success', message: `${name} has been unblocked.` });
          },
        },
      ],
    });

  if (blockedUsers.length === 0) {
    return (
      <SettingsScaffold title="Blocked users">
        <View style={styles.empty}>
          <View style={styles.icon}>
            <Ionicons name="ban-outline" size={32} color={palette.textSecondary} />
          </View>
          <Text style={styles.title}>You haven&apos;t blocked anyone</Text>
          <Text style={styles.body}>
            When you block someone, they won&apos;t be able to message you or see your profile. They&apos;ll appear here so you can
            unblock them anytime.
          </Text>
        </View>
      </SettingsScaffold>
    );
  }

  return (
    <SettingsScaffold title="Blocked users">
      <View style={styles.list}>
        {blockedUsers.map((user) => (
          <View key={user.id} style={styles.row}>
            <Image source={user.photo} style={styles.avatar} resizeMode="cover" />
            <View style={styles.rowText}>
              <Text style={styles.name}>{user.name}</Text>
              {user.city ? <Text style={styles.city}>{user.city}</Text> : null}
            </View>
            <Pressable
              onPress={() => confirmUnblock(user.name, user.id)}
              style={({ pressed }) => [styles.unblockButton, pressed && { opacity: 0.85 }]}>
              <Text style={styles.unblockLabel}>Unblock</Text>
            </Pressable>
          </View>
        ))}
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    padding: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  city: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  unblockButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
  },
  unblockLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.primary,
  },
});
