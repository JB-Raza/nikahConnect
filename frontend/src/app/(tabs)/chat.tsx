import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifiedStar from '@/components/verified-star';
import { chatFilters, filterChats, type ChatFilterId, type ChatItem } from '@/features/chat/data';
import { useChats } from '@/features/chat/chat-context';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function ChatTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { chats, markChatRead } = useChats();
  const [activeFilter, setActiveFilter] = useState<ChatFilterId>('all');

  const visibleChats = useMemo(() => filterChats(chats, activeFilter), [activeFilter, chats]);

  return (
    <View style={[styles.screen, { backgroundColor: palette.background, paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Chats</Text>
      </View>

      <FlatList
        data={chatFilters}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.chipsList}
        contentContainerStyle={styles.chipsContent}
        renderItem={({ item }) => {
          const active = item.id === activeFilter;
          const count = filterChats(chats, item.id).length;
          return (
            <Pressable
              onPress={() => setActiveFilter(item.id)}
              style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
              <Text style={[styles.chipText, { color: active ? palette.textOnPrimary : palette.textPrimary }]}>
                {item.label}
              </Text>
              {count > 0 ? (
                <View style={[styles.chipBadge, active ? styles.chipBadgeActive : styles.chipBadgeInactive]}>
                  <Text style={[styles.chipBadgeText, { color: active ? palette.textOnPrimary : palette.textSecondary }]}>
                    {count}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />

      {visibleChats.length > 0 ? (
        <FlatList
          data={visibleChats}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <ChatRow
              chat={item}
              onPress={() => {
                markChatRead(item.id);
                router.push(`/chat/${item.id}`);
              }}
            />
          )}
        />
      ) : (
        <EmptyChats filter={activeFilter} />
      )}
    </View>
  );
}

function ChatRow({ chat, onPress }: { chat: ChatItem; onPress: () => void }) {
  const isCompliment = chat.kind === 'complimentReceived' || chat.kind === 'complimentSent';
  const isUnread = chat.unreadCount > 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.avatarWrap}>
        <Image source={chat.photo} style={styles.avatar} resizeMode="cover" />
        {chat.isOnline ? <View style={styles.onlineDot} /> : null}
      </View>

      <View style={styles.rowBody}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {chat.name}
          </Text>
          {chat.isVerified ? <VerifiedStar size={14} /> : null}
        </View>

        <View style={styles.previewRow}>
          {isCompliment ? (
            <Ionicons
              name="sparkles"
              size={13}
              color={palette.warning}
              style={styles.previewIcon}
            />
          ) : null}
          <Text
            style={[
              styles.previewText,
              isCompliment && { color: palette.warning, fontWeight: '700' },
              isUnread && !isCompliment && { color: palette.textPrimary, fontWeight: '700' },
            ]}
            numberOfLines={1}>
            {chat.preview}
          </Text>
        </View>
      </View>

      <View style={styles.rowMeta}>
        <Text style={[styles.timestamp, isUnread && { color: palette.primary, fontWeight: '700' }]}>
          {chat.timestamp}
        </Text>
        {isUnread ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function EmptyChats({ filter }: { filter: ChatFilterId }) {
  const copy: Record<ChatFilterId, { title: string; body: string }> = {
    all: { title: 'No chats yet', body: 'When you message someone or get complimented, your conversations show up here.' },
    unread: { title: 'You\u2019re all caught up', body: 'You have no unread messages right now.' },
    compliments: { title: 'No compliments yet', body: 'Compliments you send or receive will appear here.' },
    online: { title: 'No one online', body: 'None of your chats are active right now. Check back soon.' },
  };
  const { title, body } = copy[filter];

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="chatbubbles-outline" size={30} color={palette.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.title,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  chipsList: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipInactive: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
  },
  chipText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  chipBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipBadgeInactive: {
    backgroundColor: palette.chipSurfaceSoft,
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border,
    marginLeft: spacing.lg + 56 + spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rowPressed: {
    backgroundColor: palette.chipSurfaceSoft,
  },
  avatarWrap: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: '#46d17f',
    borderWidth: 2,
    borderColor: palette.background,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  nameText: {
    flexShrink: 1,
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  previewIcon: {
    marginRight: 2,
  },
  previewText: {
    flexShrink: 1,
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  rowMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    minWidth: 48,
  },
  timestamp: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  emptyBody: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: spacing.xl,
  },
});
