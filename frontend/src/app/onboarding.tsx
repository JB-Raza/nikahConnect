import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconCircleButton from '@/components/icon-circle-button';
import { useAlert } from '@/features/alerts/alert-provider';
import { capturePhoto } from '@/features/media/camera';
import {
  INITIAL_FORM,
  MAX_PHOTOS,
  STEPS,
  computeAge,
  isStepValid,
  type OnboardingForm,
} from '@/features/onboarding/config';
import FieldRow, { formatFieldValue } from '@/features/onboarding/field-row';
import PickerSheet from '@/features/onboarding/picker-sheet';
import { ROW_LABEL, SECTIONS, STEP_BY_KEY } from '@/features/onboarding/sections';
import StepBody from '@/features/onboarding/step-body';
import { useUserProfile } from '@/features/profile/user-profile-context';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert, showToast } = useAlert();
  const { setProfile } = useUserProfile();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardingForm>(INITIAL_FORM);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const sheetRef = useRef<BottomSheetModal>(null);

  const age = computeAge(form.dob);
  const skipChildren = form.maritalStatus === 'Never married';
  const activeStep = activeKey ? STEP_BY_KEY[activeKey] : null;

  const { completedCount, total } = useMemo(() => {
    const tracked = STEPS.filter((step) => !(step.key === 'children' && skipChildren));
    const done = tracked.filter((step) => isStepValid(step, form, age)).length;
    return { completedCount: done, total: tracked.length };
  }, [form, age, skipChildren]);

  const allValid = completedCount === total;
  const remaining = total - completedCount;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const patch = (partial: Partial<OnboardingForm>) => setForm((previous) => ({ ...previous, ...partial }));

  const openSheet = (key: string) => {
    setActiveKey(key);
    sheetRef.current?.present();
  };

  const closeSheet = () => sheetRef.current?.dismiss();

  const finish = () => {
    setLoading(true);
    setProfile(form);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)/marriage');
    }, 900);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/auth');
    }
  };

  const applySingleValue = (field: keyof OnboardingForm, value: string) => {
    if (field === 'maritalStatus' && value === 'Never married') {
      patch({ maritalStatus: value, wantsChildren: 'No' });
    } else {
      patch({ [field]: value } as Partial<OnboardingForm>);
    }
  };

  // Inline single-selects (gender) just set the value.
  const inlineSelectSingle = (field: keyof OnboardingForm, value: string) => applySingleValue(field, value);

  // Sheet single-selects set the value and dismiss the sheet.
  const sheetSelectSingle = (field: keyof OnboardingForm, value: string) => {
    applySingleValue(field, value);
    closeSheet();
  };

  const setGroup = (field: keyof OnboardingForm, value: string) => {
    patch({ [field]: value } as Partial<OnboardingForm>);
  };

  const toggleMulti = (field: keyof OnboardingForm, value: string) => {
    const array = form[field] as string[];
    const exists = array.includes(value);
    const max = activeStep?.max;
    if (!exists && max && array.length >= max) {
      showToast({ type: 'info', message: `You can choose up to ${max}.` });
      return;
    }
    patch({ [field]: exists ? array.filter((item) => item !== value) : [...array, value] } as Partial<OnboardingForm>);
  };

  const captureFromCamera = async () => {
    const result = await capturePhoto({ allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    switch (result.status) {
      case 'unsupported':
        showAlert({ type: 'info', title: 'Camera unavailable', message: 'The simulator has no camera. Use a real device to take a photo, or choose from your gallery.' });
        return;
      case 'denied':
        showAlert({ type: 'warning', title: 'Camera access needed', message: 'Enable camera access for NikahConnect in Settings to take a photo.' });
        return;
      case 'error':
        showToast({ type: 'error', message: 'Could not open the camera.' });
        return;
      case 'success':
        patch({ photos: [...form.photos, result.uri].slice(0, MAX_PHOTOS) });
        return;
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({ type: 'warning', title: 'Photos access needed', message: 'Enable photo access for NikahConnect in Settings to add a picture.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!result.canceled) {
      patch({ photos: [...form.photos, result.assets[0].uri].slice(0, MAX_PHOTOS) });
    }
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

  const removePhoto = (uri: string) =>
    showAlert({
      type: 'warning',
      title: 'Remove photo',
      message: 'Remove this photo from your profile?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => patch({ photos: form.photos.filter((item) => item !== uri) }) },
      ],
    });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <IconCircleButton icon="chevron-back" onPress={goBack} accessibilityLabel="Go back" variant="onLight" size={40} iconSize={24} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Complete your profile</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
        <Text style={styles.counter}>
          {completedCount}/{total}
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {SECTIONS.map((section) => {
            // Photos render full-bleed (no surrounding card) to match the original 3-per-row grid.
            const bare = section.id === 'photos';
            const photoPadding = bare ? spacing.xl * 2 : spacing.xl * 2 + spacing.md * 2;
            return (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={bare ? undefined : styles.card}>
                  {section.rows.map((row) => {
                    if (row.key === 'children' && skipChildren) return null;
                    const step = STEP_BY_KEY[row.key];

                    if (row.mode === 'inline') {
                      return (
                        <View key={row.key} style={styles.inlineBlock}>
                          {bare ? null : <Text style={styles.inlineLabel}>{ROW_LABEL[row.key]}</Text>}
                          <StepBody
                            step={step}
                            form={form}
                            age={age}
                            patch={patch}
                            onSelectSingle={inlineSelectSingle}
                            onSetGroup={setGroup}
                            onToggleMulti={toggleMulti}
                            onAddPhoto={addPhoto}
                            onRemovePhoto={removePhoto}
                            photoContentPadding={photoPadding}
                          />
                        </View>
                      );
                    }

                    return (
                      <FieldRow
                        key={row.key}
                        label={ROW_LABEL[row.key]}
                        value={formatFieldValue(step, form)}
                        onPress={() => openSheet(row.key)}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Pressable
            onPress={() => allValid && finish()}
            disabled={!allValid || loading}
            style={({ pressed }) => [
              styles.finishButton,
              { backgroundColor: !allValid || loading ? palette.tabBarInactive : pressed ? palette.primaryPressed : palette.primary },
            ]}>
            {loading ? (
              <ActivityIndicator color={palette.textOnPrimary} />
            ) : (
              <Text style={styles.finishText}>{allValid ? 'Finish setup' : `Complete ${remaining} more`}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <PickerSheet
        ref={sheetRef}
        step={activeStep}
        form={form}
        age={age}
        patch={patch}
        onSelectSingle={sheetSelectSingle}
        onSetGroup={setGroup}
        onToggleMulti={toggleMulti}
        onDone={closeSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerCenter: { flex: 1, gap: spacing.xs },
  headerTitle: { fontSize: typography.subtitle, fontWeight: '800', color: palette.textPrimary },
  progressTrack: { height: 6, borderRadius: radius.pill, backgroundColor: palette.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.primary },
  counter: { fontSize: typography.caption, fontWeight: '700', color: palette.textSecondary, minWidth: 36, textAlign: 'right' },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inlineBlock: { paddingVertical: spacing.md, gap: spacing.sm },
  inlineLabel: { fontSize: typography.subtitle, fontWeight: '700', color: palette.textPrimary },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  finishButton: { minHeight: sizing.buttonHeight, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  finishText: { fontSize: typography.button, fontWeight: '800', color: palette.textOnPrimary },
});
