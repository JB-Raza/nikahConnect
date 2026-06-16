import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useProfileFilters } from '@/features/filters/use-profile-filters';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type FilterButtonProps = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  onOpened?: () => void;
};

/**
 * Reusable trigger that opens the shared Filters screen and shows the
 * active-filter count. Drop into any screen header (Marriage, Explore, Menu, ...).
 */
export default function FilterButton({ label = 'Filter', style, onOpened }: FilterButtonProps) {
  const { activeCount, openFilters } = useProfileFilters();

  return (
    <Pressable
      style={[styles.pill, style]}
      onPress={() => {
        openFilters();
        onOpened?.();
      }}>
      <Ionicons name="options-outline" size={typography.body} color={palette.textPrimary} />
      <Text style={styles.label}>{label}</Text>
      {activeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
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
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
});
