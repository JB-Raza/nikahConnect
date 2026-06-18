import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FilterButton from '@/components/filter-button';
import ProfileCard from '@/components/profile-card';
import {
  forYouSections,
  historyFilters,
  historyResults,
  type ExploreProfile,
  type ForYouSection,
  type HistoryFilterId,
} from '@/features/explore/data';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type ExploreTab = 'forYou' | 'history';
const TABS: ExploreTab[] = ['forYou', 'history'];

export default function ExploreTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<ExploreTab>('forYou');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilterId>('favourited');
  const pagerRef = useRef<ScrollView>(null);

  const tabBarWidth = width - spacing.lg * 2;
  const tabWidth = tabBarWidth / TABS.length;
  const indicatorWidth = tabWidth * 0.52;
  const indicatorInset = (tabWidth - indicatorWidth) / 2;
  const indicatorX = useSharedValue(spacing.lg + indicatorInset);

  const carouselCardWidth = Math.round(width * 0.4);
  const gridCardWidth = Math.round((width - spacing.lg * 2 - spacing.sm) / 2);

  const openProfile = (id: string) => router.push(`/profile/${id}`);

  const goToTab = useCallback(
    (tab: ExploreTab, animated = true) => {
      const index = TABS.indexOf(tab);
      setActiveTab(tab);
      pagerRef.current?.scrollTo({ x: index * width, animated });
      indicatorX.value = withTiming(spacing.lg + index * tabWidth + indicatorInset, { duration: 280 });
    },
    [indicatorInset, indicatorX, tabWidth, width],
  );

  useEffect(() => {
    const index = TABS.indexOf(activeTab);
    indicatorX.value = withTiming(spacing.lg + index * tabWidth + indicatorInset, { duration: 280 });
  }, [activeTab, indicatorInset, indicatorX, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const onPagerScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const nextTab = TABS[index] ?? 'forYou';
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.background, paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Explore</Text>
        <FilterButton />
      </View>

      <View style={styles.tabBar}>
        <View style={styles.tabButtonsRow}>
          <TabButton label="For You" active={activeTab === 'forYou'} onPress={() => goToTab('forYou')} />
          <TabButton label="My History" active={activeTab === 'history'} onPress={() => goToTab('history')} />
        </View>
        <Animated.View style={[styles.tabIndicator, { width: indicatorWidth }, indicatorStyle]} />
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onPagerScrollEnd}
        style={styles.flex}>
        <View style={{ width, flex: 1 }}>
          <ForYouTab cardWidth={carouselCardWidth} bottomInset={insets.bottom} onOpenProfile={openProfile} />
        </View>
        <View style={{ width, flex: 1 }}>
          <HistoryTab
            activeFilter={historyFilter}
            onSelectFilter={setHistoryFilter}
            cardWidth={gridCardWidth}
            bottomInset={insets.bottom}
            onOpenProfile={openProfile}
          />
        </View>
      </ScrollView>
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

function HistoryTab({
  activeFilter,
  onSelectFilter,
  cardWidth,
  bottomInset,
  onOpenProfile,
}: {
  activeFilter: HistoryFilterId;
  onSelectFilter: (id: HistoryFilterId) => void;
  cardWidth: number;
  bottomInset: number;
  onOpenProfile: (id: string) => void;
}) {
  const results = historyResults[activeFilter];
  const activeLabel = historyFilters.find((filter) => filter.id === activeFilter)?.label ?? '';

  return (
    <View style={styles.flex}>
      <FlatList
        data={historyFilters}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.chipsList}
        contentContainerStyle={styles.chipsContent}
        renderItem={({ item }) => {
          const active = item.id === activeFilter;
          const count = historyResults[item.id].length;
          return (
            <Pressable
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
        }}
      />

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
      <Text style={[styles.tabLabel, { color: active ? palette.textPrimary : palette.textSecondary }]}>{label}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.title,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  tabBar: {
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
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
    backgroundColor: palette.primary,
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
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
