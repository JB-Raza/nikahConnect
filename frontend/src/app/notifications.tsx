import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientHeader from '@/components/gradient-header';
import { notifications as seedNotifications, type AppNotification, type NotificationType } from '@/features/notifications/data';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;

const TYPE_META: Record<NotificationType, { icon: React.ComponentProps<typeof Ionicons>['name']; tint: string }> = {
  match: { icon: 'heart', tint: palette.primary },
  message: { icon: 'chatbubble', tint: '#2f80ed' },
  view: { icon: 'eye', tint: '#8e7cc3' },
  like: { icon: 'heart-circle', tint: palette.danger },
  verification: { icon: 'shield-checkmark', tint: palette.success },
  subscription: { icon: 'diamond', tint: palette.warning },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AppNotification[]>(seedNotifications);

  const unreadCount = items.filter((item) => item.unread).length;

  const sections = useMemo(() => {
    const fresh = items.filter((item) => item.unread);
    const earlier = items.filter((item) => !item.unread);
    return [
      { title: 'New', data: fresh },
      { title: 'Earlier', data: earlier },
    ].filter((section) => section.data.length > 0);
  }, [items]);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/marriage');
    }
  };

  const markAllRead = () => setItems((current) => current.map((item) => ({ ...item, unread: false })));

  const handlePress = (item: AppNotification) => {
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, unread: false } : entry)));
    if (item.chatId) {
      router.push(`/chat/${item.chatId}`);
    } else if (item.profileId) {
      router.push(`/profile/${item.profileId}`);
    }
  };

  return (
    <View style={styles.screen}>
      <GradientHeader
        title="Notifications"
        onBack={dismiss}
        right={
          <Pressable onPress={markAllRead} hitSlop={8} disabled={unreadCount === 0} style={styles.markAll}>
            <Text style={[styles.markAllText, unreadCount === 0 && { opacity: 0.45 }]}>Mark all read</Text>
          </Pressable>
        }
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          sections.length === 0
            ? styles.emptyContainer
            : { paddingBottom: insets.bottom + spacing.xxl }
        }
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => <NotificationRow item={item} onPress={() => handlePress(item)} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-outline" size={32} color={palette.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyBody}>Matches, likes, and messages will show up here.</Text>
          </View>
        }
      />
    </View>
  );
}

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const meta = TYPE_META[item.type];
  return (
    <Pressable style={({ pressed }) => [styles.row, item.unread && styles.rowUnread, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={styles.avatarWrap}>
        {item.photo ? (
          <Image source={item.photo} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: `${meta.tint}1a` }]}>
            <Ionicons name={meta.icon} size={22} color={meta.tint} />
          </View>
        )}
        <View style={[styles.typeBadge, { backgroundColor: meta.tint }]}>
          <Ionicons name={meta.icon} size={11} color="#ffffff" />
        </View>
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowBody} numberOfLines={2}>
          {item.body}
        </Text>
      </View>

      <View style={styles.rowMeta}>
        <Text style={styles.rowTime}>{item.time}</Text>
        {item.unread ? <View style={styles.unreadDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  markAll: {
    paddingVertical: spacing.xxs,
  },
  markAllText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionHeader: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rowUnread: {
    backgroundColor: 'rgba(23,114,69,0.05)',
  },
  rowPressed: {
    backgroundColor: palette.chipSurfaceSoft,
  },
  avatarWrap: {
    width: 52,
    height: 52,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.background,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  rowBody: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    lineHeight: 18,
  },
  rowMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  rowTime: {
    fontSize: typography.label,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.xs,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  emptyBody: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
  },
});
