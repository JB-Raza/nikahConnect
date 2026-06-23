import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientHeader from '@/components/gradient-header';
import VerifiedStar from '@/components/verified-star';
import { chatFilters, filterChats, newMatches, type ChatFilterId, type ChatItem, type NewMatch } from '@/features/chat/data';
import { useChats } from '@/features/chat/chat-context';
import { colors, radius, shadow, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function ChatTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { chats, markChatRead } = useChats();
  const [activeFilter, setActiveFilter] = useState<ChatFilterId>('all');
  const [query, setQuery] = useState('');

  const visibleChats = useMemo(() => {
    const base = filterChats(chats, activeFilter);
    const q = query.trim().toLowerCase();
    return q ? base.filter((chat) => chat.name.toLowerCase().includes(q)) : base;
  }, [activeFilter, chats, query]);

  const showRail = activeFilter === 'all' && query.trim().length === 0;

  return (
    <View style={styles.screen}>
      <GradientHeader title="Chats">
        <View style={styles.search}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.8)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search chats"
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.8)" />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsContent}>
          {chatFilters.map((item) => {
            const active = item.id === activeFilter;
            const count = filterChats(chats, item.id).length;
            return (
              <Pressable
                key={item.id}
                onPress={() => setActiveFilter(item.id)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
                <Text style={[styles.chipText, { color: active ? palette.primary : '#ffffff' }]}>{item.label}</Text>
                {count > 0 ? (
                  <View style={[styles.chipBadge, active ? styles.chipBadgeActive : styles.chipBadgeInactive]}>
                    <Text style={[styles.chipBadgeText, { color: active ? palette.primary : '#ffffff' }]}>{count}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </GradientHeader>

      {visibleChats.length > 0 ? (
        <FlatList
          data={visibleChats}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
          ListHeaderComponent={
            showRail ? <NewMatchesRail data={newMatches} onPress={(id) => router.push(`/profile/${id}`)} /> : null
          }
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
        <EmptyChats filter={activeFilter} searching={query.trim().length > 0} />
      )}
    </View>
  );
}

function NewMatchesRail({ data, onPress }: { data: NewMatch[]; onPress: (id: string) => void }) {
  if (data.length === 0) {
    return null;
  }
  return (
    <View>
      <Text style={styles.railTitle}>New matches</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        renderItem={({ item }) => (
          <Pressable style={styles.railItem} onPress={() => onPress(item.id)}>
            <View style={styles.railRing}>
              <Image source={item.photo} style={styles.railAvatar} resizeMode="cover" />
              {item.isOnline ? <View style={styles.railOnlineDot} /> : null}
            </View>
            <Text style={styles.railName} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
      <Text style={styles.messagesLabel}>Messages</Text>
    </View>
  );
}

function ChatRow({ chat, onPress }: { chat: ChatItem; onPress: () => void }) {
  const isCompliment = chat.kind === 'complimentReceived' || chat.kind === 'complimentSent';
  const isUnread = chat.unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.avatarWrap}>
        <View style={[styles.avatarRing, chat.isOnline && styles.avatarRingOnline]}>
          <Image source={chat.photo} style={styles.avatar} resizeMode="cover" />
        </View>
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
            <Ionicons name="sparkles" size={13} color={palette.warning} style={styles.previewIcon} />
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

function EmptyChats({ filter, searching }: { filter: ChatFilterId; searching: boolean }) {
  if (searching) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="search-outline" size={30} color={palette.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>No matches found</Text>
        <Text style={styles.emptyBody}>Try a different name to find your conversation.</Text>
      </View>
    );
  }

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

const AVATAR = 56;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '500',
    color: '#ffffff',
    padding: 0,
  },
  chipsRow: {
    flexGrow: 0,
    marginTop: spacing.sm,
    marginHorizontal: -spacing.lg,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  chipInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.45)',
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
    backgroundColor: 'rgba(36,134,224,0.15)',
  },
  chipBadgeInactive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  railTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  railContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  railItem: {
    alignItems: 'center',
    width: 64,
    gap: spacing.xxs,
  },
  railRing: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.primary,
    padding: 2,
  },
  railAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
  },
  railOnlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: '#46d17f',
    borderWidth: 2,
    borderColor: palette.background,
  },
  railName: {
    fontSize: typography.label,
    fontWeight: '600',
    color: palette.textPrimary,
    maxWidth: 64,
  },
  messagesLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border,
    marginLeft: spacing.lg + AVATAR + spacing.md,
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
    width: AVATAR,
    height: AVATAR,
  },
  avatarRing: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.border,
    padding: 1.5,
  },
  avatarRingOnline: {
    borderColor: palette.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
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
    ...shadow.sm,
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
