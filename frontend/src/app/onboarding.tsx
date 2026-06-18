import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconCircleButton from '@/components/icon-circle-button';
import { useAlert } from '@/features/alerts/alert-provider';
import {
  INITIAL_FORM,
  MAX_PHOTOS,
  STEPS,
  computeAge,
  isStepValid,
  type OnboardingForm,
} from '@/features/onboarding/config';
import StepBody from '@/features/onboarding/step-body';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;
const AUTO_ADVANCE_KINDS = ['gender', 'select', 'cards'];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert, showToast } = useAlert();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardingForm>(INITIAL_FORM);

  const progress = useMemo(() => new Animated.Value(0), []);
  const total = STEPS.length;
  const current = STEPS[step];
  const age = computeAge(form.dob);
  const isLast = step === total - 1;
  const valid = isStepValid(current, form, age);
  const showFooter = !AUTO_ADVANCE_KINDS.includes(current.kind);

  useEffect(() => {
    Animated.timing(progress, { toValue: (step + 1) / total, duration: 280, useNativeDriver: false }).start();
  }, [step, total, progress]);

  const patch = (partial: Partial<OnboardingForm>) => setForm((previous) => ({ ...previous, ...partial }));

  const finish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)/marriage');
    }, 900);
  };

  const advance = () => {
    if (isLast) {
      finish();
      return;
    }
    setStep((value) => value + 1);
  };

  const goBack = () => {
    if (step === 0) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/auth');
      }
      return;
    }
    setStep((value) => value - 1);
  };

  const selectSingle = (field: keyof OnboardingForm, value: string) => {
    patch({ [field]: value } as Partial<OnboardingForm>);
    advance();
  };

  const setGroup = (field: keyof OnboardingForm, value: string) => {
    patch({ [field]: value } as Partial<OnboardingForm>);
  };

  const toggleMulti = (field: keyof OnboardingForm, value: string) => {
    const array = form[field] as string[];
    const exists = array.includes(value);
    if (!exists && current.max && array.length >= current.max) {
      showToast({ type: 'info', message: `You can choose up to ${current.max}.` });
      return;
    }
    patch({ [field]: exists ? array.filter((item) => item !== value) : [...array, value] } as Partial<OnboardingForm>);
  };

  const captureFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert({ type: 'warning', title: 'Camera access needed', message: 'Enable camera access for NikahConnect in Settings to take a photo.' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!result.canceled) {
      patch({ photos: [...form.photos, result.assets[0].uri].slice(0, MAX_PHOTOS) });
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

  const showHelp = () =>
    showToast({ type: 'info', message: 'Tap an option to continue. You can go back anytime with the arrow.' });

  const footerLabel = (() => {
    if (isLast) return 'Finish setup';
    if (current.kind === 'checkbox') {
      const count = (current.field ? (form[current.field] as string[]) : []).length;
      return count > 0 ? `Confirm (${count})` : 'Confirm';
    }
    return 'Continue';
  })();

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <IconCircleButton icon="chevron-back" onPress={goBack} accessibilityLabel="Go back" variant="onLight" size={40} iconSize={24} />
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <IconCircleButton icon="help-circle-outline" onPress={showHelp} accessibilityLabel="Help" variant="onLight" size={40} iconSize={22} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text style={styles.title}>{current.title}</Text>
          {current.subtitle ? <Text style={styles.subtitle}>{current.subtitle}</Text> : null}

          <View style={styles.stepBody}>
            <StepBody
              key={current.key}
              step={current}
              form={form}
              age={age}
              patch={patch}
              onSelectSingle={selectSingle}
              onSetGroup={setGroup}
              onToggleMulti={toggleMulti}
              onAddPhoto={addPhoto}
              onRemovePhoto={removePhoto}
            />
          </View>
        </ScrollView>

        {showFooter ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
            <Pressable
              onPress={() => valid && advance()}
              disabled={!valid || loading}
              style={({ pressed }) => [
                styles.continueButton,
                { backgroundColor: !valid || loading ? palette.tabBarInactive : pressed ? palette.primaryPressed : palette.primary },
              ]}>
              {loading ? <ActivityIndicator color={palette.textOnPrimary} /> : <Text style={styles.continueText}>{footerLabel}</Text>}
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
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
  progressTrack: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: palette.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.primary },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: typography.title, lineHeight: 36, fontWeight: '800', color: palette.textPrimary },
  subtitle: { fontSize: typography.subtitle, lineHeight: 22, fontWeight: '500', color: palette.textSecondary, marginTop: spacing.xs },
  stepBody: { marginTop: spacing.xl },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  continueButton: { minHeight: sizing.buttonHeight, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  continueText: { fontSize: typography.button, fontWeight: '800', color: palette.textOnPrimary },
});
