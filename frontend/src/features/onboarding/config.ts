import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type Gender = 'male' | 'female';
export type Dob = { day: string; month: string; year: string };

export type OnboardingForm = {
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dob: Dob;
  city: string;
  country: string;
  address: string;
  height: string | null;
  profession: string | null;
  education: string | null;
  nationalities: string[];
  ethnicities: string[];
  languages: string[];
  sect: string | null;
  familyBackground: string | null;
  maritalStatus: string | null;
  knowFor: string | null;
  marriedWithin: string | null;
  religionPractice: string | null;
  halal: string | null;
  bornMuslim: string | null;
  smoke: string | null;
  alcohol: string | null;
  wantsChildren: string | null;
  moveAbroad: string | null;
  interests: string[];
  personality: string[];
  bio: string;
  photos: string[];
};

export type Option = { value: string; label: string; description?: string; flag?: string };

export type ChipGroup = { field: keyof OnboardingForm; label: string; icon: IoniconName; options: Option[] };

export type StepKind =
  | 'name'
  | 'gender'
  | 'dob'
  | 'location'
  | 'select'
  | 'cards'
  | 'checkbox'
  | 'chipGroups'
  | 'chips'
  | 'bio'
  | 'photos';

export type Step = {
  key: string;
  kind: StepKind;
  title: string;
  subtitle?: string;
  field?: keyof OnboardingForm;
  options?: Option[];
  searchable?: boolean;
  searchPlaceholder?: string;
  suggested?: string[];
  max?: number;
  min?: number;
  groups?: ChipGroup[];
};

export const MAX_PHOTOS = 6;
export const MIN_BIO = 20;
export const MIN_AGE = 18;
export const MAX_AGE = 99;
export const MAX_NATIONALITIES = 2;
export const MAX_PERSONALITY = 5;
export const MIN_INTERESTS = 3;
export const MIN_LANGUAGES = 1;

const toOptions = (labels: string[]): Option[] => labels.map((label) => ({ value: label, label }));

const PROFESSIONS = toOptions([
  'Accountant', 'Acting Professional', 'Actor', 'Actuary', 'Administration Employee', 'Administration Professional',
  'Advertising Professional', 'Air Hostess', 'Architect', 'Artist', 'Banker', 'Business Owner', 'Chef', 'Civil Servant',
  'Consultant', 'Dentist', 'Designer', 'Doctor', 'Driver', 'Economist', 'Engineer', 'Entrepreneur', 'Finance Professional',
  'Healthcare Worker', 'HR Professional', 'IT Professional', 'Journalist', 'Lawyer', 'Lecturer', 'Marketing Professional',
  'Nurse', 'Pharmacist', 'Pilot', 'Police Officer', 'Professor', 'Project Manager', 'Psychologist', 'Real Estate Agent',
  'Researcher', 'Sales Professional', 'Scientist', 'Self-employed', 'Software Engineer', 'Student', 'Teacher',
  'Translator', 'Writer', 'Other',
]);

const EDUCATION = toOptions([
  'High school', 'Non-degree qualification', 'Undergraduate degree', 'Postgraduate degree', 'Doctorate',
  'Other education level',
]);

const NATIONALITIES: Option[] = [
  { value: 'Pakistani', label: 'Pakistani', flag: '🇵🇰' },
  { value: 'Afghan', label: 'Afghan', flag: '🇦🇫' },
  { value: 'Indian', label: 'Indian', flag: '🇮🇳' },
  { value: 'Bangladeshi', label: 'Bangladeshi', flag: '🇧🇩' },
  { value: 'Saudi', label: 'Saudi', flag: '🇸🇦' },
  { value: 'Emirati', label: 'Emirati', flag: '🇦🇪' },
  { value: 'British', label: 'British', flag: '🇬🇧' },
  { value: 'American', label: 'American', flag: '🇺🇸' },
  { value: 'Canadian', label: 'Canadian', flag: '🇨🇦' },
  { value: 'Australian', label: 'Australian', flag: '🇦🇺' },
  { value: 'Turkish', label: 'Turkish', flag: '🇹🇷' },
  { value: 'Egyptian', label: 'Egyptian', flag: '🇪🇬' },
  { value: 'Moroccan', label: 'Moroccan', flag: '🇲🇦' },
  { value: 'Algerian', label: 'Algerian', flag: '🇩🇿' },
  { value: 'Tunisian', label: 'Tunisian', flag: '🇹🇳' },
  { value: 'Indonesian', label: 'Indonesian', flag: '🇮🇩' },
  { value: 'Malaysian', label: 'Malaysian', flag: '🇲🇾' },
  { value: 'Nigerian', label: 'Nigerian', flag: '🇳🇬' },
  { value: 'Somali', label: 'Somali', flag: '🇸🇴' },
  { value: 'Iranian', label: 'Iranian', flag: '🇮🇷' },
  { value: 'Iraqi', label: 'Iraqi', flag: '🇮🇶' },
  { value: 'Syrian', label: 'Syrian', flag: '🇸🇾' },
  { value: 'Palestinian', label: 'Palestinian', flag: '🇵🇸' },
  { value: 'Jordanian', label: 'Jordanian', flag: '🇯🇴' },
  { value: 'Lebanese', label: 'Lebanese', flag: '🇱🇧' },
  { value: 'Sudanese', label: 'Sudanese', flag: '🇸🇩' },
  { value: 'Yemeni', label: 'Yemeni', flag: '🇾🇪' },
  { value: 'Kuwaiti', label: 'Kuwaiti', flag: '🇰🇼' },
  { value: 'Qatari', label: 'Qatari', flag: '🇶🇦' },
  { value: 'French', label: 'French', flag: '🇫🇷' },
  { value: 'German', label: 'German', flag: '🇩🇪' },
];

const ETHNICITIES = toOptions([
  'Baloch', 'Bangladeshi', 'Gujarati', 'Hazara', 'Kashmiri', 'Muhajir', 'Pashtun', 'Punjabi', 'Saraiki', 'Sindhi',
  'Arab', 'Berber', 'Kurdish', 'Persian', 'Turkish', 'Somali', 'Malay', 'Indonesian', 'African', 'Mixed', 'Other',
]);

const HEIGHTS = toOptions([
  '4\'8" (142 cm)', '4\'9" (145 cm)', '4\'10" (147 cm)', '4\'11" (150 cm)', '5\'0" (152 cm)', '5\'1" (155 cm)',
  '5\'2" (157 cm)', '5\'3" (160 cm)', '5\'4" (163 cm)', '5\'5" (165 cm)', '5\'6" (168 cm)', '5\'7" (170 cm)',
  '5\'8" (173 cm)', '5\'9" (175 cm)', '5\'10" (178 cm)', '5\'11" (180 cm)', '6\'0" (183 cm)', '6\'1" (185 cm)',
  '6\'2" (188 cm)', '6\'3" (191 cm)', '6\'4" (193 cm)', '6\'5" (196 cm)',
]);

const LANGUAGES = toOptions([
  'Urdu', 'English', 'Arabic', 'Punjabi', 'Pashto', 'Sindhi', 'Saraiki', 'Balochi', 'Hindi', 'Bengali', 'Gujarati',
  'Turkish', 'Persian', 'Kurdish', 'French', 'German', 'Spanish', 'Malay', 'Indonesian', 'Somali', 'Other',
]);

const SECT = toOptions(['Sunni', 'Shia', 'Sufi', 'Just Muslim', 'Other', 'Prefer not to say']);

const FAMILY_BACKGROUND = toOptions([
  'Close-knit family', 'Joint / extended family', 'Nuclear family', 'Living independently', 'Prefer not to say',
]);

const MARITAL = toOptions(['Never married', 'Divorced', 'Separated', 'Annulled', 'Widowed', 'Married']);

const KNOW_FOR = toOptions(['1-2 months', '3-4 months', '4-12 months', '1-2 years']);
const MARRIED_WITHIN = toOptions(['1-2 months', '3-4 months', '4-12 months', '1-2 years', '3-4 years', '4+ years', 'Agree together']);

const RELIGION_PRACTICE: Option[] = [
  { value: 'Strictly practising', label: 'Strictly practising', description: 'I pray all the time, fast, and adhere strictly to Islamic tenets' },
  { value: 'Actively practising', label: 'Actively practising', description: 'I try and make religious practice part of my daily life where I can' },
  { value: 'Occasionally practising', label: 'Occasionally practising', description: 'I only practise during Ramadan/Eid and other special occasions' },
  { value: 'Not practising at all', label: 'Not practising at all', description: 'I’m culturally a Muslim but do not actively practise' },
];

const YES_NO = toOptions(['Yes', 'No']);
const SMOKE = toOptions(['No', 'Occasionally', 'Yes', 'Trying to quit']);
const ALCOHOL = toOptions(['No', 'Occasionally', 'Yes', 'Trying to quit']);
const WANTS_CHILDREN = toOptions(['Yes', 'No', 'Maybe', 'Open to discuss']);
const MOVE_ABROAD = toOptions(['Yes', 'No', 'Open to discuss']);
const BORN_MUSLIM: Option[] = [
  { value: 'Yes', label: 'Yes' },
  { value: 'Convert', label: 'No, I’m a convert' },
];

const INTERESTS = toOptions([
  'Travel', 'Reading', 'Cooking', 'Fitness', 'Sports', 'Hiking', 'Photography', 'Art', 'Music', 'Movies', 'Gaming',
  'Volunteering', 'Quran study', 'Islamic lectures', 'Calligraphy', 'Fashion', 'Foodie', 'Coffee', 'Nature', 'Animals',
  'Technology', 'Science', 'History', 'Languages', 'Writing', 'Poetry', 'Gardening', 'Cycling', 'Swimming', 'Football',
  'Cricket', 'Yoga', 'Charity',
]);

const PERSONALITY = toOptions([
  'Empathetic', 'Honest', 'Patient', 'Ambitious', 'Funny', 'Calm', 'Adventurous', 'Loyal', 'Optimistic', 'Practical',
  'Thoughtful', 'Disciplined', 'Warm', 'Generous', 'Confident', 'Humble', 'Creative', 'Organised', 'Easy-going',
  'Reliable', 'Caring', 'Independent', 'Outgoing', 'Family-oriented',
]);

export const STEPS: Step[] = [
  { key: 'name', kind: 'name', title: "What's your name?", subtitle: 'This is how you’ll appear on NikahConnect.' },
  { key: 'gender', kind: 'gender', title: 'Your gender', subtitle: 'Select your gender.' },
  { key: 'dob', kind: 'dob', title: 'Your date of birth', subtitle: 'Your age is shown on your profile, your date of birth is not.' },
  {
    key: 'height', kind: 'select', field: 'height', title: "What's your height?",
    searchable: true, searchPlaceholder: 'Search height', options: HEIGHTS,
  },
  { key: 'location', kind: 'location', title: 'Where do you live?', subtitle: 'We use this to show you nearby matches.' },
  {
    key: 'profession', kind: 'select', field: 'profession', title: "What's your profession?",
    searchable: true, searchPlaceholder: 'Search jobs', options: PROFESSIONS,
  },
  { key: 'education', kind: 'select', field: 'education', title: "What's your education level?", options: EDUCATION },
  {
    key: 'nationality', kind: 'checkbox', field: 'nationalities', title: "What's your nationality?",
    subtitle: 'Please tell us up to two countries you hold citizenship with.', searchable: true,
    searchPlaceholder: 'Search for nationalities', options: NATIONALITIES, suggested: ['Pakistani'], max: MAX_NATIONALITIES,
  },
  {
    key: 'ethnicity', kind: 'checkbox', field: 'ethnicities', title: "What's your ethnicity?",
    subtitle: 'Please tell us your ethnic and cultural background.', searchable: true,
    searchPlaceholder: 'Search for ethnicities',
    options: ETHNICITIES, suggested: ['Baloch', 'Bangladeshi', 'Gujarati', 'Hazara', 'Kashmiri', 'Muhajir'],
  },
  {
    key: 'languages', kind: 'chips', field: 'languages', title: 'Which languages do you speak?',
    subtitle: 'Pick all the languages you’re comfortable speaking.', options: LANGUAGES, min: MIN_LANGUAGES,
  },
  { key: 'marital', kind: 'select', field: 'maritalStatus', title: "What's your marital status?", options: MARITAL },
  {
    key: 'intentions', kind: 'chipGroups', title: 'What are your intentions for marriage?',
    groups: [
      { field: 'knowFor', label: 'I’d like to know someone for', icon: 'chatbubbles-outline', options: KNOW_FOR },
      { field: 'marriedWithin', label: 'I’d like to be married within', icon: 'heart-circle-outline', options: MARRIED_WITHIN },
    ],
  },
  { key: 'religion', kind: 'cards', field: 'religionPractice', title: 'How do you practise your religion?', options: RELIGION_PRACTICE },
  { key: 'sect', kind: 'select', field: 'sect', title: "What's your sect?", subtitle: 'This helps us match you with compatible values.', options: SECT },
  { key: 'halal', kind: 'select', field: 'halal', title: 'Do you only eat Halal food?', options: YES_NO },
  { key: 'bornMuslim', kind: 'select', field: 'bornMuslim', title: 'Were you born Muslim?', options: BORN_MUSLIM },
  { key: 'smoke', kind: 'select', field: 'smoke', title: 'Do you smoke?', options: SMOKE },
  { key: 'alcohol', kind: 'select', field: 'alcohol', title: 'Do you drink alcohol?', options: ALCOHOL },
  { key: 'children', kind: 'select', field: 'wantsChildren', title: 'Do you want children?', options: WANTS_CHILDREN },
  { key: 'abroad', kind: 'select', field: 'moveAbroad', title: 'Would you move abroad?', options: MOVE_ABROAD },
  { key: 'family', kind: 'select', field: 'familyBackground', title: "What's your family background?", subtitle: 'Tell matches a little about your home life.', options: FAMILY_BACKGROUND },
  {
    key: 'interests', kind: 'chips', field: 'interests', title: 'What are your interests?',
    subtitle: `Choose at least ${MIN_INTERESTS} so we can find you better matches.`, options: INTERESTS, min: MIN_INTERESTS,
  },
  {
    key: 'personality', kind: 'chips', field: 'personality', title: 'How would you describe your personality?',
    subtitle: `Pick up to ${MAX_PERSONALITY} traits that fit you best.`, options: PERSONALITY, max: MAX_PERSONALITY, min: 1,
  },
  {
    key: 'bio', kind: 'bio', field: 'bio', title: 'About you',
    subtitle: 'Share a little about yourself and what you’re looking for.',
  },
  { key: 'photos', kind: 'photos', title: 'Add your photos', subtitle: 'Add at least one. Your first photo is your main one.' },
];

export const INITIAL_FORM: OnboardingForm = {
  firstName: '',
  lastName: '',
  gender: null,
  dob: { day: '', month: '', year: '' },
  city: '',
  country: '',
  address: '',
  height: null,
  profession: null,
  education: null,
  nationalities: [],
  ethnicities: [],
  languages: [],
  sect: null,
  familyBackground: null,
  maritalStatus: null,
  knowFor: null,
  marriedWithin: null,
  religionPractice: null,
  halal: null,
  bornMuslim: null,
  smoke: null,
  alcohol: null,
  wantsChildren: null,
  moveAbroad: null,
  interests: [],
  personality: [],
  bio: '',
  photos: [],
};

export function computeAge({ day, month, year }: Dob): number | null {
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

export function isStepValid(step: Step, form: OnboardingForm, age: number | null): boolean {
  switch (step.kind) {
    case 'name':
      return form.firstName.trim().length >= 2 && form.lastName.trim().length >= 1;
    case 'gender':
      return form.gender !== null;
    case 'dob':
      return age !== null && age >= MIN_AGE && age <= MAX_AGE;
    case 'location':
      return form.city.trim().length >= 2 && form.country.trim().length >= 2;
    case 'select':
    case 'cards':
      return step.field ? form[step.field] !== null : true;
    case 'checkbox':
    case 'chips': {
      const value = (step.field ? form[step.field] : []) as string[];
      return value.length >= (step.min ?? 1);
    }
    case 'chipGroups':
      return (step.groups ?? []).every((group) => form[group.field] !== null);
    case 'bio':
      return form.bio.trim().length >= MIN_BIO;
    case 'photos':
      return form.photos.length >= 1;
    default:
      return true;
  }
}
