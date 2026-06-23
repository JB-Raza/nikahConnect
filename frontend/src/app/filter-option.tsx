import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientHeader from '@/components/gradient-header';
import { getField } from '@/features/filters/config';
import { useFilters } from '@/features/filters/filters-context';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function FilterOptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { field: fieldId } = useLocalSearchParams<{ field: string }>();
  const { draft, setDraftField } = useFilters();

  const field = fieldId ? getField(fieldId) : undefined;

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/filters');
    }
  };

  if (!field || !field.options) {
    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <GradientHeader title="Filter" onBack={dismiss} align="center" />
        <Text style={styles.emptyText}>This filter is unavailable.</Text>
      </View>
    );
  }

  const isMulti = field.kind === 'multi';
  const selected = isMulti ? (draft[field.id] as string[]) ?? [] : [];
  const currentSingle = !isMulti ? (draft[field.id] as string) : '';

  const handleSelectSingle = (option: string) => {
    setDraftField(field.id, option);
    dismiss();
  };

  const handleToggleMulti = (option: string) => {
    const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
    setDraftField(field.id, next);
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <GradientHeader
        title={field.label}
        onBack={dismiss}
        align="center"
        right={
          isMulti ? (
            <Pressable onPress={dismiss} hitSlop={10}>
              <Text style={styles.headerRightText}>Done</Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}>
        <View style={styles.card}>
          {field.options.map((option, index) => {
            const isLast = index === field.options!.length - 1;
            const active = isMulti ? selected.includes(option) : currentSingle === option;
            return (
              <Pressable
                key={option}
                style={({ pressed }) => [styles.row, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
                onPress={() => (isMulti ? handleToggleMulti(option) : handleSelectSingle(option))}>
                <Text style={[styles.optionText, active && { color: palette.primary, fontWeight: '700' }]}>{option}</Text>
                {active ? (
                  <Ionicons name={isMulti ? 'checkbox' : 'checkmark'} size={isMulti ? 22 : 24} color={palette.primary} />
                ) : isMulti ? (
                  <Ionicons name="square-outline" size={22} color={palette.textSecondary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerRightText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#ffffff',
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: sizing.buttonHeight,
    paddingVertical: spacing.sm,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  optionText: {
    fontSize: typography.subtitle,
    fontWeight: '500',
    color: palette.textPrimary,
  },
  emptyText: {
    fontSize: typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
