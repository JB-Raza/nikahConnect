import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientHeader from '@/components/gradient-header';
import { getEditProfileField } from '@/features/profile/edit-profile-fields';
import { useEditProfileDraft } from '@/features/profile/edit-profile-draft-context';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function EditProfileFieldScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { field: fieldKey } = useLocalSearchParams<{ field: string }>();
  const { draft, patchDraft } = useEditProfileDraft();
  const [query, setQuery] = useState('');

  const field = fieldKey ? getEditProfileField(fieldKey) : undefined;

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/edit-profile');
    }
  };

  const options = useMemo(() => {
    if (!field) {
      return [];
    }
    const normalized = query.trim().toLowerCase();
    if (!field.searchable || !normalized) {
      return field.options;
    }
    return field.options.filter((option) => option.toLowerCase().includes(normalized));
  }, [field, query]);

  if (!field || !draft) {
    return (
      <View style={styles.screen}>
        <GradientHeader title="Edit profile" onBack={dismiss} align="center" />
        <Text style={styles.emptyText}>This field is unavailable.</Text>
      </View>
    );
  }

  const currentValue = draft[field.field];

  const handleSelect = (option: string) => {
    patchDraft({ [field.field]: option });
    dismiss();
  };

  return (
    <View style={styles.screen}>
      <GradientHeader title={field.label} onBack={dismiss} align="center" />

      {field.searchable ? (
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={palette.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={field.searchPlaceholder ?? 'Search'}
            placeholderTextColor={palette.textSecondary}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}>
        <View style={styles.card}>
          {options.length > 0 ? (
            options.map((option, index) => {
              const active = currentValue === option;
              const isLast = index === options.length - 1;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [styles.row, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
                  onPress={() => handleSelect(option)}>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
                  {active ? <Ionicons name="checkmark" size={24} color={palette.primary} /> : null}
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No results for “{query.trim()}”.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textPrimary,
    paddingVertical: spacing.sm,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
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
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '500',
    color: palette.textPrimary,
    paddingRight: spacing.sm,
  },
  optionTextActive: {
    color: palette.primary,
    fontWeight: '700',
  },
  emptyRow: {
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
  },
});
