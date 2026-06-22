import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { type ComponentProps, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type NativeSyntheticEvent, type TextInputKeyPressEventData } from 'react-native';

import ProfilePhotoGrid from '@/components/profile-photo-grid';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

import {
  MIN_AGE,
  type IoniconName,
  type Option,
  type OnboardingForm,
  type Step,
} from './config';

const palette = colors.light;

type StepBodyProps = {
  step: Step;
  form: OnboardingForm;
  age: number | null;
  patch: (partial: Partial<OnboardingForm>) => void;
  onSelectSingle: (field: keyof OnboardingForm, value: string) => void;
  onSetGroup: (field: keyof OnboardingForm, value: string) => void;
  onToggleMulti: (field: keyof OnboardingForm, value: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (uri: string) => void;
  /** Total horizontal padding wrapping the photo grid, so tiles size correctly. */
  photoContentPadding?: number;
  /** When true, highlight missing required inputs in red (after a failed submit). */
  error?: boolean;
};

export default function StepBody({
  step,
  form,
  age,
  patch,
  onSelectSingle,
  onSetGroup,
  onToggleMulti,
  onAddPhoto,
  onRemovePhoto,
  photoContentPadding,
  error,
}: StepBodyProps) {
  const [query, setQuery] = useState('');

  if (step.kind === 'name') {
    return (
      <View style={styles.gap}>
        <LabeledInput
          label="First name"
          placeholder="First name"
          autoCapitalize="words"
          value={form.firstName}
          onChangeText={(value) => patch({ firstName: value })}
          error={error && form.firstName.trim().length < 2}
        />
        <LabeledInput
          label="Last name"
          placeholder="Last name"
          autoCapitalize="words"
          value={form.lastName}
          onChangeText={(value) => patch({ lastName: value })}
          error={error && form.lastName.trim().length < 1}
        />
      </View>
    );
  }

  if (step.kind === 'gender') {
    return (
      <View style={styles.genderRow}>
        <GenderCard label="Male" icon="male" selected={form.gender === 'male'} error={error} onPress={() => onSelectSingle('gender', 'male')} />
        <GenderCard label="Female" icon="female" selected={form.gender === 'female'} error={error} onPress={() => onSelectSingle('gender', 'female')} />
      </View>
    );
  }

  if (step.kind === 'dob') {
    return <DobStep form={form} age={age} patch={patch} error={error} />;
  }

  if (step.kind === 'location') {
    return (
      <View style={styles.gap}>
        <LabeledInput
          label="City"
          placeholder="e.g. Lahore"
          value={form.city}
          onChangeText={(value) => patch({ city: value })}
          error={error && form.city.trim().length < 2}
        />
        <LabeledInput
          label="Country"
          placeholder="e.g. Pakistan"
          value={form.country}
          onChangeText={(value) => patch({ country: value })}
          error={error && form.country.trim().length < 2}
        />
        <LabeledInput
          label="Address (optional)"
          placeholder="Area or street"
          value={form.address}
          onChangeText={(value) => patch({ address: value })}
        />
        <Pressable
          style={styles.locateButton}
          onPress={() =>
            patch({ city: form.city.trim() ? form.city : 'Lahore', country: form.country.trim() ? form.country : 'Pakistan' })
          }>
          <Ionicons name="navigate" size={16} color={palette.primary} />
          <Text style={styles.locateText}>Use my current location</Text>
        </Pressable>
      </View>
    );
  }

  if (step.kind === 'select') {
    const options = step.options ?? [];
    const selected = step.field ? (form[step.field] as string | null) : null;
    const q = query.trim().toLowerCase();
    const filtered = step.searchable && q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
    return (
      <View>
        {step.searchable ? <SearchField value={query} onChange={setQuery} placeholder={step.searchPlaceholder} /> : null}
        <View style={styles.plainList}>
          {filtered.map((option) => (
            <SelectRow
              key={option.value}
              label={option.label}
              selected={selected === option.value}
              onPress={() => step.field && onSelectSingle(step.field, option.value)}
            />
          ))}
        </View>
      </View>
    );
  }

  if (step.kind === 'cards') {
    const selected = step.field ? (form[step.field] as string | null) : null;
    return (
      <View style={styles.cardList}>
        {(step.options ?? []).map((option) => (
          <ChoiceCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={selected === option.value}
            onPress={() => step.field && onSelectSingle(step.field, option.value)}
          />
        ))}
      </View>
    );
  }

  if (step.kind === 'checkbox') {
    const options = step.options ?? [];
    const values = step.field ? (form[step.field] as string[]) : [];
    const q = query.trim().toLowerCase();

    const row = (option: Option) => (
      <CheckboxRow
        key={option.value}
        label={option.label}
        flag={option.flag}
        checked={values.includes(option.value)}
        onPress={() => step.field && onToggleMulti(step.field, option.value)}
      />
    );

    if (q) {
      const filtered = options.filter((o) => o.label.toLowerCase().includes(q));
      return (
        <View>
          <SearchField value={query} onChange={setQuery} placeholder={step.searchPlaceholder} />
          <View style={styles.checkList}>{filtered.map(row)}</View>
        </View>
      );
    }

    if (step.suggested?.length) {
      const suggested = options.filter((o) => step.suggested?.includes(o.value));
      const rest = options.filter((o) => !step.suggested?.includes(o.value));
      return (
        <View>
          <SearchField value={query} onChange={setQuery} placeholder={step.searchPlaceholder} />
          <SectionLabel text="Suggested" />
          <View style={styles.checkList}>{suggested.map(row)}</View>
          <SectionLabel text="All" />
          <View style={styles.checkList}>{rest.map(row)}</View>
        </View>
      );
    }

    return (
      <View>
        {step.searchable ? <SearchField value={query} onChange={setQuery} placeholder={step.searchPlaceholder} /> : null}
        <View style={styles.checkList}>{options.map(row)}</View>
      </View>
    );
  }

  if (step.kind === 'chips') {
    const values = step.field ? (form[step.field] as string[]) : [];
    return (
      <View style={styles.chipWrap}>
        {(step.options ?? []).map((option) => (
          <Capsule
            key={option.value}
            label={option.label}
            selected={values.includes(option.value)}
            onPress={() => step.field && onToggleMulti(step.field, option.value)}
          />
        ))}
      </View>
    );
  }

  if (step.kind === 'chipCategories') {
    const values = step.field ? (form[step.field] as string[]) : [];
    return (
      <View style={styles.groupGap}>
        {(step.categories ?? []).map((category) => (
          <View key={category.label} style={styles.group}>
            <View style={styles.categoryHeader}>
              {category.icon ? <Ionicons name={category.icon} size={15} color={palette.primary} /> : null}
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </View>
            <View style={styles.chipWrap}>
              {category.options.map((option) => (
                <Capsule
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={values.includes(option.value)}
                  onPress={() => step.field && onToggleMulti(step.field, option.value)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (step.kind === 'chipGroups') {
    return (
      <View style={styles.groupGap}>
        {(step.groups ?? []).map((group) => {
          const selected = form[group.field] as string | null;
          return (
            <View key={String(group.field)} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.chipWrap}>
                {group.options.map((option) => (
                  <Capsule
                    key={option.value}
                    label={option.label}
                    icon={group.icon}
                    selected={selected === option.value}
                    onPress={() => onSetGroup(group.field, option.value)}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  if (step.kind === 'bio') {
    return <BioField value={form.bio} onCommit={(value) => patch({ bio: value })} />;
  }

  if (step.kind === 'photos') {
    return (
      <ProfilePhotoGrid
        photos={form.photos}
        onAddPhoto={onAddPhoto}
        onRemovePhoto={onRemovePhoto}
        contentPadding={photoContentPadding}
      />
    );
  }

  return null;
}

function DobStep({
  form,
  age,
  patch,
  error,
}: {
  form: OnboardingForm;
  age: number | null;
  patch: (partial: Partial<OnboardingForm>) => void;
  error?: boolean;
}) {
  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const valid = age !== null && age >= MIN_AGE;

  const updateDob = (key: 'day' | 'month' | 'year', value: string) => {
    const digits = value.replace(/\D/g, '');
    patch({ dob: { ...form.dob, [key]: digits } });
    if (key === 'day' && digits.length === 2) {
      monthRef.current?.focus();
    } else if (key === 'month' && digits.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleBackspace = (key: 'month' | 'year') => (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (event.nativeEvent.key !== 'Backspace') {
      return;
    }
    if (key === 'month' && form.dob.month.length === 0) {
      patch({ dob: { ...form.dob, day: form.dob.day.slice(0, -1) } });
      dayRef.current?.focus();
    } else if (key === 'year' && form.dob.year.length === 0) {
      patch({ dob: { ...form.dob, month: form.dob.month.slice(0, -1) } });
      monthRef.current?.focus();
    }
  };

  return (
    <View style={styles.gap}>
      <View style={styles.dobRow}>
        <DobField
          ref={dayRef}
          label="Day"
          placeholder="DD"
          maxLength={2}
          value={form.dob.day}
          onChangeText={(v) => updateDob('day', v)}
          error={error && !valid}
        />
        <DobField
          ref={monthRef}
          label="Month"
          placeholder="MM"
          maxLength={2}
          value={form.dob.month}
          onChangeText={(v) => updateDob('month', v)}
          onKeyPress={handleBackspace('month')}
          error={error && !valid}
        />
        <DobField
          ref={yearRef}
          label="Year"
          placeholder="YYYY"
          maxLength={4}
          value={form.dob.year}
          onChangeText={(v) => updateDob('year', v)}
          onKeyPress={handleBackspace('year')}
          flex={1.4}
          error={error && !valid}
        />
      </View>
      <View style={styles.agePreview}>
        <Ionicons
          name={valid ? 'checkmark-circle' : error ? 'alert-circle' : 'information-circle-outline'}
          size={16}
          color={valid ? palette.success : error ? palette.danger : palette.textSecondary}
        />
        <Text style={[styles.agePreviewText, error && !valid && styles.agePreviewError]}>
          {age === null
            ? 'Enter a valid date of birth.'
            : age < MIN_AGE
              ? `You must be at least ${MIN_AGE} years old.`
              : `You are ${age} years old.`}
        </Text>
      </View>
    </View>
  );
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <View style={styles.searchRow}>
      <Ionicons name="search" size={18} color={palette.textSecondary} />
      <BottomSheetTextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? 'Search'}
        placeholderTextColor={palette.textSecondary}
        autoCorrect={false}
      />
      {value.length ? (
        <Pressable hitSlop={8} onPress={() => onChange('')}>
          <Ionicons name="close-circle" size={18} color={palette.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function SelectRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.selectRow, pressed && styles.rowPressed]} onPress={onPress}>
      <Text style={[styles.selectLabel, selected && styles.selectLabelActive]}>{label}</Text>
      {selected ? (
        <View style={styles.selectCheck}>
          <Ionicons name="checkmark" size={14} color="#ffffff" />
        </View>
      ) : null}
    </Pressable>
  );
}

function ChoiceCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.choiceCard, selected && styles.choiceCardActive]} onPress={onPress}>
      <View style={styles.choiceText}>
        <Text style={[styles.choiceTitle, selected && { color: palette.primary }]}>{label}</Text>
        {description ? <Text style={styles.choiceDescription}>{description}</Text> : null}
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={palette.primary} /> : null}
    </Pressable>
  );
}

function CheckboxRow({
  label,
  flag,
  checked,
  onPress,
}: {
  label: string;
  flag?: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.checkRow, pressed && styles.rowPressed]} onPress={onPress}>
      {flag ? <Text style={styles.flag}>{flag}</Text> : null}
      <Text style={styles.checkLabel}>{label}</Text>
      <View style={[styles.checkbox, checked && styles.checkboxActive]}>
        {checked ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
      </View>
    </Pressable>
  );
}

function Capsule({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon?: IoniconName;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.capsule, selected && styles.capsuleActive]} onPress={onPress}>
      {icon ? <Ionicons name={icon} size={15} color={selected ? '#ffffff' : palette.textSecondary} /> : null}
      <Text style={[styles.capsuleLabel, selected && styles.capsuleLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const COMMIT_DELAY_MS = 300;

/**
 * Buffers a text field's value in local state so each keystroke re-renders only
 * this input — not the whole onboarding form. The value is pushed up to the form
 * on a short debounce (so progress/validation stay roughly live) and flushed
 * immediately on blur. It re-syncs if the form changes externally (e.g. the
 * "Use my current location" button prefilling the field) without clobbering
 * in-progress typing.
 */
function useBufferedText(external: string, onCommit: (value: string) => void) {
  const [text, setText] = useState(external);
  const lastExternal = useRef(external);
  const textRef = useRef(external);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  textRef.current = text;

  useEffect(() => {
    // Only re-sync on genuine external changes — not the echo of our own commit.
    if (external !== lastExternal.current) {
      lastExternal.current = external;
      setText(external);
      textRef.current = external;
    }
  }, [external]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    lastExternal.current = textRef.current;
    onCommit(textRef.current);
  }, [onCommit]);

  const onChange = useCallback(
    (next: string) => {
      setText(next);
      textRef.current = next;
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        timer.current = null;
        lastExternal.current = textRef.current;
        onCommit(textRef.current);
      }, COMMIT_DELAY_MS);
    },
    [onCommit],
  );

  return { text, onChange, flush };
}

function LabeledInput({
  label,
  value = '',
  onChangeText,
  error,
  ...props
}: ComponentProps<typeof TextInput> & { label: string; error?: boolean }) {
  const { text, onChange, flush } = useBufferedText(value as string, (next) => onChangeText?.(next));
  return (
    <View style={styles.labeledField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, error && styles.fieldBoxError]}>
        <TextInput
          style={styles.fieldInput}
          placeholderTextColor={palette.textSecondary}
          {...props}
          value={text}
          onChangeText={onChange}
          onBlur={flush}
          onEndEditing={flush}
        />
      </View>
    </View>
  );
}

function BioField({ value, onCommit }: { value: string; onCommit: (value: string) => void }) {
  const { text, onChange, flush } = useBufferedText(value, onCommit);
  return (
    <View style={styles.gap}>
      <TextInput
        style={styles.bioInput}
        placeholder="I’m someone who values faith, family, and kindness…"
        placeholderTextColor={palette.textSecondary}
        multiline
        maxLength={500}
        textAlignVertical="top"
        value={text}
        onChangeText={onChange}
        onBlur={flush}
        onEndEditing={flush}
      />
      <Text style={styles.bioCounter}>{text.length}/500</Text>
    </View>
  );
}

const DobField = forwardRef<TextInput, ComponentProps<typeof TextInput> & { label: string; flex?: number; error?: boolean }>(
  ({ label, flex = 1, error, ...props }, ref) => {
    return (
      <View style={[styles.labeledField, { flex }]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[styles.fieldBox, error && styles.fieldBoxError]}>
          <TextInput
            ref={ref}
            style={[styles.fieldInput, styles.dobInput]}
            placeholderTextColor={palette.textSecondary}
            keyboardType="number-pad"
            {...props}
          />
        </View>
      </View>
    );
  },
);
DobField.displayName = 'DobField';

function GenderCard({
  label,
  icon,
  selected,
  error,
  onPress,
}: {
  label: string;
  icon: IoniconName;
  selected: boolean;
  error?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.genderCard, selected && styles.genderCardActive, error && !selected && styles.genderCardError]}
      onPress={onPress}>
      <View style={[styles.genderIcon, selected && styles.genderIconActive]}>
        <Ionicons name={icon} size={26} color={selected ? '#ffffff' : palette.primary} />
      </View>
      <Text style={[styles.genderLabel, selected && { color: palette.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gap: { gap: spacing.md },
  groupGap: { gap: spacing.xl },
  group: { gap: spacing.sm },
  groupLabel: { fontSize: typography.subtitle, fontWeight: '800', color: palette.textPrimary },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  categoryLabel: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderBottomWidth: 1.5,
    borderBottomColor: palette.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: typography.subtitle, fontWeight: '500', color: palette.textPrimary, paddingVertical: spacing.xs },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  plainList: {},
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  rowPressed: { opacity: 0.6 },
  selectLabel: { flex: 1, fontSize: typography.subtitle, fontWeight: '700', color: palette.textPrimary },
  selectLabelActive: { color: palette.primary },
  selectCheck: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardList: { gap: spacing.sm },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  choiceCardActive: { borderColor: palette.primary, backgroundColor: palette.chipSurfaceSoft },
  choiceText: { flex: 1, gap: 2 },
  choiceTitle: { fontSize: typography.subtitle, fontWeight: '800', color: palette.textPrimary },
  choiceDescription: { fontSize: typography.caption, fontWeight: '500', color: palette.textSecondary, lineHeight: 18 },
  checkList: {},
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  flag: { fontSize: 22 },
  checkLabel: { flex: 1, fontSize: typography.subtitle, fontWeight: '700', color: palette.textPrimary },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { borderColor: palette.primary, backgroundColor: palette.primary },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  capsuleActive: { borderColor: palette.primary, backgroundColor: palette.primary },
  capsuleLabel: { fontSize: typography.body, fontWeight: '600', color: palette.textPrimary },
  capsuleLabelActive: { color: '#ffffff' },
  labeledField: { gap: spacing.xs },
  fieldLabel: { fontSize: typography.caption, fontWeight: '700', color: palette.textPrimary },
  fieldBox: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  fieldBoxError: { borderColor: palette.danger, backgroundColor: 'rgba(187,47,47,0.05)' },
  fieldInput: { fontSize: typography.body, fontWeight: '600', color: palette.textPrimary, paddingVertical: spacing.sm },
  dobRow: { flexDirection: 'row', gap: spacing.sm },
  dobInput: { textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false, fontSize: typography.subtitle },
  agePreview: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  agePreviewText: { fontSize: typography.caption, fontWeight: '600', color: palette.textSecondary },
  agePreviewError: { color: palette.danger },
  locateButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', paddingVertical: spacing.xs },
  locateText: { fontSize: typography.caption, fontWeight: '700', color: palette.primary },
  genderRow: { flexDirection: 'row', gap: spacing.md },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  genderCardActive: { borderColor: palette.primary, backgroundColor: palette.chipSurfaceSoft },
  genderCardError: { borderColor: palette.danger, backgroundColor: 'rgba(187,47,47,0.05)' },
  genderIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderIconActive: { backgroundColor: palette.primary },
  genderLabel: { fontSize: typography.subtitle, fontWeight: '700', color: palette.textPrimary },
  bioInput: {
    minHeight: 150,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
    fontSize: typography.body,
    fontWeight: '500',
    lineHeight: 22,
    color: palette.textPrimary,
  },
  bioCounter: { fontSize: typography.label, fontWeight: '600', color: palette.textSecondary, alignSelf: 'flex-end' },
});
