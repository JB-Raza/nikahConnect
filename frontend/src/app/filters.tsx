import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientButton from '@/components/gradient-button';
import RangeSlider from '@/components/range-slider';
import {
  AGE_MAX,
  AGE_MIN,
  FILTER_SECTIONS,
  formatFieldValue,
  isFieldActive,
  type FilterFieldConfig,
  type FilterSection,
} from '@/features/filters/config';
import { useFilters } from '@/features/filters/filters-context';
import { usePremium } from '@/features/premium/premium-context';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;
const VERIFIED_COLOR = '#2f9bed';
const BADGE_COLOR = '#ef4f6b';

export default function FiltersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = usePremium();
  const { draft, setDraftField, syncDraftFromApplied, applyDraft, clearDraft } = useFilters();

  useEffect(() => {
    syncDraftFromApplied();
  }, [syncDraftFromApplied]);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/marriage');
    }
  };

  const handleApply = () => {
    applyDraft();
    dismiss();
  };

  const openPicker = (fieldId: string) => {
    router.push({ pathname: '/filter-option', params: { field: fieldId } });
  };

  const openPremium = () => router.push('/premium');

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={dismiss} hitSlop={10} style={styles.headerSide}>
          <Ionicons name="close" size={26} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Filters</Text>
        <Pressable onPress={clearDraft} hitSlop={10} style={[styles.headerSide, styles.headerSideRight]}>
          <Text style={styles.clearAllText}>Clear all</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + sizing.buttonHeight + spacing.xxl }}>
        {FILTER_SECTIONS.map((section) => (
          <SectionView
            key={section.id}
            section={section}
            draft={draft}
            setDraftField={setDraftField}
            openPicker={openPicker}
            locked={!!section.premium && !isPremium}
            openPremium={openPremium}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <GradientButton label="Apply" onPress={handleApply} style={styles.applyButton} />
      </View>
    </View>
  );
}

function SectionView({
  section,
  draft,
  setDraftField,
  openPicker,
  locked,
  openPremium,
}: {
  section: FilterSection;
  draft: ReturnType<typeof useFilters>['draft'];
  setDraftField: ReturnType<typeof useFilters>['setDraftField'];
  openPicker: (fieldId: string) => void;
  locked: boolean;
  openPremium: () => void;
}) {
  const isBasics = section.id === 'basics';

  return (
    <View>
      {section.bigTitle ? (
        <View style={styles.bigTitleRow}>
          {section.bigTitleIcon ? <Ionicons name={section.bigTitleIcon} size={22} color={palette.warning} /> : null}
          <Text style={styles.bigTitle}>{section.bigTitle}</Text>
          {locked ? (
            <View style={styles.premiumPill}>
              <Ionicons name="lock-closed" size={12} color={palette.premiumAccent} />
              <Text style={styles.premiumPillText}>Premium</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {locked && section.bigTitle ? (
        <Pressable style={styles.upgradeCard} onPress={openPremium}>
          <View style={styles.upgradeIcon}>
            <Ionicons name="sparkles" size={20} color={palette.premiumAccent} />
          </View>
          <View style={styles.upgradeText}>
            <Text style={styles.upgradeTitle}>Unlock advanced filters</Text>
            <Text style={styles.upgradeBody}>Go Premium to filter by activity, background, future plans and more.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.premiumAccent} />
        </Pressable>
      ) : null}

      {section.heading ? <Text style={styles.sectionHeading}>{section.heading}</Text> : null}

      <View style={isBasics ? styles.basicsBlock : styles.card}>
        {section.fields.map((field, index) => {
          const isLast = index === section.fields.length - 1;

          if (locked) {
            return (
              <FilterRow
                key={field.id}
                field={field}
                value="Premium"
                active={false}
                isLast={isLast}
                locked
                onPress={openPremium}
              />
            );
          }

          if (field.kind === 'ageRange') {
            const range = (draft[field.id] as [number, number]) ?? [AGE_MIN, AGE_MAX];
            return (
              <View key={field.id} style={[styles.ageBlock, !isLast && styles.rowDivider]}>
                <View style={styles.ageHeaderRow}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>
                    {range[0]}-{range[1]} years
                  </Text>
                </View>
                <RangeSlider
                  min={field.min ?? AGE_MIN}
                  max={field.max ?? AGE_MAX}
                  low={range[0]}
                  high={range[1]}
                  onChange={(low, high) => setDraftField(field.id, [low, high])}
                />
              </View>
            );
          }

          return (
            <FilterRow
              key={field.id}
              field={field}
              value={formatFieldValue(field, draft[field.id])}
              active={isFieldActive(field, draft[field.id])}
              isLast={isLast}
              onPress={() => openPicker(field.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

function FilterRow({
  field,
  value,
  active,
  isLast,
  onPress,
  locked = false,
}: {
  field: FilterFieldConfig;
  value: string;
  active: boolean;
  isLast: boolean;
  onPress: () => void;
  locked?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
      onPress={onPress}>
      <View style={styles.rowText}>
        <View style={styles.rowLabelLine}>
          <Text style={[styles.fieldLabel, locked && { color: palette.textSecondary }]}>{field.label}</Text>
          {field.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{field.badge}</Text>
            </View>
          ) : null}
          {field.verified ? <Ionicons name="checkmark-circle" size={16} color={VERIFIED_COLOR} /> : null}
        </View>
        {!locked ? (
          <Text style={[styles.fieldValue, active && { color: palette.primary, fontWeight: '700' }]}>{value}</Text>
        ) : null}
      </View>
      <Ionicons
        name={locked ? 'lock-closed' : 'chevron-forward'}
        size={locked ? 16 : 20}
        color={locked ? palette.premiumAccent : palette.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: palette.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  headerSide: {
    minWidth: 80,
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  clearAllText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  basicsBlock: {
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: '#0c1712',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  bigTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  bigTitle: {
    fontSize: typography.title,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  sectionHeading: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.warning,
    letterSpacing: 0.3,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: palette.premiumSurface,
    borderWidth: 1,
    borderColor: palette.premiumBorder,
  },
  premiumPillText: {
    fontSize: typography.label,
    fontWeight: '800',
    color: palette.premiumAccent,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.premiumSurface,
    borderWidth: 1,
    borderColor: palette.premiumBorder,
  },
  upgradeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: {
    flex: 1,
    gap: 2,
  },
  upgradeTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  upgradeBody: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    lineHeight: 17,
  },
  ageBlock: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  ageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowLabelLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  fieldValue: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  badge: {
    backgroundColor: BADGE_COLOR,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: typography.label,
    fontWeight: '800',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  applyButton: {
    alignSelf: 'stretch',
  },
});
