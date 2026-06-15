import type { Ionicons } from '@expo/vector-icons';

export const NONE = 'No preference';

export const AGE_MIN = 18;
export const AGE_MAX = 70;
export const AGE_DEFAULT: [number, number] = [22, 35];

export type FilterKind = 'ageRange' | 'single' | 'multi';

export type FilterValue = string | string[] | [number, number];
export type FilterValues = Record<string, FilterValue>;

export type FilterFieldConfig = {
  id: string;
  label: string;
  kind: FilterKind;
  options?: string[];
  min?: number;
  max?: number;
  badge?: string;
  verified?: boolean;
};

export type FilterSection = {
  id: string;
  heading?: string;
  bigTitle?: string;
  bigTitleIcon?: React.ComponentProps<typeof Ionicons>['name'];
  fields: FilterFieldConfig[];
};

export const FILTER_SECTIONS: FilterSection[] = [
  {
    id: 'basics',
    fields: [
      { id: 'age', label: 'Age', kind: 'ageRange', min: AGE_MIN, max: AGE_MAX },
      {
        id: 'location',
        label: 'Limit location by',
        kind: 'single',
        options: [NONE, 'Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States', 'Canada', 'Other'],
      },
      { id: 'sect', label: 'Sect', kind: 'single', options: [NONE, 'Sunni', 'Shia', 'Other'] },
      {
        id: 'ethnicity',
        label: 'Ethnicity',
        kind: 'single',
        options: [NONE, 'Punjabi', 'Pashtun', 'Sindhi', 'Arab', 'Turkish', 'Other'],
      },
    ],
  },
  {
    id: 'profileActivity',
    bigTitle: 'Advanced filters',
    bigTitleIcon: 'ribbon',
    heading: 'Profile & Activity',
    fields: [
      { id: 'completedBio', label: 'Completed bio', kind: 'single', options: [NONE, 'Completed only'], badge: 'New' },
      { id: 'verified', label: 'ID and age verified', kind: 'single', options: [NONE, 'Verified only'], verified: true },
      { id: 'recentlyActive', label: 'Recently active', kind: 'single', options: [NONE, 'Active this week', 'Active today'] },
      { id: 'goldMember', label: 'Gold member', kind: 'single', options: [NONE, 'Gold members only'], badge: 'New' },
      { id: 'justJoined', label: 'Just joined', kind: 'single', options: [NONE, 'Joined this week'], badge: 'New' },
      { id: 'blurredPhotos', label: 'Blurred photos', kind: 'single', options: [NONE, 'Hide blurred', 'Show all'] },
    ],
  },
  {
    id: 'aboutThem',
    heading: 'About them',
    fields: [
      {
        id: 'nationality',
        label: 'Nationality',
        kind: 'single',
        options: [NONE, 'Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States', 'Other'],
      },
      {
        id: 'height',
        label: 'Height',
        kind: 'single',
        options: [NONE, "Under 5'0\"", "5'0\" - 5'4\"", "5'5\" - 5'9\"", "5'10\" - 6'0\"", "Over 6'0\""],
      },
      { id: 'maritalStatus', label: 'Marital status', kind: 'single', options: [NONE, 'Single', 'Divorced', 'Widowed'] },
      { id: 'children', label: 'Children', kind: 'single', options: [NONE, 'Has children', "Doesn't have children"] },
      {
        id: 'grewUpIn',
        label: 'Grew up in',
        kind: 'single',
        options: [NONE, 'Pakistan', 'Middle East', 'Europe', 'North America', 'Other'],
      },
      {
        id: 'languages',
        label: 'Languages',
        kind: 'multi',
        options: ['Urdu', 'English', 'Arabic', 'Punjabi', 'Pashto', 'Turkish', 'French'],
      },
      {
        id: 'education',
        label: 'Education',
        kind: 'single',
        options: [NONE, 'High school', "Bachelor's", "Master's", 'Doctorate'],
      },
      {
        id: 'profession',
        label: 'Profession',
        kind: 'single',
        options: [NONE, 'Student', 'Healthcare', 'Engineering', 'Education', 'Business', 'Other'],
      },
      {
        id: 'interests',
        label: 'Interests',
        kind: 'multi',
        options: ['Travel', 'Reading', 'Cooking', 'Fitness', 'Quran study', 'Tech', 'Hiking', 'Volunteering'],
      },
      {
        id: 'personality',
        label: 'Personality',
        kind: 'multi',
        options: ['Empathetic', 'Honest', 'Patient', 'Disciplined', 'Warm', 'Practical', 'Loyal', 'Ambitious'],
      },
    ],
  },
  {
    id: 'futurePlans',
    heading: 'Future plans',
    fields: [
      {
        id: 'marriagePlans',
        label: 'Marriage plans',
        kind: 'single',
        options: [NONE, 'Within 6 months', '6-12 months', '1-2 years', 'When I find the one'],
      },
      {
        id: 'relocationPlans',
        label: 'Relocation plans',
        kind: 'single',
        options: [NONE, 'Open to relocate globally', 'Within home country only', 'Not willing to relocate'],
      },
      {
        id: 'familyPlans',
        label: 'Family plans',
        kind: 'single',
        options: [NONE, 'Wants children', 'Open to children', "Doesn't want children"],
      },
    ],
  },
  {
    id: 'religiosity',
    heading: 'Religiosity',
    fields: [
      {
        id: 'religiousPractice',
        label: 'Religious practice',
        kind: 'single',
        options: [NONE, 'Do not practice', 'Occasionally practicing', 'Actively practicing', 'Strictly practicing'],
      },
      { id: 'islamicDress', label: 'Islamic dress', kind: 'single', options: [NONE, 'Always', 'Sometimes', 'Never'] },
      { id: 'diet', label: 'Diet', kind: 'single', options: [NONE, 'Halal only', 'Mostly halal', 'No restrictions'] },
      { id: 'alcohol', label: 'Alcohol', kind: 'single', options: [NONE, 'Never', 'Occasionally', 'Socially'] },
      { id: 'smoking', label: 'Smoking', kind: 'single', options: [NONE, 'Never', 'Occasionally', 'Regularly'] },
    ],
  },
];

export const ALL_FIELDS: FilterFieldConfig[] = FILTER_SECTIONS.flatMap((section) => section.fields);

export function getField(id: string): FilterFieldConfig | undefined {
  return ALL_FIELDS.find((field) => field.id === id);
}

export function buildDefaultValues(): FilterValues {
  const values: FilterValues = {};
  for (const field of ALL_FIELDS) {
    if (field.kind === 'ageRange') {
      values[field.id] = [...AGE_DEFAULT];
    } else if (field.kind === 'multi') {
      values[field.id] = [];
    } else {
      values[field.id] = NONE;
    }
  }
  return values;
}

export function isFieldActive(field: FilterFieldConfig, value: FilterValue | undefined): boolean {
  if (value == null) {
    return false;
  }
  if (field.kind === 'ageRange') {
    const range = value as [number, number];
    return range[0] !== AGE_DEFAULT[0] || range[1] !== AGE_DEFAULT[1];
  }
  if (field.kind === 'multi') {
    return Array.isArray(value) && value.length > 0;
  }
  return value !== NONE;
}

export function formatFieldValue(field: FilterFieldConfig, value: FilterValue | undefined): string {
  if (value == null) {
    return NONE;
  }
  if (field.kind === 'ageRange') {
    const range = value as [number, number];
    return `${range[0]}-${range[1]} years`;
  }
  if (field.kind === 'multi') {
    const list = value as string[];
    if (list.length === 0) {
      return NONE;
    }
    if (list.length <= 2) {
      return list.join(', ');
    }
    return `${list.length} selected`;
  }
  return (value as string) || NONE;
}

export function countActiveFilters(values: FilterValues): number {
  return ALL_FIELDS.reduce((total, field) => (isFieldActive(field, values[field.id]) ? total + 1 : total), 0);
}
