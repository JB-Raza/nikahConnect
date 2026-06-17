import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

import {
  MAX_PHOTOS,
  MIN_BIO,
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
}: StepBodyProps) {
  const [query, setQuery] = useState('');

  if (step.kind === 'name') {
    return (
      <View style={styles.gap}>
        <LabeledInput
          label="First name"
          placeholder="First name"
          autoCapitalize="words"
          autoFocus
          value={form.firstName}
          onChangeText={(value) => patch({ firstName: value })}
        />
        <LabeledInput
          label="Last name"
          placeholder="Last name"
          autoCapitalize="words"
          value={form.lastName}
          onChangeText={(value) => patch({ lastName: value })}
        />
      </View>
    );
  }

  if (step.kind === 'gender') {
    return (
      <View style={styles.genderRow}>
        <GenderCard label="Male" icon="male" selected={form.gender === 'male'} onPress={() => onSelectSingle('gender', 'male')} />
        <GenderCard label="Female" icon="female" selected={form.gender === 'female'} onPress={() => onSelectSingle('gender', 'female')} />
      </View>
    );
  }

  if (step.kind === 'dob') {
    const updateDob = (key: 'day' | 'month' | 'year', value: string) =>
      patch({ dob: { ...form.dob, [key]: value.replace(/\D/g, '') } });
    const valid = age !== null && age >= MIN_AGE;
    return (
      <View style={styles.gap}>
        <View style={styles.dobRow}>
          <DobField label="Day" placeholder="DD" maxLength={2} value={form.dob.day} onChangeText={(v) => updateDob('day', v)} />
          <DobField label="Month" placeholder="MM" maxLength={2} value={form.dob.month} onChangeText={(v) => updateDob('month', v)} />
          <DobField label="Year" placeholder="YYYY" maxLength={4} value={form.dob.year} onChangeText={(v) => updateDob('year', v)} flex={1.4} />
        </View>
        <View style={styles.agePreview}>
          <Ionicons
            name={valid ? 'checkmark-circle' : 'information-circle-outline'}
            size={16}
            color={valid ? palette.success : palette.textSecondary}
          />
          <Text style={styles.agePreviewText}>
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

  if (step.kind === 'location') {
    return (
      <View style={styles.gap}>
        <LabeledInput label="City" placeholder="e.g. Lahore" value={form.city} onChangeText={(value) => patch({ city: value })} />
        <LabeledInput label="Country" placeholder="e.g. Pakistan" value={form.country} onChangeText={(value) => patch({ country: value })} />
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
    const length = form.bio.trim().length;
    return (
      <View style={styles.gap}>
        <TextInput
          style={styles.bioInput}
          placeholder="I’m someone who values faith, family, and kindness…"
          placeholderTextColor={palette.textSecondary}
          multiline
          maxLength={500}
          textAlignVertical="top"
          value={form.bio}
          onChangeText={(value) => patch({ bio: value })}
        />
        <Text style={styles.bioCounter}>
          {length < MIN_BIO ? `${MIN_BIO - length} more characters needed` : `${form.bio.length}/500`}
        </Text>
      </View>
    );
  }

  if (step.kind === 'photos') {
    return (
      <View style={styles.photoGrid}>
        {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
          const uri = form.photos[index];
          if (uri) {
            return (
              <Pressable key={`photo-${index}`} style={styles.photoTile} onPress={() => onRemovePhoto(uri)}>
                <Image source={{ uri }} style={styles.photoImage} resizeMode="cover" />
                {index === 0 ? (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Main</Text>
                  </View>
                ) : null}
                <View style={styles.removeBadge}>
                  <Ionicons name="close" size={14} color="#ffffff" />
                </View>
              </Pressable>
            );
          }
          const isNext = index === form.photos.length;
          return (
            <Pressable
              key={`photo-${index}`}
              style={[styles.photoTile, styles.photoEmpty, isNext && styles.photoEmptyActive]}
              onPress={onAddPhoto}
              disabled={!isNext}>
              <Ionicons name={isNext ? 'add' : 'image-outline'} size={26} color={isNext ? palette.primary : palette.textSecondary} />
            </Pressable>
          );
        })}
      </View>
    );
  }

  return null;
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <View style={styles.searchRow}>
      <Ionicons name="search" size={18} color={palette.textSecondary} />
      <TextInput
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

function LabeledInput({
  label,
  ...props
}: ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.labeledField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        <TextInput style={styles.fieldInput} placeholderTextColor={palette.textSecondary} {...props} />
      </View>
    </View>
  );
}

function DobField({
  label,
  flex = 1,
  ...props
}: ComponentProps<typeof TextInput> & { label: string; flex?: number }) {
  return (
    <View style={[styles.labeledField, { flex }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        <TextInput style={[styles.fieldInput, styles.dobInput]} placeholderTextColor={palette.textSecondary} keyboardType="number-pad" {...props} />
      </View>
    </View>
  );
}

function GenderCard({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: IoniconName;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.genderCard, selected && styles.genderCardActive]} onPress={onPress}>
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
  fieldInput: { fontSize: typography.body, fontWeight: '600', color: palette.textPrimary, paddingVertical: spacing.sm },
  dobRow: { flexDirection: 'row', gap: spacing.sm },
  dobInput: { textAlign: 'center', fontSize: typography.subtitle, letterSpacing: 2 },
  agePreview: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  agePreviewText: { fontSize: typography.caption, fontWeight: '600', color: palette.textSecondary },
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
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoTile: { width: '31%', aspectRatio: 0.78, borderRadius: radius.md, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoEmpty: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderStyle: 'dashed',
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmptyActive: { borderColor: palette.primary, backgroundColor: palette.chipSurfaceSoft },
  mainBadge: {
    position: 'absolute',
    left: spacing.xs,
    top: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  mainBadgeText: { fontSize: typography.label, fontWeight: '800', color: '#ffffff' },
  removeBadge: {
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(9,18,14,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
