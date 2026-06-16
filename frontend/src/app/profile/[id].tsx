import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getProfileById } from '@/features/profiles/data';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;
const MIN_COMPLIMENT_LENGTH = 10;

export default function ProfileDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();

  const profile = useMemo(() => getProfileById(id), [id]);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [composerText, setComposerText] = useState('');

  const complimentSheetRef = useRef<BottomSheetModal>(null);
  const complimentSnapPoints = useMemo(() => ['56%'], []);

  const heroHeight = Math.round(height * 0.62);
  const stickyBottomOffset = insets.bottom + spacing.md;
  const complimentIsValid = composerText.trim().length >= MIN_COMPLIMENT_LENGTH;

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/explore');
    }
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  const handleSendCompliment = () => {
    if (!complimentIsValid) {
      return;
    }
    complimentSheetRef.current?.dismiss();
    setComposerText('');
    Alert.alert('Compliment sent', `Your compliment to ${profile.name} has been sent.`);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out ${profile.name}'s profile on NikahConnect.` });
    } catch {
      // user dismissed the share sheet
    }
  };

  const confirmBlock = () =>
    Alert.alert('Block user', `Block ${profile.name}? They won't be able to see your profile or message you.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: dismiss },
    ]);

  const confirmReport = () =>
    Alert.alert('Report user', `Report ${profile.name} for review by our safety team?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: dismiss },
    ]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <Pressable onPress={dismiss} hitSlop={8} style={styles.circleButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
        </Pressable>
        <Pressable onPress={handleShare} hitSlop={8} style={styles.circleButton} accessibilityLabel="Share profile">
          <Ionicons name="share-social-outline" size={20} color={palette.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: stickyBottomOffset + sizing.stickyActionHeight + spacing.xl }}>
        <View style={{ height: heroHeight, width }}>
          <FlatList
            data={profile.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `${profile.id}-photo-${index}`}
            onMomentumScrollEnd={(event) => {
              setPhotoIndex(Math.round(event.nativeEvent.contentOffset.x / width));
            }}
            renderItem={({ item }) => <Image source={item} style={{ width, height: heroHeight }} resizeMode="cover" />}
          />

          <LinearGradient
            colors={['rgba(0,0,0,0.32)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.22, 0.55, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {profile.photos.length > 1 ? (
            <View style={styles.heroDots} pointerEvents="none">
              {profile.photos.map((_, index) => (
                <View
                  key={`${profile.id}-dot-${index}`}
                  style={[styles.heroDot, index === photoIndex && styles.heroDotActive]}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.heroCaption} pointerEvents="none">
            <View style={styles.identityRow}>
              <Text style={styles.identityName}>{profile.name}</Text>
              <Text style={styles.identityAge}>{profile.age}</Text>
              {profile.isVerified ? (
                <View style={[styles.verifiedBadge, { backgroundColor: palette.success }]}>
                  <Ionicons name="checkmark" color="#ffffff" size={typography.label} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.heroChipWrap}>
              <HeroChip text={`${profile.city}, ${profile.country}`} />
              <HeroChip text={profile.occupation} />
              <HeroChip text={profile.religiousPractice} />
            </View>
          </View>
        </View>

        <Section title="Your Similarities">
          {profile.similarities.map((item) => (
            <BulletLine key={item} text={item} />
          ))}
        </Section>

        <Section title="About Me">
          <Text style={styles.bodyText}>{profile.aboutMe}</Text>
        </Section>

        <Section title="Core Facts">
          <FactRow label="Height" value={profile.height} />
          <FactRow label="Age" value={`${profile.age}`} />
          <FactRow label="Marital Status" value={profile.maritalStatus} />
          <FactRow
            label="Children"
            value={profile.childrenCount > 0 ? `${profile.childrenCount}` : "Doesn't have children"}
          />
        </Section>

        <Section title="Plan of Marriage">
          <FactRow label="Chat duration" value={profile.marriagePlan.chatDuration} />
          <FactRow label="Family meeting" value={profile.marriagePlan.familyMeeting} />
          <FactRow label="Marriage timeline" value={profile.marriagePlan.marriageTimeline} />
        </Section>

        <Section title="Future Plan">
          <FactRow label="Wants children" value={profile.futurePlan.wantsChildren} />
          <FactRow label="Relocation" value={profile.futurePlan.relocationPreference} />
        </Section>

        <Section title="Interests">
          <View style={styles.chipWrap}>
            {profile.interests.map((item) => (
              <SoftChip key={item} text={item} />
            ))}
          </View>
        </Section>

        <Section title="Personality">
          <View style={styles.chipWrap}>
            {profile.personalityTraits.map((item) => (
              <SoftChip key={item} text={item} />
            ))}
          </View>
        </Section>

        <Section title="Education & Career">
          <FactRow label="Qualification" value={profile.qualification} />
          <FactRow label="Career" value={profile.career} />
        </Section>

        <Section title="Languages & Ethnicity">
          <FactRow label="Languages" value={profile.languages.join(', ')} />
          <FactRow label="Ethnicity" value={profile.ethnicity} />
          <FactRow label="Sect" value={profile.sect} />
        </Section>

        <Section title="Bio">
          <Text style={styles.bodyText}>{profile.bio}</Text>
        </Section>

        <Section title="Profile Actions" last>
          <View style={styles.footerActions}>
            <FooterAction label="Share profile" icon="share-social-outline" onPress={handleShare} />
            <FooterAction
              label={favorited ? 'Favorited' : 'Favorite'}
              icon={favorited ? 'bookmark' : 'bookmark-outline'}
              onPress={() => setFavorited((value) => !value)}
            />
            <FooterAction label="Block user" icon="ban-outline" onPress={confirmBlock} />
            <FooterAction label="Report user" icon="flag-outline" onPress={confirmReport} />
          </View>
        </Section>
      </ScrollView>

      <View style={[styles.stickyActions, { bottom: stickyBottomOffset }]} pointerEvents="box-none">
        <CircleAction
          icon="checkmark"
          backgroundColor={liked ? palette.success : '#ffffff'}
          iconColor={liked ? '#ffffff' : palette.success}
          size={66}
          onPress={() => setLiked((value) => !value)}
        />
        <CircleAction
          icon="sparkles"
          backgroundColor={palette.warning}
          iconColor="#ffffff"
          size={58}
          onPress={() => complimentSheetRef.current?.present()}
        />
      </View>

      <BottomSheetModal
        ref={complimentSheetRef}
        snapPoints={complimentSnapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: palette.border }}
        backgroundStyle={{ backgroundColor: palette.surface }}>
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sheetTitle}>Compliment {profile.name}</Text>
          <TextInput
            style={styles.complimentComposer}
            placeholder="Write at least 10 characters..."
            placeholderTextColor={palette.textSecondary}
            value={composerText}
            onChangeText={setComposerText}
            multiline
            maxLength={280}
            textAlignVertical="top"
          />
          <Text style={styles.counterText}>{composerText.trim().length}/{MIN_COMPLIMENT_LENGTH} min</Text>
          <Pressable
            style={[styles.primaryAction, { backgroundColor: complimentIsValid ? palette.primary : palette.tabBarInactive }]}
            disabled={!complimentIsValid}
            onPress={handleSendCompliment}>
            <Text style={styles.primaryActionText}>Send Compliment</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[styles.section, !last && styles.sectionDivider]}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
    <View style={styles.softChip}>
      <Text style={styles.softChipText}>{text}</Text>
    </View>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.factRow}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function BulletLine({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bodyText}>{text}</Text>
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
    <Pressable style={styles.footerAction} onPress={onPress}>
      <Ionicons name={icon} size={typography.subtitle} color={palette.textPrimary} />
      <Text style={styles.footerActionText}>{label}</Text>
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
        { width: size, height: size, borderRadius: size / 2, backgroundColor, transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}>
      <Ionicons name={icon} size={size * 0.42} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
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
  circleButton: {
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
    color: palette.textPrimary,
  },
  bodyText: {
    fontSize: typography.body,
    lineHeight: spacing.xl,
    color: palette.textSecondary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  softChip: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.chipSurfaceSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    minHeight: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  softChipText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  factLabel: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    flexShrink: 0,
  },
  factValue: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    textAlign: 'right',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletDot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    marginTop: spacing.xs,
  },
  footerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  footerActionText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  stickyActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
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
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  sheetTitle: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  complimentComposer: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.body,
    color: palette.textPrimary,
  },
  counterText: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    textAlign: 'right',
  },
  primaryAction: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  primaryActionText: {
    fontSize: typography.button,
    fontWeight: '700',
    color: '#ffffff',
  },
});
