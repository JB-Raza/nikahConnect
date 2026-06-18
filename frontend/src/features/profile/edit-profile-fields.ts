import { STEPS, type OnboardingForm } from '@/features/onboarding/config';

export type EditProfileFieldKey =
  | 'height'
  | 'profession'
  | 'education'
  | 'maritalStatus'
  | 'sect'
  | 'familyBackground'
  | 'religionPractice'
  | 'halal'
  | 'bornMuslim'
  | 'smoke'
  | 'alcohol'
  | 'wantsChildren'
  | 'moveAbroad'
  | 'knowFor'
  | 'marriedWithin';

type FieldConfig = {
  label: string;
  options: string[];
  searchable?: boolean;
  searchPlaceholder?: string;
};

const BORN_MUSLIM_OPTIONS = ['Yes', 'No, I’m a convert'];

function optionsFromStep(field: string): FieldConfig | undefined {
  const step = STEPS.find((item) => 'field' in item && item.field === field);
  if (!step || !('options' in step) || !step.options) {
    return undefined;
  }
  return {
    label: step.title.replace(/^What's your /i, '').replace(/\?$/, ''),
    options: step.options.map((option) => option.label),
    searchable: 'searchable' in step ? step.searchable : false,
    searchPlaceholder: 'searchPlaceholder' in step ? step.searchPlaceholder : undefined,
  };
}

const INTENTIONS_STEP = STEPS.find((step) => step.key === 'intentions');

function intentionsField(field: 'knowFor' | 'marriedWithin'): FieldConfig | undefined {
  const group = INTENTIONS_STEP?.groups?.find((item) => item.field === field);
  if (!group) {
    return undefined;
  }
  return {
    label: group.label,
    options: group.options.map((option) => option.label),
  };
}

const FIELD_CONFIG: Record<EditProfileFieldKey, () => FieldConfig | undefined> = {
  height: () => optionsFromStep('height'),
  profession: () => optionsFromStep('profession'),
  education: () => optionsFromStep('education'),
  maritalStatus: () => optionsFromStep('maritalStatus'),
  sect: () => optionsFromStep('sect'),
  familyBackground: () => optionsFromStep('familyBackground'),
  religionPractice: () => optionsFromStep('religionPractice'),
  halal: () => optionsFromStep('halal'),
  bornMuslim: () => ({ label: 'Born Muslim', options: BORN_MUSLIM_OPTIONS }),
  smoke: () => optionsFromStep('smoke'),
  alcohol: () => optionsFromStep('alcohol'),
  wantsChildren: () => optionsFromStep('wantsChildren'),
  moveAbroad: () => optionsFromStep('moveAbroad'),
  knowFor: () => intentionsField('knowFor'),
  marriedWithin: () => intentionsField('marriedWithin'),
};

export function getEditProfileField(key: string): (FieldConfig & { field: EditProfileFieldKey }) | undefined {
  if (!(key in FIELD_CONFIG)) {
    return undefined;
  }
  const field = key as EditProfileFieldKey;
  const config = FIELD_CONFIG[field]();
  if (!config) {
    return undefined;
  }
  return { ...config, field };
}

export function isEditProfileFieldKey(key: string): key is EditProfileFieldKey {
  return key in FIELD_CONFIG;
}

export type EditProfileDraft = OnboardingForm;
