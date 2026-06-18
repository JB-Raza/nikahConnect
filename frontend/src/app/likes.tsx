import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '@/features/alerts/alert-provider';
import { resolveMatchChatId } from '@/features/alerts/match-alert';
import { likers, matches, type Liker, type Match } from '@/features/likes/data';
import { usePremium } from '@/features/premium/premium-context';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type Segment = 'likes' | 'matches';

export default function LikesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isPremium } = usePremium();
  const { showAlert, showToast, showMatch } = useAlert();
  const [segment, setSegment] = useState<Segment>('likes');
  const [matchList, setMatchList] = useState<Match[]>(matches);

  const confirmUnmatch = (match: Match) =>
    showAlert({
      type: 'warning',
      title: 'Unmatch',
      message: `Unmatch with ${match.name}? This removes the match and your conversation for both of you.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: () => {
            setMatchList((current) => current.filter((item) => item.id !== match.id));
            showToast({ type: 'info', message: `You unmatched ${match.name}.` });
          },
        },
      ],
    });

  const cardWidth = (width - spacing.lg * 2 - spacing.sm) / 2;

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/marriage');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable onPress={dismiss} hitSlop={8} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Connections</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.segmentRow}>
        <SegmentTab label={`Likes ${likers.length}`} active={segment === 'likes'} onPress={() => setSegment('likes')} />
        <SegmentTab label={`Matches ${matchList.length}`} active={segment === 'matches'} onPress={() => setSegment('matches')} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }}>
        {segment === 'likes' ? (
          <>
            {!isPremium ? (
              <Pressable style={styles.unlockBanner} onPress={() => router.push('/premium')}>
                <View style={styles.unlockIcon}>
                  <Ionicons name="diamond" size={18} color="#ffffff" />
                </View>
                <View style={styles.unlockText}>
                  <Text style={styles.unlockTitle}>See who likes you</Text>
                  <Text style={styles.unlockSubtitle}>Upgrade to Premium to reveal {likers.length} likes.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.premiumAccent} />
              </Pressable>
            ) : null}

            <View style={styles.grid}>
              {likers.map((liker) => (
                <LikeCard
                  key={liker.id}
                  liker={liker}
                  width={cardWidth}
                  locked={!isPremium}
                  onPress={() => (isPremium ? router.push(`/profile/${liker.id}`) : router.push('/premium'))}
                  onLikeBack={() =>
                    showMatch({
                      name: liker.name,
                      onChat: () => router.push(`/chat/${resolveMatchChatId(liker.id)}`),
                    })
                  }
                />
              ))}
            </View>
          </>
        ) : matchList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-dislike-outline" size={32} color={palette.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyBody}>When you and someone like each other, you’ll see them here.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {matchList.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                width={cardWidth}
                onPress={() => router.push(`/profile/${match.id}`)}
                onMessage={() => router.push(`/chat/${match.chatId}`)}
                onUnmatch={() => confirmUnmatch(match)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SegmentTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentTab, active && styles.segmentTabActive]} onPress={onPress}>
      <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function LikeCard({
  liker,
  width,
  locked,
  onPress,
  onLikeBack,
}: {
  liker: Liker;
  width: number;
  locked: boolean;
  onPress: () => void;
  onLikeBack: () => void;
}) {
  return (
    <Pressable style={[styles.card, { width }]} onPress={onPress}>
      <Image source={liker.photo} style={styles.cardImage} resizeMode="cover" blurRadius={locked ? 22 : 0} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.72)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {locked ? (
        <View style={styles.lockOverlay}>
          <View style={styles.lockBubble}>
            <Ionicons name="lock-closed" size={18} color="#ffffff" />
          </View>
        </View>
      ) : null}

      {liker.compliment && !locked ? (
        <View style={styles.complimentTag}>
          <Ionicons name="sparkles" size={11} color={palette.warning} />
          <Text style={styles.complimentTagText} numberOfLines={1}>
            {liker.compliment}
          </Text>
        </View>
      ) : (
        <View style={styles.timeTag}>
          <Text style={styles.timeTagText}>{liker.time}</Text>
        </View>
      )}

      <View style={styles.cardCaption} pointerEvents={locked ? 'none' : 'auto'}>
        {locked ? (
          <Text style={styles.cardName}>Hidden</Text>
        ) : (
          <>
            <Text style={styles.cardName} numberOfLines={1}>
              {liker.name}, {liker.age}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {liker.city}, {liker.country}
            </Text>
          </>
        )}
      </View>

      {!locked ? (
        <Pressable style={styles.likeBackButton} onPress={onLikeBack} hitSlop={6}>
          <Ionicons name="heart" size={18} color="#ffffff" />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

function MatchCard({
  match,
  width,
  onPress,
  onMessage,
  onUnmatch,
}: {
  match: Match;
  width: number;
  onPress: () => void;
  onMessage: () => void;
  onUnmatch: () => void;
}) {
  return (
    <Pressable style={[styles.card, { width }]} onPress={onPress}>
      <Image source={match.photo} style={styles.cardImage} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.72)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.matchTag}>
        {match.isOnline ? <View style={styles.onlineDot} /> : null}
        <Text style={styles.matchTagText}>{match.isOnline ? 'Online' : match.matchedAt}</Text>
      </View>

      <Pressable style={styles.unmatchButton} onPress={onUnmatch} hitSlop={6} accessibilityLabel={`Unmatch ${match.name}`}>
        <Ionicons name="close" size={16} color="#ffffff" />
      </Pressable>

      <View style={styles.cardCaption}>
        <Text style={styles.cardName} numberOfLines={1}>
          {match.name}, {match.age}
        </Text>
        <Pressable style={styles.messageButton} onPress={onMessage}>
          <Ionicons name="chatbubble" size={13} color={palette.primary} />
          <Text style={styles.messageButtonText}>Say salam</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: palette.chipSurfaceSoft,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    backgroundColor: palette.surface,
    shadowColor: '#0c1712',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  segmentLabelActive: {
    color: palette.textPrimary,
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.premiumSurface,
    borderWidth: 1,
    borderColor: palette.premiumBorder,
    marginBottom: spacing.md,
  },
  unlockIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: palette.premiumAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockText: {
    flex: 1,
  },
  unlockTitle: {
    fontSize: typography.body,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  unlockSubtitle: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    aspectRatio: 0.74,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.chipSurfaceSoft,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBubble: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  complimentTag: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  complimentTagText: {
    flex: 1,
    fontSize: typography.label,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  timeTag: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  timeTagText: {
    fontSize: typography.label,
    fontWeight: '700',
    color: '#ffffff',
  },
  matchTag: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: '#39d98a',
  },
  matchTagText: {
    fontSize: typography.label,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardCaption: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    gap: spacing.xs,
  },
  cardName: {
    fontSize: typography.body,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardMeta: {
    fontSize: typography.label,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  likeBackButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  messageButtonText: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.primary,
  },
  unmatchButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
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
    lineHeight: 21,
  },
});
