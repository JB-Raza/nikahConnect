import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import ProfilePhotoGrid from '@/components/profile-photo-grid';
import { SettingsScaffold, settingsPalette } from '@/components/settings-kit';
import { useAlert } from '@/features/alerts/alert-provider';
import { capturePhoto } from '@/features/media/camera';
import { MAX_PHOTOS, STEPS, type OnboardingForm } from '@/features/onboarding/config';
import { useEditProfileDraft } from '@/features/profile/edit-profile-draft-context';
import type { EditProfileFieldKey } from '@/features/profile/edit-profile-fields';
import { useUserProfile } from '@/features/profile/user-profile-context';
import { radius, spacing, typography } from '@/theme/theme';

const palette = settingsPalette;

function stepOptions(key: string): string[] {
  return STEPS.find((step) => step.key === key)?.options?.map((option) => option.label) ?? [];
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { showAlert, showToast } = useAlert();
  const { user, setProfile } = useUserProfile();
  const { draft, beginDraft, patchDraft, endDraft } = useEditProfileDraft();

  useEffect(() => {
    beginDraft(user.profile);
  }, [beginDraft, user.profile]);

  if (!draft) {
    return null;
  }

  const patch = (partial: Partial<OnboardingForm>) => patchDraft(partial);

  const openField = (field: EditProfileFieldKey) => {
    router.push({ pathname: '/edit-profile-field', params: { field } });
  };

  const addPhoto = () =>
    showAlert({
      title: 'Add a photo',
      message: 'Choose where to get your photo from.',
      buttons: [
        { text: 'Take a photo', onPress: captureFromCamera },
        { text: 'Choose from gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
    });

  const captureFromCamera = async () => {
    const result = await capturePhoto({ allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    switch (result.status) {
      case 'unsupported':
        showAlert({ type: 'info', title: 'Camera unavailable', message: 'The simulator has no camera. Use a real device to take a photo, or choose from your gallery.' });
        return;
      case 'denied':
        showAlert({ type: 'warning', title: 'Camera access needed', message: 'Enable camera access in Settings to take a photo.' });
        return;
      case 'error':
        showToast({ type: 'error', message: 'Could not open the camera.' });
        return;
      case 'success':
        patch({ photos: [...draft.photos, result.uri].slice(0, MAX_PHOTOS) });
        return;
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({ type: 'warning', title: 'Photos access needed', message: 'Enable photo access in Settings to add a picture.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!result.canceled) {
      patch({ photos: [...draft.photos, result.assets[0].uri].slice(0, MAX_PHOTOS) });
    }
  };

  const removePhoto = (uri: string) =>
    showAlert({
      type: 'warning',
      title: 'Remove photo',
      message: 'Remove this photo from your profile?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => patch({ photos: draft.photos.filter((item) => item !== uri) }) },
      ],
    });

  const toggleChip = (field: 'interests' | 'personality' | 'languages', value: string, max?: number) => {
    const current = draft[field];
    const exists = current.includes(value);
    if (!exists && max && current.length >= max) {
      showToast({ type: 'info', message: `You can choose up to ${max}.` });
      return;
    }
    patch({ [field]: exists ? current.filter((item) => item !== value) : [...current, value] });
  };

  const save = () => {
    if (!draft.firstName.trim()) {
      showToast({ type: 'error', message: 'Please enter your first name.' });
      return;
    }
    setProfile(draft);
    endDraft();
    showToast({ type: 'success', message: 'Profile saved.' });
    router.back();
  };

  const interestOptions = stepOptions('interests');
  const personalityOptions = stepOptions('personality');
  const languageOptions = stepOptions('languages');

  return (
    <SettingsScaffold
      title="Edit profile"
      footer={
        <Pressable onPress={save} style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}>
          <Text style={styles.saveLabel}>Save changes</Text>
        </Pressable>
      }>
      <View style={styles.scroll}>
        <Section title="Photos">
          <ProfilePhotoGrid photos={draft.photos} onAddPhoto={addPhoto} onRemovePhoto={removePhoto} contentPadding={spacing.lg * 2} />
        </Section>

        <Section title="Basic info">
          <Field label="First name" value={draft.firstName} onChangeText={(value) => patch({ firstName: value })} />
          <Field label="Last name" value={draft.lastName} onChangeText={(value) => patch({ lastName: value })} />
          <Field label="Bio" value={draft.bio} onChangeText={(value) => patch({ bio: value })} multiline />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field label="City" value={draft.city} onChangeText={(value) => patch({ city: value })} />
            </View>
            <View style={styles.flex}>
              <Field label="Country" value={draft.country} onChangeText={(value) => patch({ country: value })} />
            </View>
          </View>
        </Section>

        <Section title="Background">
          <SelectRow label="Height" value={draft.height} onPress={() => openField('height')} />
          <SelectRow label="Profession" value={draft.profession} onPress={() => openField('profession')} />
          <SelectRow label="Education" value={draft.education} onPress={() => openField('education')} />
          <SelectRow label="Marital status" value={draft.maritalStatus} onPress={() => openField('maritalStatus')} />
          <SelectRow label="Sect" value={draft.sect} onPress={() => openField('sect')} />
          <SelectRow label="Family background" value={draft.familyBackground} onPress={() => openField('familyBackground')} />
        </Section>

        <Section title="Languages">
          <ChipGroup options={languageOptions} selected={draft.languages} onToggle={(value) => toggleChip('languages', value)} />
        </Section>

        <Section title="Faith & lifestyle">
          <SelectRow label="Religious practice" value={draft.religionPractice} onPress={() => openField('religionPractice')} />
          <SelectRow label="Halal only" value={draft.halal} onPress={() => openField('halal')} />
          <SelectRow label="Born Muslim" value={draft.bornMuslim} onPress={() => openField('bornMuslim')} />
          <SelectRow label="Smoke" value={draft.smoke} onPress={() => openField('smoke')} />
          <SelectRow label="Alcohol" value={draft.alcohol} onPress={() => openField('alcohol')} />
          <SelectRow label="Wants children" value={draft.wantsChildren} onPress={() => openField('wantsChildren')} />
          <SelectRow label="Move abroad" value={draft.moveAbroad} onPress={() => openField('moveAbroad')} />
        </Section>

        <Section title="Marriage intentions">
          <SelectRow label="Know someone for" value={draft.knowFor} onPress={() => openField('knowFor')} />
          <SelectRow label="Married within" value={draft.marriedWithin} onPress={() => openField('marriedWithin')} />
        </Section>

        <Section title="Interests">
          <ChipGroup options={interestOptions} selected={draft.interests} onToggle={(value) => toggleChip('interests', value, 8)} />
        </Section>

        <Section title="Personality">
          <ChipGroup options={personalityOptions} selected={draft.personality} onToggle={(value) => toggleChip('personality', value, 5)} />
        </Section>
      </View>
    </SettingsScaffold>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={palette.textSecondary}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

function SelectRow({ label, value, onPress }: { label: string; value: string | null; onPress: () => void }) {
  return (
    <Pressable style={styles.selectRow} onPress={onPress}>
      <View style={styles.selectText}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.selectValue}>{value ?? 'Not set'}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
    </Pressable>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <Pressable key={option} onPress={() => onToggle(option)} style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl, gap: spacing.lg },
  section: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  sectionTitle: { fontSize: typography.caption, fontWeight: '800', color: palette.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBody: { gap: spacing.sm },
  field: { gap: spacing.xxs },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  fieldLabel: { fontSize: typography.caption, fontWeight: '700', color: palette.textSecondary, marginLeft: spacing.xxs },
  input: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textPrimary,
    minHeight: 50,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.sm },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 54,
  },
  selectText: { flex: 1, gap: 2 },
  selectValue: { fontSize: typography.body, fontWeight: '600', color: palette.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  chipText: { fontSize: typography.caption, fontWeight: '600', color: palette.textSecondary },
  chipTextActive: { color: palette.textOnPrimary },
  saveButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: { fontSize: typography.button, fontWeight: '700', color: palette.textOnPrimary },
});
