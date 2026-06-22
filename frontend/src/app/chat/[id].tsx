import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconCircleButton from '@/components/icon-circle-button';
import VerifiedStar from '@/components/verified-star';
import { useAlert } from '@/features/alerts/alert-provider';
import { useChats } from '@/features/chat/chat-context';
import { getChatThread, type ChatMessage } from '@/features/chat/data';
import { useProfileActions } from '@/features/profile/profile-actions-context';
import { getProfileById } from '@/features/profiles/data';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function ChatThreadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert, showToast } = useAlert();
  const { blockUser } = useProfileActions();
  const { chats, markChatRead } = useChats();
  const { id } = useLocalSearchParams<{ id: string }>();

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/chat');
    }
  };

  const chat = id ? chats.find((item) => item.id === id) : undefined;
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => (id ? getChatThread(id) : []));
  const [draft, setDraft] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) {
      markChatRead(id);
    }
  }, [id, markChatRead]);

  useEffect(
    () => () => {
      if (recordTimer.current) {
        clearInterval(recordTimer.current);
      }
    },
    [],
  );

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
    setShowEmojis(false);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const startCall = (mode: 'voice' | 'video') =>
    router.push({ pathname: '/call', params: { id: chat.id, name: chat.name, mode } });

  const insertEmoji = (emoji: string) => setDraft((previous) => previous + emoji);

  const stopRecordTimer = () => {
    if (recordTimer.current) {
      clearInterval(recordTimer.current);
      recordTimer.current = null;
    }
  };

  const startRecording = () => {
    setShowEmojis(false);
    setRecordSeconds(0);
    setRecording(true);
    recordTimer.current = setInterval(() => setRecordSeconds((value) => value + 1), 1000);
  };

  const cancelRecording = () => {
    stopRecordTimer();
    setRecording(false);
    setRecordSeconds(0);
  };

  const sendVoice = () => {
    stopRecordTimer();
    const durationSec = Math.max(1, recordSeconds);
    setMessages((previous) => [
      ...previous,
      { id: `local-${Date.now()}`, sender: 'me', text: '', time: 'now', kind: 'voice', durationSec },
    ]);
    setRecording(false);
    setRecordSeconds(0);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const toggleVoicePlayback = (messageId: string) =>
    setPlayingVoiceId((current) => (current === messageId ? null : messageId));

  const confirmBlock = () =>
    showAlert({
      type: 'warning',
      title: 'Block user',
      message: `Block ${chat.name}? They won't be able to see your profile or message you.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            blockUser(getProfileById(chat.id));
            showToast({ type: 'info', message: `${chat.name} has been blocked.` });
            dismiss();
          },
        },
      ],
    });

  const openMenu = () =>
    showAlert({
      title: chat.name,
      message: 'What would you like to do?',
      buttons: [
        { text: 'View profile', onPress: () => router.push(`/profile/${chat.id}`) },
        { text: 'Block user', style: 'destructive', onPress: confirmBlock },
        { text: 'Report user', onPress: () => router.push({ pathname: '/report', params: { name: chat.name } }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <IconCircleButton icon="chevron-back" onPress={dismiss} accessibilityLabel="Go back" variant="onLight" size={40} iconSize={24} />

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

        <View style={styles.headerActions}>
          <IconCircleButton icon="call" onPress={() => startCall('voice')} accessibilityLabel="Voice call" variant="onLight" size={40} iconSize={20} />
          <IconCircleButton icon="videocam" onPress={() => startCall('video')} accessibilityLabel="Video call" variant="onLight" size={40} iconSize={20} />
          <IconCircleButton icon="ellipsis-vertical" onPress={openMenu} accessibilityLabel="Chat options" variant="onLight" size={40} iconSize={20} />
        </View>
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
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              name={chat.name}
              isPlaying={playingVoiceId === item.id}
              onToggleVoice={() => toggleVoicePlayback(item.id)}
            />
          )}
        />

        {showEmojis && !recording ? <EmojiPanel onSelect={insertEmoji} /> : null}

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.xs }]}>
          {recording ? (
            <View style={styles.recordingBar}>
              <Pressable onPress={cancelRecording} hitSlop={8} style={styles.recordCancel} accessibilityLabel="Cancel recording">
                <Ionicons name="trash-outline" size={22} color={palette.danger} />
              </Pressable>
              <View style={styles.recordingMeta}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>{formatDuration(recordSeconds)}</Text>
                <Text style={styles.recordingHint}>Recording voice message…</Text>
              </View>
              <Pressable onPress={sendVoice} style={[styles.sendButton, { backgroundColor: palette.primary }]} accessibilityLabel="Send voice message">
                <Ionicons name="send" size={18} color="#ffffff" />
              </Pressable>
            </View>
          ) : (
            <>
              <Pressable onPress={() => setShowEmojis((value) => !value)} hitSlop={8} style={styles.emojiToggle} accessibilityLabel="Emoji">
                <Ionicons name={showEmojis ? 'close-circle-outline' : 'happy-outline'} size={26} color={palette.textSecondary} />
              </Pressable>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder={`Message ${chat.name}...`}
                  placeholderTextColor={palette.textSecondary}
                  value={draft}
                  onChangeText={setDraft}
                  onFocus={() => setShowEmojis(false)}
                  multiline
                />
              </View>
              {canSend ? (
                <Pressable onPress={handleSend} style={[styles.sendButton, { backgroundColor: palette.primary }]} accessibilityLabel="Send">
                  <Ionicons name="send" size={18} color="#ffffff" />
                </Pressable>
              ) : (
                <Pressable onPress={startRecording} style={[styles.sendButton, styles.micButton]} accessibilityLabel="Record voice message">
                  <Ionicons name="mic" size={20} color={palette.primary} />
                </Pressable>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const EMOJIS = [
  '😊', '😀', '😅', '🙂', '😍', '🥰', '😎', '🤝', '👍', '🙏', '❤️', '💐',
  '🌸', '✨', '🎉', '☕', '📚', '🕌', '🌙', '⭐', '😄', '😇', '🤲', '💬',
  '🌹', '🏡', '🍽️', '✈️', '😂', '🤍', '🌷', '🫶',
];

const VOICE_WAVE = [8, 14, 20, 12, 18, 10, 22, 14, 9, 16, 12, 20, 10, 15, 8, 18, 11];

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function EmojiPanel({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <View style={styles.emojiPanel}>
      <ScrollView contentContainerStyle={styles.emojiGrid} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {EMOJIS.map((emoji) => (
          <Pressable key={emoji} style={styles.emojiCell} onPress={() => onSelect(emoji)}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </Pressable>
        ))}
      </ScrollView>
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

function MessageBubble({
  message,
  name,
  isPlaying,
  onToggleVoice,
}: {
  message: ChatMessage;
  name: string;
  isPlaying: boolean;
  onToggleVoice: () => void;
}) {
  const isMe = message.sender === 'me';

  if (message.kind === 'voice') {
    return (
      <View style={[styles.bubbleRow, isMe ? styles.rowEnd : styles.rowStart]}>
        <View style={[styles.voiceBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Pressable
            onPress={onToggleVoice}
            style={[styles.voicePlay, { backgroundColor: isMe ? 'rgba(255,255,255,0.22)' : palette.chipSurfaceSoft }]}
            accessibilityLabel={isPlaying ? 'Pause voice message' : 'Play voice message'}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color={isMe ? '#ffffff' : palette.primary} />
          </Pressable>
          <View style={styles.waveform}>
            {VOICE_WAVE.map((height, index) => (
              <View
                key={index}
                style={[styles.waveBar, { height, backgroundColor: isMe ? 'rgba(255,255,255,0.7)' : palette.dot }]}
              />
            ))}
          </View>
          <Text style={[styles.voiceDuration, { color: isMe ? 'rgba(255,255,255,0.85)' : palette.textSecondary }]}>
            {formatDuration(message.durationSec ?? 0)}
          </Text>
        </View>
      </View>
    );
  }

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
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
  emojiToggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    backgroundColor: palette.chipSurfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
  },
  recordingBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordCancel: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.chipSurfaceSoft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.danger,
  },
  recordingTime: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.textPrimary,
    minWidth: 38,
  },
  recordingHint: {
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  emojiPanel: {
    height: 200,
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  emojiCell: {
    width: `${100 / 8}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 26,
  },
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '78%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  voicePlay: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
  },
  waveBar: {
    width: 3,
    borderRadius: radius.pill,
  },
  voiceDuration: {
    fontSize: typography.label,
    fontWeight: '700',
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
