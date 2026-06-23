import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useIsFocused, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CompatibilityBar from '@/components/compatibility-bar';
import FilterButton from '@/components/filter-button';
import GradientButton from '@/components/gradient-button';
import IconCircleButton from '@/components/icon-circle-button';
import { useAlert } from '@/features/alerts/alert-provider';
import { resolveMatchChatId } from '@/features/alerts/match-alert';
import { hapticImpact } from '@/features/haptics';
import { useProfileFilters } from '@/features/filters/use-profile-filters';
import { useProfileActions } from '@/features/profile/profile-actions-context';
import { profiles as mockProfiles } from '@/features/profiles/data';
import { colors, gradients, radius, sizing, spacing, typography } from '@/theme/theme';

const SUPER_LIKE_COLOR = '#2f9bed';

const SORT_OPTIONS = [
  "I'm in all their filters",
  'Closest first',
  'Available chat slot',
  'Most compatible',
  'Recently active',
  'Recently joined',
] as const;

const palette = colors.light;

export default function MarriageTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { width, height } = useWindowDimensions();
  const { showAlert, showToast, showMatch } = useAlert();

  const { filter: filterProfiles, activeCount, clearAllFilters } = useProfileFilters();
  const { passedIds, isBlocked, isFavorited, recordPass, recordLike, toggleFavorite, recordCompliment, blockUser, resetDeck } =
    useProfileActions();

  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [selectedSorts, setSelectedSorts] = useState<string[]>(['Most compatible']);
  const [composerText, setComposerText] = useState('');
  const [inlineCompliment, setInlineCompliment] = useState('');

  const sortSheetRef = useRef<BottomSheetModal>(null);
  const complimentSheetRef = useRef<BottomSheetModal>(null);

  const sortSnapPoints = useMemo(() => ['62%'], []);
  const complimentSnapPoints = useMemo(() => ['56%'], []);

  const visibleProfiles = useMemo(
    () =>
      filterProfiles(mockProfiles).filter(
        (profile) => !passedIds.includes(profile.id) && !isBlocked(profile.id),
      ),
    [filterProfiles, passedIds, isBlocked],
  );

  const currentProfile = visibleProfiles[0] ?? null;
  const heroHeight = Math.round(height * 0.68);
  const stickyBottomOffset = insets.bottom + spacing.lg;
  const headerTopPadding = insets.top + spacing.xs;
  const headerHeight = headerTopPadding + sizing.iconButtonSize + spacing.xs;
  const complimentIsValid = composerText.trim().length >= 10;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const headerBackgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, heroHeight * 0.32, heroHeight * 0.55], [0, 0.65, 1], Extrapolation.CLAMP),
  }));

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" opacity={0.45} />
    ),
    [],
  );

  const consumeCurrentProfile = useCallback(() => {
    setHeroImageIndex(0);
    setComposerText('');
    setInlineCompliment('');
  }, []);

  const openSortSheet = () => {
    complimentSheetRef.current?.dismiss();
    sortSheetRef.current?.present();
  };
  const openComplimentSheet = () => {
    sortSheetRef.current?.dismiss();
    complimentSheetRef.current?.present();
  };

  const toggleSort = (option: string) => {
    setSelectedSorts((previous) =>
      previous.includes(option) ? previous.filter((item) => item !== option) : [...previous, option],
    );
  };

  const applySort = () => {
    if (selectedSorts.length === 0) {
      return;
    }
    sortSheetRef.current?.dismiss();
  };

  const handlePass = () => {
    if (currentProfile) {
      recordPass(currentProfile);
    }
    consumeCurrentProfile();
  };

  const handleLike = () => {
    if (!currentProfile) {
      return;
    }
    hapticImpact();
    const isMatch = recordLike(currentProfile);
    const profileId = currentProfile.id;
    const name = currentProfile.name;
    consumeCurrentProfile();
    if (isMatch) {
      showMatch({
        name,
        onChat: () => router.push(`/chat/${resolveMatchChatId(profileId)}`),
      });
    } else {
      showToast({ type: 'success', message: `Waiting for ${name}'s response.` });
    }
  };

  const handleSuperLike = () => {
    if (!currentProfile) {
      return;
    }
    hapticImpact();
    const name = currentProfile.name;
    const isMatch = recordLike(currentProfile);
    const profileId = currentProfile.id;
    consumeCurrentProfile();
    if (isMatch) {
      showMatch({
        name,
        onChat: () => router.push(`/chat/${resolveMatchChatId(profileId)}`),
      });
    } else {
      showToast({ type: 'success', message: name ? `Waiting for ${name}'s response.` : 'Super like sent.' });
    }
  };

  const handleShare = async () => {
    if (!currentProfile) {
      return;
    }
    try {
      await Share.share({ message: `Check out ${currentProfile.name}'s profile on NikahConnect.` });
    } catch {
      // user dismissed share sheet
    }
  };

  const handleFavorite = () => {
    if (!currentProfile) {
      return;
    }
    const added = toggleFavorite(currentProfile);
    showToast({
      type: 'success',
      message: added ? `${currentProfile.name} added to favourites.` : `${currentProfile.name} removed from favourites.`,
    });
  };

  const handleBlock = () => {
    if (!currentProfile) {
      return;
    }
    const profile = currentProfile;
    showAlert({
      type: 'warning',
      title: 'Block user',
      message: `Block ${profile.name}? They won't be able to see your profile or message you.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            blockUser(profile);
            consumeCurrentProfile();
            showToast({ type: 'info', message: `${profile.name} has been blocked.` });
          },
        },
      ],
    });
  };

  const handleReport = () => {
    if (!currentProfile) {
      return;
    }
    router.push({ pathname: '/report', params: { name: currentProfile.name } });
  };

  const handleSendCompliment = () => {
    if (!complimentIsValid || !currentProfile) {
      return;
    }
    hapticImpact();
    recordCompliment(currentProfile);
    consumeCurrentProfile();
    complimentSheetRef.current?.dismiss();
    showToast({ type: 'success', message: `Your compliment to ${currentProfile.name} has been sent.` });
  };

  const favorited = currentProfile ? isFavorited(currentProfile.id) : false;

  if (!currentProfile) {
    return (
      <View style={[styles.screen, styles.emptyContainer, { backgroundColor: palette.background, paddingTop: insets.top }]}>
        <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No more recommendations</Text>
        <Text style={[styles.emptyBody, { color: palette.textSecondary }]}>
          {activeCount > 0
            ? 'Your filters might be too narrow. Try clearing them to see more proposals.'
            : 'Come back later for new proposals.'}
        </Text>
        {activeCount > 0 ? (
          <GradientButton
            label="Clear filters"
            style={styles.reloadButton}
            onPress={() => {
              clearAllFilters();
              setHeroImageIndex(0);
            }}
          />
        ) : null}
        {activeCount > 0 ? (
          <GradientButton
            label="Reload profiles"
            variant="outline"
            style={styles.reloadButton}
            onPress={() => {
              resetDeck();
              setHeroImageIndex(0);
            }}
          />
        ) : (
          <GradientButton
            label="Reload profiles"
            style={styles.reloadButton}
            onPress={() => {
              resetDeck();
              setHeroImageIndex(0);
            }}
          />
        )}
      </View>
    );
  }

  return (
    <>
    {isFocused ? <StatusBar translucent backgroundColor="transparent" barStyle="light-content" /> : null}
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <Animated.View
        style={[styles.headerBackground, { height: headerHeight }, headerBackgroundStyle]}
        pointerEvents="none">
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={[styles.header, { paddingTop: headerTopPadding }]} pointerEvents="box-none">
        <View style={styles.headerLeft}>
          <FilterButton />
          <HeaderPill
            label="Sort"
            icon="swap-vertical-outline"
            onPress={openSortSheet}
            badge={selectedSorts.length}
          />
        </View>
        <View style={styles.headerRight}>
          <HeaderIconButton icon="flash-outline" label="Boost" onPress={() => router.push('/boost')} />
          <HeaderIconButton icon="notifications-outline" label="Alerts" onPress={() => router.push('/notifications')} />
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: stickyBottomOffset + sizing.stickyActionHeight + spacing.xl,
        }}>
        <View style={{ height: heroHeight, width }}>
          <FlatList
            data={currentProfile.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `${currentProfile.id}-photo-${index}`}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setHeroImageIndex(nextIndex);
            }}
            renderItem={({ item }) => (
              <Image source={item} style={{ width, height: heroHeight }} resizeMode="cover" />
            )}
          />

          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
            locations={[0, 0.22, 0.55, 1]}
            style={styles.heroGradient}
            pointerEvents="none"
          />

          <View style={styles.heroDots} pointerEvents="none">
            {currentProfile.photos.map((_, index) => {
              const active = index === heroImageIndex;
              return <View key={`${currentProfile.id}-dot-${index}`} style={[styles.heroDot, active && styles.heroDotActive]} />;
            })}
          </View>

          <View style={styles.heroCaption} pointerEvents="none">
            <View style={styles.identityRow}>
              <Text style={styles.identityName}>{currentProfile.name}</Text>
              <Text style={styles.identityAge}>{currentProfile.age}</Text>
              {currentProfile.isVerified ? (
                <View style={[styles.verifiedBadge, { backgroundColor: palette.success }]}>
                  <Ionicons name="checkmark" color="#ffffff" size={typography.label} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.heroChipWrap}>
              <HeroChip text={currentProfile.country} />
              <HeroChip text={currentProfile.occupation} />
              <HeroChip text={currentProfile.religiousPractice} />
            </View>
          </View>
        </View>

        <View style={styles.sheet}>
        <Section title="Your Similarities">
          <CompatibilityBar score={currentProfile.compatibility} />
          {currentProfile.similarities.map((item) => (
            <BulletLine key={item} text={item} />
          ))}
        </Section>

        <Section title="About Me">
          <Text style={[styles.bodyText, { color: palette.textSecondary }]}>{currentProfile.aboutMe}</Text>
        </Section>

        <Section title="Core Facts">
          <FactRow label="Height" value={currentProfile.height} />
          <FactRow label="Age" value={`${currentProfile.age}`} />
          <FactRow label="Marital Status" value={currentProfile.maritalStatus} />
          <FactRow
            label="Children"
            value={currentProfile.childrenCount > 0 ? `${currentProfile.childrenCount}` : "Doesn't have children"}
          />
        </Section>

        <Section title="Plan of Marriage">
          <FactRow label="Chat duration" value={currentProfile.marriagePlan.chatDuration} />
          <FactRow label="Family meeting" value={currentProfile.marriagePlan.familyMeeting} />
          <FactRow label="Marriage timeline" value={currentProfile.marriagePlan.marriageTimeline} />
        </Section>

        <Section title="Future Plan">
          <FactRow label="Wants children" value={currentProfile.futurePlan.wantsChildren} />
          <FactRow label="Relocation" value={currentProfile.futurePlan.relocationPreference} />
        </Section>

        <Section title="Interests">
          <View style={styles.chipWrap}>
            {currentProfile.interests.map((item) => (
              <SoftChip key={item} text={item} />
            ))}
          </View>
        </Section>

        <Section title="Personality">
          <View style={styles.chipWrap}>
            {currentProfile.personalityTraits.map((item) => (
              <SoftChip key={item} text={item} />
            ))}
          </View>
        </Section>

        <Section title="Education & Career">
          <FactRow label="Qualification" value={currentProfile.qualification} />
          <FactRow label="Career" value={currentProfile.career} />
        </Section>

        <Section title="Languages & Ethnicity">
          <FactRow label="Languages" value={currentProfile.languages.join(', ')} />
          <FactRow label="Ethnicity" value={currentProfile.ethnicity} />
        </Section>

        <Section title="Bio">
          <Text style={[styles.bodyText, { color: palette.textSecondary }]}>{currentProfile.bio}</Text>
        </Section>

        <Section title="Compliment">
          <TextInput
            style={[styles.nonExpandableInput, { borderColor: palette.border, color: palette.textPrimary }]}
            placeholder="Write a thoughtful compliment for this profile..."
            placeholderTextColor={palette.textSecondary}
            value={inlineCompliment}
            onChangeText={setInlineCompliment}
            multiline
            maxLength={220}
            textAlignVertical="top"
          />
        </Section>

        <Section title="Profile Actions" last>
          <View style={styles.footerActions}>
            <FooterAction label="Share profile" icon="share-social-outline" onPress={handleShare} />
            <FooterAction
              label={favorited ? 'Favorited' : 'Favorite'}
              icon={favorited ? 'bookmark' : 'bookmark-outline'}
              onPress={handleFavorite}
            />
            <FooterAction label="Block user" icon="ban-outline" onPress={handleBlock} />
            <FooterAction label="Report user" icon="flag-outline" onPress={handleReport} />
          </View>
        </Section>
        </View>
      </Animated.ScrollView>

      <View style={[styles.stickyActions, { bottom: stickyBottomOffset }]} pointerEvents="box-none">
        <View style={styles.actionDockShadow}>
          <BlurView intensity={32} tint="light" style={styles.actionDock}>
            <CircleAction icon="close" backgroundColor="#ffffff" iconColor={palette.danger} size={54} onPress={handlePass} />
            <CircleAction icon="star" backgroundColor="#ffffff" iconColor={SUPER_LIKE_COLOR} size={54} onPress={handleSuperLike} />
            <CircleAction icon="checkmark" backgroundColor={palette.success} iconColor="#ffffff" size={64} onPress={handleLike} />
            <CircleAction
              icon="sparkles"
              backgroundColor={palette.warning}
              iconColor="#ffffff"
              size={54}
              onPress={() => {
                setComposerText(inlineCompliment);
                openComplimentSheet();
              }}
            />
          </BlurView>
        </View>
      </View>

      <BottomSheetModal
        ref={sortSheetRef}
        snapPoints={sortSnapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: palette.border }}
        backgroundStyle={{ backgroundColor: palette.surface }}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Sort</Text>
          {SORT_OPTIONS.map((option) => {
            const active = selectedSorts.includes(option);
            return (
              <Pressable key={option} style={styles.sortTextRow} onPress={() => toggleSort(option)}>
                <Text style={[styles.sortText, { color: active ? palette.primary : palette.textPrimary, fontWeight: active ? '700' : '500' }]}>
                  {option}
                </Text>
                {active ? <Ionicons name="checkmark" size={typography.subtitle} color={palette.primary} /> : null}
              </Pressable>
            );
          })}
          <View style={styles.sheetFooterActions}>
            <GradientButton
              label="Apply"
              style={styles.primaryAction}
              disabled={selectedSorts.length === 0}
              onPress={applySort}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={complimentSheetRef}
        snapPoints={complimentSnapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={{ backgroundColor: palette.border }}
        backgroundStyle={{ backgroundColor: palette.surface }}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Send a Compliment</Text>
          <BottomSheetTextInput
            style={[styles.complimentComposer, { borderColor: palette.border, color: palette.textPrimary }]}
            placeholder="Write at least 10 characters..."
            placeholderTextColor={palette.textSecondary}
            value={composerText}
            onChangeText={setComposerText}
            multiline
            maxLength={280}
            textAlignVertical="top"
          />
          <Text style={[styles.counterText, { color: palette.textSecondary }]}>{composerText.trim().length}/10 min</Text>
          <GradientButton
            label="Send Compliment"
            style={styles.primaryAction}
            disabled={!complimentIsValid}
            onPress={handleSendCompliment}
          />
          <Pressable
            style={[styles.ghostButton, { borderColor: palette.border }]}
            onPress={() => complimentSheetRef.current?.dismiss()}>
            <Text style={[styles.ghostButtonText, { color: palette.textPrimary }]}>Cancel</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
    </>
  );
}

function HeaderPill({
  label,
  icon,
  onPress,
  badge = 0,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  badge?: number;
}) {
  return (
    <Pressable style={styles.headerPill} onPress={onPress}>
      <Ionicons name={icon} size={typography.body} color={palette.textPrimary} />
      <Text style={styles.headerPillText}>{label}</Text>
      {badge > 0 ? (
        <View style={styles.headerPillBadge}>
          <Text style={styles.headerPillBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <IconCircleButton
      icon={icon}
      onPress={onPress}
      accessibilityLabel={label}
      variant="surface"
      size={40}
      iconSize={typography.subtitle}
    />
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[styles.section, last && styles.sectionLast]}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionAccent} />
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function HeroChip({ text }: { text: string }) {
  return (
    <BlurView intensity={18} tint="dark" style={styles.heroChip}>
      <Text style={styles.heroChipText}>{text}</Text>
    </BlurView>
  );
}

function SoftChip({ text }: { text: string }) {
  return (
    <View style={styles.softChip}>
      <Text style={styles.softChipText}>{text}</Text>
    </View>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.factRow}>
      <Text style={[styles.factLabel, { color: palette.textSecondary }]}>{label}</Text>
      <Text style={[styles.factValue, { color: palette.textPrimary }]}>{value}</Text>
    </View>
  );
}

function BulletLine({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: palette.primary }]} />
      <Text style={[styles.bodyText, { color: palette.textSecondary }]}>{text}</Text>
    </View>
  );
}

function FooterAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.footerAction, { borderColor: palette.border }]} onPress={onPress}>
      <Ionicons name={icon} size={typography.subtitle} color={palette.textPrimary} />
      <Text style={[styles.footerActionText, { color: palette.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

function CircleAction({
  icon,
  backgroundColor,
  iconColor,
  size,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  backgroundColor: string;
  iconColor: string;
  size: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.circleAction,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}>
      <Ionicons name={icon} size={size * 0.42} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#0c3d6b',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerPill: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    minHeight: sizing.iconButtonSize,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    shadowColor: '#0c1712',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  headerPillText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  headerPillBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerIconButton: {
    width: sizing.iconButtonSize,
    height: sizing.iconButtonSize,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0c1712',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
  },
  heroDots: {
    position: 'absolute',
    top: spacing.xxl * 2.4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  heroDot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  heroDotActive: {
    width: spacing.lg,
    backgroundColor: '#ffffff',
  },
  heroCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.md,
    gap: spacing.sm,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  identityName: {
    fontSize: typography.title,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  identityAge: {
    fontSize: typography.titleMd,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    minHeight: spacing.xl,
    marginLeft: spacing.xs,
  },
  verifiedText: {
    fontSize: typography.label,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  heroChip: {
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    minHeight: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroChipText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: '#ffffff',
  },
  sheet: {
    marginTop: -spacing.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.background,
    borderTopLeftRadius: radius.xl + spacing.xxs,
    borderTopRightRadius: radius.xl + spacing.xxs,
    gap: spacing.md,
  },
  section: {
    backgroundColor: palette.cardSurface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    shadowColor: '#0c3d6b',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionLast: {
    marginBottom: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  sectionAccent: {
    width: 3,
    height: typography.subtitle,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bodyText: {
    fontSize: typography.body,
    lineHeight: spacing.xl,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  softChip: {
    borderWidth: 1,
    borderColor: 'rgba(36,134,224,0.18)',
    backgroundColor: palette.chipSurfaceSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  softChipText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.primaryPressed,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: spacing.xl + spacing.xs,
  },
  factLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  factValue: {
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletDot: {
    marginTop: spacing.xs,
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radius.pill,
  },
  nonExpandableInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: spacing.xxl * 3,
    padding: spacing.md,
    fontSize: typography.body,
    backgroundColor: palette.chipSurfaceSoft,
  },
  footerActions: {
    gap: spacing.xs,
  },
  footerAction: {
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: sizing.buttonHeight,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.chipSurfaceSoft,
  },
  footerActionText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  stickyActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  actionDockShadow: {
    borderRadius: radius.pill,
    shadowColor: '#0c3d6b',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  actionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  circleAction: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0c1712',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  emptyContainer: {
    paddingHorizontal: spacing.xl,
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.titleMd,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: typography.body,
    textAlign: 'center',
  },
  reloadButton: {
    alignSelf: 'stretch',
    width: '100%',
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  sheetTitle: {
    fontSize: typography.titleMd,
    fontWeight: '700',
  },
  sheetFooterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sortTextRow: {
    minHeight: sizing.buttonHeight - spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  sortText: {
    fontSize: typography.subtitle,
  },
  complimentComposer: {
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: spacing.xxl * 4,
    padding: spacing.sm,
    fontSize: typography.body,
  },
  counterText: {
    fontSize: typography.caption,
    textAlign: 'right',
  },
  primaryAction: {
    flex: 1,
  },
  ghostButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  ghostButtonText: {
    fontSize: typography.button,
    fontWeight: '600',
  },
});
