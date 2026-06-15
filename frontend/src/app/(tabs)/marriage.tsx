import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterButton } from '@/components/filter-button';
import { useProfileFilters } from '@/features/filters/use-profile-filters';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

type ReligiousPractice =
  | 'Do not practice'
  | 'Occasionally practicing'
  | 'Actively practicing'
  | 'Strictly practicing';

type MarriageProfile = {
  id: string;
  name: string;
  age: number;
  isVerified: boolean;
  photos: Array<number>;
  country: string;
  occupation: string;
  religiousPractice: ReligiousPractice;
  similarities: string[];
  aboutMe: string;
  height: string;
  maritalStatus: string;
  childrenCount: number;
  marriagePlan: {
    chatDuration: string;
    familyMeeting: string;
    marriageTimeline: string;
  };
  futurePlan: {
    wantsChildren: string;
    relocationPreference: string;
  };
  interests: string[];
  personalityTraits: string[];
  qualification: string;
  career: string;
  languages: string[];
  ethnicity: string;
  sect: string;
  bio: string;
};

const SORT_OPTIONS = [
  "I'm in all their filters",
  'Closest first',
  'Available chat slot',
  'Most compatible',
  'Recently active',
  'Recently joined',
] as const;

const mockProfiles: MarriageProfile[] = [
  {
    id: 'profile-01',
    name: 'Ayesha',
    age: 27,
    isVerified: true,
    photos: [require('@/assets/intro/intro-1.jpg'), require('@/assets/intro/intro-2.jpg'), require('@/assets/intro/intro-3.jpg')],
    country: 'Pakistan',
    occupation: 'Product Designer',
    religiousPractice: 'Actively practicing',
    similarities: ['Both value family involvement', 'Both like meaningful communication', 'Both prefer marriage in 4-12 months'],
    aboutMe: 'Calm, family-oriented, and serious about a respectful marriage process.',
    height: "5'5\"",
    maritalStatus: 'Single',
    childrenCount: 0,
    marriagePlan: {
      chatDuration: '2-3 months',
      familyMeeting: 'Yes, after initial compatibility',
      marriageTimeline: '4-12 months',
    },
    futurePlan: {
      wantsChildren: 'Yes',
      relocationPreference: 'Open to relocate globally',
    },
    interests: ['Travel', 'Quran study', 'Reading', 'Cooking'],
    personalityTraits: ['Empathetic', 'Honest', 'Patient'],
    qualification: 'BS Computer Science',
    career: 'Senior Product Designer',
    languages: ['Urdu', 'English'],
    ethnicity: 'Punjabi',
    sect: 'Sunni',
    bio: 'I am looking for a sincere life partner with strong values, emotional maturity, and clear marriage intentions. I value deen, mutual respect, and open communication.',
  },
  {
    id: 'profile-02',
    name: 'Mariam',
    age: 25,
    isVerified: true,
    photos: [require('@/assets/intro/intro-2.jpg'), require('@/assets/intro/intro-3.jpg'), require('@/assets/intro/intro-1.jpg')],
    country: 'United Arab Emirates',
    occupation: 'Teacher',
    religiousPractice: 'Strictly practicing',
    similarities: ['Both prioritize deen', 'Both want children', 'Both value education'],
    aboutMe: 'I appreciate kindness, responsibility, and meaningful partnership.',
    height: "5'3\"",
    maritalStatus: 'Single',
    childrenCount: 0,
    marriagePlan: {
      chatDuration: '1-2 months',
      familyMeeting: 'Early family involvement preferred',
      marriageTimeline: '6-10 months',
    },
    futurePlan: {
      wantsChildren: 'Yes',
      relocationPreference: 'Home country only',
    },
    interests: ['Volunteering', 'Islamic lectures', 'Fitness'],
    personalityTraits: ['Disciplined', 'Warm', 'Thoughtful'],
    qualification: 'MEd Education',
    career: 'Islamic School Teacher',
    languages: ['Arabic', 'English', 'Urdu'],
    ethnicity: 'Pashtun',
    sect: 'Sunni',
    bio: 'I want to build a peaceful home based on trust, deen, and shared long-term goals. I believe marriage works best with compassion and teamwork.',
  },
  {
    id: 'profile-03',
    name: 'Noor',
    age: 29,
    isVerified: false,
    photos: [require('@/assets/intro/intro-3.jpg'), require('@/assets/intro/intro-1.jpg'), require('@/assets/intro/intro-2.jpg')],
    country: 'Saudi Arabia',
    occupation: 'Software Engineer',
    religiousPractice: 'Occasionally practicing',
    similarities: ['Both prefer honest communication', 'Both are career-oriented', 'Both open to relocation'],
    aboutMe: 'Balanced between career and family life, looking for serious commitment.',
    height: "5'7\"",
    maritalStatus: 'Divorced',
    childrenCount: 1,
    marriagePlan: {
      chatDuration: '2 months',
      familyMeeting: 'Yes, after intent is clear',
      marriageTimeline: '8-12 months',
    },
    futurePlan: {
      wantsChildren: 'Open to discuss',
      relocationPreference: 'Open to relocate globally',
    },
    interests: ['Tech', 'Podcasts', 'Hiking'],
    personalityTraits: ['Practical', 'Loyal', 'Reflective'],
    qualification: 'BS Software Engineering',
    career: 'Lead Software Engineer',
    languages: ['Arabic', 'English'],
    ethnicity: 'Arab',
    sect: 'Shia',
    bio: 'I am seeking a mature partner who understands responsibility, mutual growth, and healthy communication. I value sincerity, patience, and long-term stability.',
  },
];

const palette = colors.light;

export default function MarriageTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const { filter: filterProfiles, activeCount, clearAllFilters } = useProfileFilters();

  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [selectedSorts, setSelectedSorts] = useState<string[]>(['Most compatible']);
  const [composerText, setComposerText] = useState('');
  const [inlineCompliment, setInlineCompliment] = useState('');

  const sortSheetRef = useRef<BottomSheetModal>(null);
  const complimentSheetRef = useRef<BottomSheetModal>(null);

  const sortSnapPoints = useMemo(() => ['62%'], []);
  const complimentSnapPoints = useMemo(() => ['56%'], []);

  const visibleProfiles = useMemo(
    () => filterProfiles(mockProfiles).filter((profile) => !passedIds.includes(profile.id)),
    [filterProfiles, passedIds],
  );

  const currentProfile = visibleProfiles[0] ?? null;
  const heroHeight = Math.round(height * 0.68);
  const stickyBottomOffset = insets.bottom + spacing.lg;
  const headerTopPadding = insets.top + spacing.xs;
  const complimentIsValid = composerText.trim().length >= 10;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" opacity={0.45} />
    ),
    [],
  );

  const consumeCurrentProfile = useCallback(() => {
    if (currentProfile) {
      setPassedIds((previous) => [...previous, currentProfile.id]);
    }
    setHeroImageIndex(0);
    setComposerText('');
    setInlineCompliment('');
  }, [currentProfile]);

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

  const handlePass = () => consumeCurrentProfile();
  const handleLike = () => consumeCurrentProfile();
  const handleBlock = () => consumeCurrentProfile();
  const handleReport = () => consumeCurrentProfile();

  const handleSendCompliment = () => {
    if (!complimentIsValid) {
      return;
    }
    consumeCurrentProfile();
    complimentSheetRef.current?.dismiss();
  };

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
          <Pressable
            style={[styles.reloadButton, { backgroundColor: palette.primary }]}
            onPress={() => {
              clearAllFilters();
              setPassedIds([]);
              setHeroImageIndex(0);
            }}>
            <Text style={[styles.reloadButtonText, { color: palette.textOnPrimary }]}>Clear filters</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[
            activeCount > 0 ? styles.ghostReloadButton : styles.reloadButton,
            activeCount > 0 ? { borderColor: palette.border } : { backgroundColor: palette.primary },
          ]}
          onPress={() => {
            setPassedIds([]);
            setHeroImageIndex(0);
          }}>
          <Text
            style={[
              styles.reloadButtonText,
              { color: activeCount > 0 ? palette.textPrimary : palette.textOnPrimary },
            ]}>
            Reload profiles
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
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
          <HeaderIconButton icon="flash-outline" label="Boost" onPress={() => {}} />
          <HeaderIconButton icon="notifications-outline" label="Alerts" onPress={() => router.push('/notifications')} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
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

        <Section title="Your Similarities">
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
            <FooterAction label="Share profile" icon="share-social-outline" onPress={() => {}} />
            <FooterAction label="Favorite" icon="bookmark-outline" onPress={() => {}} />
            <FooterAction label="Block user" icon="ban-outline" onPress={handleBlock} />
            <FooterAction label="Report user" icon="flag-outline" onPress={handleReport} />
          </View>
        </Section>
      </ScrollView>

      <View style={[styles.stickyActions, { bottom: stickyBottomOffset }]} pointerEvents="box-none">
        <CircleAction icon="close" backgroundColor="#ffffff" iconColor={palette.danger} size={58} onPress={handlePass} />
        <CircleAction icon="checkmark" backgroundColor={palette.success} iconColor="#ffffff" size={66} onPress={handleLike} />
        <CircleAction
          icon="sparkles"
          backgroundColor={palette.warning}
          iconColor="#ffffff"
          size={58}
          onPress={() => {
            setComposerText(inlineCompliment);
            openComplimentSheet();
          }}
        />
      </View>

      {__DEV__ ? (
        <Pressable
          style={[styles.devButton, { bottom: stickyBottomOffset }]}
          onPress={() => router.push('/')}>
          <Ionicons name="construct-outline" size={14} color="#ffffff" />
          <Text style={styles.devButtonText}>Intro</Text>
        </Pressable>
      ) : null}

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
            <Pressable
              style={[
                styles.primaryAction,
                { backgroundColor: selectedSorts.length > 0 ? palette.primary : palette.tabBarInactive },
              ]}
              disabled={selectedSorts.length === 0}
              onPress={applySort}>
              <Text style={[styles.primaryActionText, { color: palette.textOnPrimary }]}>Apply</Text>
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={complimentSheetRef}
        snapPoints={complimentSnapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: palette.border }}
        backgroundStyle={{ backgroundColor: palette.surface }}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Send a Compliment</Text>
          <TextInput
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
          <Pressable
            style={[
              styles.primaryAction,
              { backgroundColor: complimentIsValid ? palette.primary : palette.tabBarInactive },
            ]}
            disabled={!complimentIsValid}
            onPress={handleSendCompliment}>
            <Text style={[styles.primaryActionText, { color: palette.textOnPrimary }]}>Send Compliment</Text>
          </Pressable>
          <Pressable
            style={[styles.ghostButton, { borderColor: palette.border }]}
            onPress={() => complimentSheetRef.current?.dismiss()}>
            <Text style={[styles.ghostButtonText, { color: palette.textPrimary }]}>Cancel</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
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
    <Pressable accessibilityLabel={label} style={styles.headerIconButton} onPress={onPress}>
      <Ionicons name={icon} size={typography.subtitle} color={palette.textPrimary} />
    </Pressable>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[styles.section, !last && styles.sectionDivider]}>
      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>{title}</Text>
      {children}
    </View>
  );
}

function HeroChip({ text }: { text: string }) {
  return (
    <View style={styles.heroChip}>
      <Text style={styles.heroChipText}>{text}</Text>
    </View>
  );
}

function SoftChip({ text }: { text: string }) {
  return (
    <View style={[styles.softChip, { borderColor: palette.border, backgroundColor: palette.chipSurfaceSoft }]}>
      <Text style={[styles.softChipText, { color: palette.textPrimary }]}>{text}</Text>
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
    paddingBottom: spacing.lg,
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
    color: '#ffffff',
  },
  identityAge: {
    fontSize: typography.titleMd,
    fontWeight: '700',
    color: '#ffffff',
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.35)',
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
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
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
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  softChipText: {
    fontSize: typography.caption,
    fontWeight: '600',
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
  },
  factValue: {
    fontSize: typography.body,
    fontWeight: '600',
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
    padding: spacing.sm,
    fontSize: typography.body,
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
    gap: spacing.xl,
    zIndex: 40,
  },
  devButton: {
    position: 'absolute',
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: '#1f2937',
    opacity: 0.85,
    zIndex: 41,
  },
  devButtonText: {
    color: '#ffffff',
    fontSize: typography.caption,
    fontWeight: '700',
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.titleMd,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: typography.body,
    textAlign: 'center',
  },
  reloadButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
  },
  ghostReloadButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
  },
  reloadButtonText: {
    fontSize: typography.button,
    fontWeight: '700',
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
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  primaryActionText: {
    fontSize: typography.button,
    fontWeight: '700',
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
