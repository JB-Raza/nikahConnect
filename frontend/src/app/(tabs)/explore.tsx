import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientHeader from '@/components/gradient-header';
import ProfileCard from '@/components/profile-card';
import {
  forYouSections,
  historyFilters,
  historySorts,
  sortHistory,
  type ExploreProfile,
  type ForYouSection,
  type HistoryFilterId,
  type HistorySortId,
} from '@/features/explore/data';
import { hapticSelection } from '@/features/haptics';
import { useProfileActions } from '@/features/profile/profile-actions-context';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type ExploreTab = 'forYou' | 'history';
const TABS: ExploreTab[] = ['forYou', 'history'];

export default function ExploreTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { getHistory } = useProfileActions();

  const [activeTab, setActiveTab] = useState<ExploreTab>('forYou');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilterId>('favourited');
  const [historySort, setHistorySort] = useState<HistorySortId>('recent');

  const sortSheetRef = useRef<BottomSheetModal>(null);
  const openSortSheet = () => sortSheetRef.current?.present();
  const selectSort = (sort: HistorySortId) => {
    setHistorySort(sort);
    sortSheetRef.current?.dismiss();
  };

  const tabBarWidth = width - spacing.lg * 2;
  const tabWidth = tabBarWidth / TABS.length;
  const indicatorWidth = tabWidth * 0.52;
  const indicatorInset = (tabWidth - indicatorWidth) / 2;
  const indicatorX = useSharedValue(indicatorInset);

  const carouselCardWidth = Math.round(width * 0.4);
  const gridCardWidth = Math.round((width - spacing.lg * 2 - spacing.sm) / 2);

  const openProfile = (id: string) => router.push(`/profile/${id}`);

  const goToTab = useCallback(
    (tab: ExploreTab) => {
      hapticSelection();
      setActiveTab(tab);
      const index = TABS.indexOf(tab);
      indicatorX.value = withTiming(index * tabWidth + indicatorInset, { duration: 280 });
    },
    [indicatorInset, indicatorX, tabWidth],
  );

  useEffect(() => {
    const index = TABS.indexOf(activeTab);
    indicatorX.value = withTiming(index * tabWidth + indicatorInset, { duration: 280 });
  }, [activeTab, indicatorInset, indicatorX, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <GradientHeader
        title="Explore"
        right={
          activeTab === 'history' ? (
            <Pressable style={styles.sortButton} onPress={openSortSheet} accessibilityLabel="Sort history">
              <Ionicons name="filter" size={16} color="#ffffff" />
              <Text style={styles.sortButtonText}>
                {historySorts.find((option) => option.id === historySort)?.label ?? 'Sort'}
              </Text>
            </Pressable>
          ) : undefined
        }>
        <View style={styles.tabBar}>
          <View style={styles.tabButtonsRow}>
            <TabButton label="For You" active={activeTab === 'forYou'} onPress={() => goToTab('forYou')} />
            <TabButton label="My History" active={activeTab === 'history'} onPress={() => goToTab('history')} />
          </View>
          <Animated.View style={[styles.tabIndicator, { width: indicatorWidth }, indicatorStyle]} />
        </View>
      </GradientHeader>

      {activeTab === 'history' ? (
        <HistoryFilterStrip activeFilter={historyFilter} onSelectFilter={setHistoryFilter} getHistory={getHistory} />
      ) : null}

      <View style={styles.flex}>
        {activeTab === 'forYou' ? (
          <ForYouTab cardWidth={carouselCardWidth} bottomInset={insets.bottom} onOpenProfile={openProfile} />
        ) : (
          <HistoryTab
            activeFilter={historyFilter}
            sort={historySort}
            cardWidth={gridCardWidth}
            bottomInset={insets.bottom}
            onOpenProfile={openProfile}
            getHistory={getHistory}
          />
        )}
      </View>

      <HistorySortSheet ref={sortSheetRef} activeSort={historySort} onSelect={selectSort} />
    </View>
  );
}

function ForYouTab({
  cardWidth,
  bottomInset,
  onOpenProfile,
}: {
  cardWidth: number;
  bottomInset: number;
  onOpenProfile: (id: string) => void;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: bottomInset + spacing.xxl }}>
      {forYouSections.map((section) => (
        <SectionView key={section.id} section={section} cardWidth={cardWidth} onOpenProfile={onOpenProfile} />
      ))}
    </ScrollView>
  );
}

const HistorySortSheet = forwardRef<BottomSheetModal, { activeSort: HistorySortId; onSelect: (id: HistorySortId) => void }>(
  function HistorySortSheet({ activeSort, onSelect }, ref) {
    const insets = useSafeAreaInsets();
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: palette.border }}
        backgroundStyle={{ backgroundColor: palette.surface }}>
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.sheetTitle}>Sort by</Text>
          {historySorts.map((option) => {
            const active = option.id === activeSort;
            return (
              <Pressable
                key={option.id}
                style={({ pressed }) => [styles.sortRow, pressed && styles.sortRowPressed]}
                onPress={() => onSelect(option.id)}>
                <Ionicons
                  name={option.icon as React.ComponentProps<typeof Ionicons>['name']}
                  size={20}
                  color={active ? palette.primary : palette.textSecondary}
                />
                <Text style={[styles.sortLabel, active && styles.sortLabelActive]}>{option.label}</Text>
                {active ? <Ionicons name="checkmark" size={20} color={palette.primary} /> : null}
              </Pressable>
            );
          })}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

function SectionView({
  section,
  cardWidth,
  onOpenProfile,
}: {
  section: ForYouSection;
  cardWidth: number;
  onOpenProfile: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.subtitle ? <Text style={styles.sectionSubtitle}>{section.subtitle}</Text> : null}
      </View>

      {section.layout === 'twoRow' ? (
        <TwoRowCarousel data={section.data} cardWidth={cardWidth} onOpenProfile={onOpenProfile} />
      ) : (
        <FlatList
          horizontal
          data={section.data}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          initialNumToRender={4}
          renderItem={({ item }) => <ProfileCard {...item} width={cardWidth} onPress={() => onOpenProfile(item.id)} />}
        />
      )}
    </View>
  );
}

function TwoRowCarousel({
  data,
  cardWidth,
  onOpenProfile,
}: {
  data: ExploreProfile[];
  cardWidth: number;
  onOpenProfile: (id: string) => void;
}) {
  const columns = useMemo(() => {
    const result: ExploreProfile[][] = [];
    for (let index = 0; index < data.length; index += 2) {
      result.push(data.slice(index, index + 2));
    }
    return result;
  }, [data]);

  return (
    <FlatList
      horizontal
      data={columns}
      keyExtractor={(_, index) => `col-${index}`}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContent}
      renderItem={({ item }) => (
        <View style={styles.twoRowColumn}>
          {item.map((profile) => (
            <ProfileCard key={profile.id} {...profile} width={cardWidth} onPress={() => onOpenProfile(profile.id)} />
          ))}
        </View>
      )}
    />
  );
}

function HistoryFilterStrip({
  activeFilter,
  onSelectFilter,
  getHistory,
}: {
  activeFilter: HistoryFilterId;
  onSelectFilter: (id: HistoryFilterId) => void;
  getHistory: (filter: HistoryFilterId) => ExploreProfile[];
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      style={styles.chipsList}
      contentContainerStyle={styles.chipsContent}>
      {historyFilters.map((item) => {
        const active = item.id === activeFilter;
        const count = getHistory(item.id).length;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelectFilter(item.id)}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
            <Ionicons
              name={item.icon as React.ComponentProps<typeof Ionicons>['name']}
              size={15}
              color={active ? palette.textOnPrimary : palette.textSecondary}
            />
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
      })}
    </ScrollView>
  );
}

function HistoryTab({
  activeFilter,
  sort,
  cardWidth,
  bottomInset,
  onOpenProfile,
  getHistory,
}: {
  activeFilter: HistoryFilterId;
  sort: HistorySortId;
  cardWidth: number;
  bottomInset: number;
  onOpenProfile: (id: string) => void;
  getHistory: (filter: HistoryFilterId) => ExploreProfile[];
}) {
  const results = useMemo(() => sortHistory(getHistory(activeFilter), sort), [getHistory, activeFilter, sort]);
  const activeLabel = historyFilters.find((filter) => filter.id === activeFilter)?.label ?? '';

  return (
    <View style={styles.flex}>
      {results.length > 0 ? (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: bottomInset + spacing.xxl }}
          renderItem={({ item }) => <ProfileCard {...item} width={cardWidth} onPress={() => onOpenProfile(item.id)} />}
        />
      ) : (
        <HistoryEmptyState label={activeLabel} />
      )}
    </View>
  );
}

function HistoryEmptyState({ label }: { label: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="albums-outline" size={30} color={palette.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Nothing here yet</Text>
      <Text style={styles.emptyBody}>You haven&apos;t {label.toLowerCase()} anyone yet. They&apos;ll show up here once you do.</Text>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabLabel, { color: active ? '#ffffff' : 'rgba(255,255,255,0.7)' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  sortButtonText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: '#ffffff',
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.xxs,
  },
  sheetTitle: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  sortRowPressed: {
    opacity: 0.6,
  },
  sortLabel: {
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  sortLabelActive: {
    color: palette.primary,
  },
  tabBar: {
    marginTop: spacing.xs,
  },
  tabButtonsRow: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  tabLabel: {
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: 2,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  carouselContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  twoRowColumn: {
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  chipsList: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexShrink: 0,
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
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
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
