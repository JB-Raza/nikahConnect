import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/theme';

import { type OnboardingForm, type Step } from './config';

const palette = colors.light;

/** Produces the right-aligned preview for a sheet-backed field, or null when empty. */
export function formatFieldValue(step: Step, form: OnboardingForm): string | null {
  if (step.kind === 'chipGroups') {
    const parts = (step.groups ?? []).map((group) => form[group.field] as string | null);
    if (parts.some((part) => !part)) return null;
    return parts.join('  ·  ');
  }

  if (step.field) {
    const value = form[step.field];
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      if (value.length <= 2) return value.join(', ');
      return `${value.length} selected`;
    }
    return (value as string | null) ?? null;
  }

  return null;
}

type FieldRowProps = {
  itemKey: string;
  label: string;
  value: string | null;
  onPress: (key: string) => void;
  error?: boolean;
  errorText?: string | null;
};

// Memoized so editing one field doesn't re-render every other row on the screen.
function FieldRow({ itemKey, label, value, onPress, error, errorText }: FieldRowProps) {
  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.row, error && styles.rowError, pressed && styles.rowPressed]}
        onPress={() => onPress(itemKey)}>
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
        <View style={styles.valueWrap}>
          <Text style={[styles.value, !value && styles.placeholder, error && styles.valueError]} numberOfLines={1}>
            {value ?? 'Select'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={error ? palette.danger : palette.textSecondary} />
        </View>
      </Pressable>
      {error && errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

export default memo(FieldRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  rowPressed: { opacity: 0.6 },
  rowError: {
    borderWidth: 1,
    borderColor: palette.danger,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(187,47,47,0.05)',
  },
  label: { flexShrink: 0, fontSize: typography.subtitle, fontWeight: '700', color: palette.textPrimary },
  labelError: { color: palette.danger },
  valueWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.xs },
  value: { flexShrink: 1, fontSize: typography.body, fontWeight: '600', color: palette.textPrimary, textAlign: 'right' },
  placeholder: { color: palette.textSecondary, fontWeight: '500' },
  valueError: { color: palette.danger },
  errorText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.danger,
    marginTop: spacing.xxs,
    marginLeft: spacing.xs,
  },
});
