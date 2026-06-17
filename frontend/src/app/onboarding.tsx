import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '@/features/alerts/alert-provider';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type Gender = 'male' | 'female';

type Dob = { day: string; month: string; year: string };

type OnboardingForm = {
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dob: Dob;
  city: string;
  country: string;
  address: string;
  photos: string[];
  religious: string | null;
  timeline: string | null;
  bio: string;
};

const MAX_PHOTOS = 6;
const MIN_BIO = 20;
const MIN_AGE = 18;
const MAX_AGE = 99;

const RELIGIOUS_OPTIONS = ['Very practicing', 'Practicing', 'Moderately practicing', 'Not practicing', 'Prefer not to say'];
const TIMELINE_OPTIONS = ['Within a year', 'In 1–2 years', 'When the time is right', 'Still figuring it out'];

const STEPS = [
  { key: 'name', title: "What's your name?", subtitle: 'This is how you’ll appear on NikahConnect.' },
  { key: 'gender', title: 'Your gender', subtitle: 'Select your gender.' },
  { key: 'dob', title: 'Your date of birth', subtitle: 'Your age is shown on your profile, your date of birth is not.' },
  { key: 'location', title: 'Where do you live?', subtitle: 'We use this to show you nearby matches.' },
  { key: 'photos', title: 'Add your photos', subtitle: 'Add at least one. Your first photo is your main one.' },
  { key: 'religious', title: 'Your deen', subtitle: 'How would you describe your religious practice?' },
  { key: 'timeline', title: 'Marriage timeline', subtitle: 'When are you hoping to get married, inshaAllah?' },
  { key: 'bio', title: 'About you', subtitle: 'Share a little about yourself and what you’re looking for.' },
] as const;

function computeAge({ day, month, year }: Dob): number | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) return null;

  const dob = new Date(y, m - 1, d);
  if (dob.getFullYear() !== y || dob.getMonth() !== m - 1 || dob.getDate() !== d) return null;

  const now = new Date();
  let age = now.getFullYear() - y;
  const hadBirthday = now.getMonth() > m - 1 || (now.getMonth() === m - 1 && now.getDate() >= d);
  if (!hadBirthday) age -= 1;
  return age;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardingForm>({
    firstName: '',
    lastName: '',
    gender: null,
    dob: { day: '', month: '', year: '' },
    city: '',
    country: '',
    address: '',
    photos: [],
    religious: null,
    timeline: null,
    bio: '',
  });

  const progress = useMemo(() => new Animated.Value(0), []);
  const total = STEPS.length;
  const current = STEPS[step];
  const age = computeAge(form.dob);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (step + 1) / total,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [step, total, progress]);

  const update = <K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const updateDob = (key: keyof Dob, value: string) =>
    setForm((previous) => ({ ...previous, dob: { ...previous.dob, [key]: value.replace(/\D/g, '') } }));

  const isStepValid = (): boolean => {
    switch (current.key) {
      case 'name':
        return form.firstName.trim().length >= 2 && form.lastName.trim().length >= 1;
      case 'gender':
        return form.gender !== null;
      case 'dob':
        return age !== null && age >= MIN_AGE && age <= MAX_AGE;
      case 'location':
        return form.city.trim().length >= 2 && form.country.trim().length >= 2;
      case 'photos':
        return form.photos.length >= 1;
      case 'religious':
        return form.religious !== null;
      case 'timeline':
        return form.timeline !== null;
      case 'bio':
        return form.bio.trim().length >= MIN_BIO;
      default:
        return true;
    }
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

  const goNext = () => {
    if (!isStepValid()) return;
    if (step === total - 1) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.replace('/(tabs)/marriage');
      }, 900);
      return;
    }
    setStep((value) => value + 1);
  };

  const captureFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert({
        type: 'warning',
        title: 'Camera access needed',
        message: 'Enable camera access for NikahConnect in Settings to take a photo.',
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [3, 4], quality: 0.8 });
    if (!result.canceled) {
      update('photos', [...form.photos, result.assets[0].uri].slice(0, MAX_PHOTOS));
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({
        type: 'warning',
        title: 'Photos access needed',
        message: 'Enable photo access for NikahConnect in Settings to add a picture.',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) {
      update('photos', [...form.photos, result.assets[0].uri].slice(0, MAX_PHOTOS));
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
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => update('photos', form.photos.filter((item) => item !== uri)),
        },
      ],
    });

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={palette.textPrimary} />
        </Pressable>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.stepCounter}>
          {step + 1}/{total}
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>

          <View style={styles.stepBody}>
            {current.key === 'name' ? (
              <View style={styles.gap}>
                <LabeledInput
                  label="First name"
                  placeholder="First name"
                  autoCapitalize="words"
                  autoFocus
                  value={form.firstName}
                  onChangeText={(value) => update('firstName', value)}
                />
                <LabeledInput
                  label="Last name"
                  placeholder="Last name"
                  autoCapitalize="words"
                  value={form.lastName}
                  onChangeText={(value) => update('lastName', value)}
                />
              </View>
            ) : null}

            {current.key === 'gender' ? (
              <View style={styles.genderRow}>
                <GenderCard
                  label="Male"
                  icon="male"
                  selected={form.gender === 'male'}
                  onPress={() => update('gender', 'male')}
                />
                <GenderCard
                  label="Female"
                  icon="female"
                  selected={form.gender === 'female'}
                  onPress={() => update('gender', 'female')}
                />
              </View>
            ) : null}

            {current.key === 'dob' ? (
              <View style={styles.gap}>
                <View style={styles.dobRow}>
                  <DobField label="Day" placeholder="DD" maxLength={2} value={form.dob.day} onChangeText={(v) => updateDob('day', v)} />
                  <DobField label="Month" placeholder="MM" maxLength={2} value={form.dob.month} onChangeText={(v) => updateDob('month', v)} />
                  <DobField label="Year" placeholder="YYYY" maxLength={4} value={form.dob.year} onChangeText={(v) => updateDob('year', v)} flex={1.4} />
                </View>
                <View style={styles.agePreview}>
                  <Ionicons
                    name={age !== null && age >= MIN_AGE ? 'checkmark-circle' : 'information-circle-outline'}
                    size={16}
                    color={age !== null && age >= MIN_AGE ? palette.success : palette.textSecondary}
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
            ) : null}

            {current.key === 'location' ? (
              <View style={styles.gap}>
                <LabeledInput
                  label="City"
                  placeholder="e.g. Lahore"
                  value={form.city}
                  onChangeText={(value) => update('city', value)}
                />
                <LabeledInput
                  label="Country"
                  placeholder="e.g. Pakistan"
                  value={form.country}
                  onChangeText={(value) => update('country', value)}
                />
                <LabeledInput
                  label="Address (optional)"
                  placeholder="Area or street"
                  value={form.address}
                  onChangeText={(value) => update('address', value)}
                />
                <Pressable
                  style={styles.locateButton}
                  onPress={() => {
                    update('city', form.city.trim().length ? form.city : 'Lahore');
                    update('country', form.country.trim().length ? form.country : 'Pakistan');
                  }}>
                  <Ionicons name="navigate" size={16} color={palette.primary} />
                  <Text style={styles.locateText}>Use my current location</Text>
                </Pressable>
              </View>
            ) : null}

            {current.key === 'photos' ? (
              <View style={styles.photoGrid}>
                {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
                  const uri = form.photos[index];
                  if (uri) {
                    return (
                      <Pressable key={`photo-${index}`} style={styles.photoTile} onPress={() => removePhoto(uri)}>
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
                      onPress={addPhoto}
                      disabled={!isNext}>
                      <Ionicons name={isNext ? 'add' : 'image-outline'} size={26} color={isNext ? palette.primary : palette.textSecondary} />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {current.key === 'religious' ? (
              <View style={styles.optionList}>
                {RELIGIOUS_OPTIONS.map((option) => (
                  <OptionRow
                    key={option}
                    label={option}
                    selected={form.religious === option}
                    onPress={() => update('religious', option)}
                  />
                ))}
              </View>
            ) : null}

            {current.key === 'timeline' ? (
              <View style={styles.optionList}>
                {TIMELINE_OPTIONS.map((option) => (
                  <OptionRow
                    key={option}
                    label={option}
                    selected={form.timeline === option}
                    onPress={() => update('timeline', option)}
                  />
                ))}
              </View>
            ) : null}

            {current.key === 'bio' ? (
              <View style={styles.gap}>
                <TextInput
                  style={styles.bioInput}
                  placeholder="I’m someone who values faith, family, and kindness…"
                  placeholderTextColor={palette.textSecondary}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                  value={form.bio}
                  onChangeText={(value) => update('bio', value)}
                />
                <Text style={styles.bioCounter}>
                  {form.bio.trim().length < MIN_BIO
                    ? `${MIN_BIO - form.bio.trim().length} more characters needed`
                    : `${form.bio.length}/500`}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Pressable
            onPress={goNext}
            disabled={!isStepValid() || loading}
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: !isStepValid() || loading ? palette.tabBarInactive : pressed ? palette.primaryPressed : palette.primary,
              },
            ]}>
            {loading ? (
              <ActivityIndicator color={palette.textOnPrimary} />
            ) : (
              <Text style={styles.continueText}>{step === total - 1 ? 'Finish setup' : 'Continue'}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

type LabeledInputProps = TextInputProps & { label: string };

function LabeledInput({ label, ...props }: LabeledInputProps) {
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
}: TextInputProps & { label: string; flex?: number }) {
  return (
    <View style={[styles.labeledField, { flex }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        <TextInput
          style={[styles.fieldInput, styles.dobInput]}
          placeholderTextColor={palette.textSecondary}
          keyboardType="number-pad"
          {...props}
        />
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
  icon: React.ComponentProps<typeof Ionicons>['name'];
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

function OptionRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.optionRow, selected && styles.optionRowActive]} onPress={onPress}>
      <Text style={[styles.optionLabel, selected && { color: palette.primary, fontWeight: '800' }]}>{label}</Text>
      <View style={[styles.optionRadio, selected && styles.optionRadioActive]}>
        {selected ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
  stepCounter: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.title,
    lineHeight: 36,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  subtitle: {
    fontSize: typography.subtitle,
    lineHeight: 22,
    fontWeight: '500',
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  stepBody: {
    marginTop: spacing.xl,
  },
  gap: {
    gap: spacing.md,
  },
  labeledField: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  fieldBox: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  fieldInput: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    paddingVertical: spacing.sm,
  },
  dobRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dobInput: {
    textAlign: 'center',
    fontSize: typography.subtitle,
    letterSpacing: 2,
  },
  agePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  agePreviewText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
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
  genderCardActive: {
    borderColor: palette.primary,
    backgroundColor: palette.chipSurfaceSoft,
  },
  genderIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderIconActive: {
    backgroundColor: palette.primary,
  },
  genderLabel: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  locateText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.primary,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoTile: {
    width: '31%',
    aspectRatio: 0.78,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderStyle: 'dashed',
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmptyActive: {
    borderColor: palette.primary,
    backgroundColor: palette.chipSurfaceSoft,
  },
  mainBadge: {
    position: 'absolute',
    left: spacing.xs,
    top: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  mainBadgeText: {
    fontSize: typography.label,
    fontWeight: '800',
    color: '#ffffff',
  },
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
  optionList: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
  },
  optionRowActive: {
    borderColor: palette.primary,
    backgroundColor: palette.chipSurfaceSoft,
  },
  optionLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
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
  bioCounter: {
    fontSize: typography.label,
    fontWeight: '600',
    color: palette.textSecondary,
    alignSelf: 'flex-end',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  continueButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: typography.button,
    fontWeight: '800',
    color: palette.textOnPrimary,
  },
});
