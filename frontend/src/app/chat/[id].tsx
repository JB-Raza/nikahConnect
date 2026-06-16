import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifiedStar from '@/components/verified-star';
import { getChatById, getChatThread, type ChatMessage } from '@/features/chat/data';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function ChatThreadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/chat');
    }
  };

  const chat = id ? getChatById(id) : undefined;
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => (id ? getChatThread(id) : []));
  const [draft, setDraft] = useState('');

  if (!chat) {
    return (
      <View style={[styles.screen, styles.centered, { backgroundColor: palette.background, paddingTop: insets.top }]}>
        <Text style={styles.missingText}>This conversation is unavailable.</Text>
        <Pressable style={[styles.missingButton, { backgroundColor: palette.primary }]} onPress={dismiss}>
          <Text style={styles.missingButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const canSend = draft.trim().length > 0;

  const handleSend = () => {
    if (!canSend) {
      return;
    }
    const text = draft.trim();
    setMessages((previous) => [
      ...previous,
      { id: `local-${Date.now()}`, sender: 'me', text, time: 'now', kind: 'text' },
    ]);
    setDraft('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={dismiss} hitSlop={10} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={26} color={palette.textPrimary} />
        </Pressable>

        <Pressable style={styles.headerProfile} onPress={() => router.push(`/profile/${chat.id}`)}>
          <View>
            <Image source={chat.photo} style={styles.headerAvatar} resizeMode="cover" />
            {chat.isOnline ? <View style={styles.headerOnlineDot} /> : null}
          </View>
          <View style={styles.headerTitleWrap}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>
                {chat.name}
              </Text>
              {chat.isVerified ? <VerifiedStar size={14} /> : null}
            </View>
            <Text style={styles.headerStatus}>{chat.isOnline ? 'Active now' : 'Active recently'}</Text>
          </View>
        </Pressable>

        <Pressable hitSlop={10} style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={20} color={palette.textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<MatchBanner name={chat.name} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => <MessageBubble message={item} name={chat.name} />}
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.xs }]}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder={`Message ${chat.name}...`}
              placeholderTextColor={palette.textSecondary}
              value={draft}
              onChangeText={setDraft}
              multiline
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={[styles.sendButton, { backgroundColor: canSend ? palette.primary : palette.border }]}>
            <Ionicons name="send" size={18} color={canSend ? '#ffffff' : palette.textSecondary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MatchBanner({ name }: { name: string }) {
  return (
    <View style={styles.matchBanner}>
      <View style={styles.matchIcon}>
        <Ionicons name="heart" size={18} color={palette.primary} />
      </View>
      <Text style={styles.matchTitle}>You connected with {name}</Text>
      <Text style={styles.matchSubtitle}>Say salam and keep it respectful — first impressions matter.</Text>
    </View>
  );
}

function MessageBubble({ message, name }: { message: ChatMessage; name: string }) {
  const isMe = message.sender === 'me';

  if (message.kind === 'compliment') {
    return (
      <View style={[styles.bubbleRow, isMe ? styles.rowEnd : styles.rowStart]}>
        <View style={styles.complimentCard}>
          <View style={styles.complimentHeader}>
            <Ionicons name="sparkles" size={14} color={palette.warning} />
            <Text style={styles.complimentLabel}>{isMe ? `You complimented ${name}` : 'Compliment'}</Text>
          </View>
          <Text style={styles.complimentText}>{message.text}</Text>
          <Text style={styles.complimentTime}>{message.time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRow, isMe ? styles.rowEnd : styles.rowStart]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, { color: isMe ? '#ffffff' : palette.textPrimary }]}>{message.text}</Text>
        <Text style={[styles.bubbleTime, { color: isMe ? 'rgba(255,255,255,0.8)' : palette.textSecondary }]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  missingText: {
    fontSize: typography.body,
    color: palette.textSecondary,
  },
  missingButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  missingButtonText: {
    fontSize: typography.button,
    fontWeight: '700',
    color: palette.textOnPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    backgroundColor: palette.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  headerBack: {
    padding: spacing.xxs,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
  },
  headerOnlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 11,
    height: 11,
    borderRadius: radius.pill,
    backgroundColor: '#46d17f',
    borderWidth: 2,
    borderColor: palette.surface,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  headerName: {
    flexShrink: 1,
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  headerStatus: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  headerAction: {
    padding: spacing.xxs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  matchBanner: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.xxs,
  },
  matchIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  matchTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  matchSubtitle: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  rowStart: {
    justifyContent: 'flex-start',
  },
  rowEnd: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: 2,
  },
  bubbleMe: {
    backgroundColor: palette.primary,
    borderBottomRightRadius: radius.sm,
  },
  bubbleThem: {
    backgroundColor: palette.surface,
    borderBottomLeftRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  bubbleText: {
    fontSize: typography.body,
    fontWeight: '500',
    lineHeight: 20,
  },
  bubbleTime: {
    fontSize: typography.label,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  complimentCard: {
    maxWidth: '82%',
    backgroundColor: palette.chipSurfaceSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  complimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  complimentLabel: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  complimentText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    lineHeight: 20,
  },
  complimentTime: {
    fontSize: typography.label,
    fontWeight: '600',
    color: palette.textSecondary,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: palette.chipSurfaceSoft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.body,
    color: palette.textPrimary,
    maxHeight: 110,
    paddingTop: Platform.OS === 'ios' ? spacing.xs : 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
