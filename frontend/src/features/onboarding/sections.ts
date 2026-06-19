import { STEPS, type Step } from './config';

export const STEP_BY_KEY: Record<string, Step> = STEPS.reduce<Record<string, Step>>((acc, step) => {
  acc[step.key] = step;
  return acc;
}, {});

export type RowMode = 'inline' | 'sheet';
export type SectionRow = { key: string; mode: RowMode };
export type FormSection = { id: string; title: string; rows: SectionRow[] };

/** Short noun labels for each field row (the `step.title` is a full question). */
export const ROW_LABEL: Record<string, string> = {
  name: 'Name',
  gender: 'Gender',
  dob: 'Date of birth',
  height: 'Height',
  location: 'Location',
  nationality: 'Nationality',
  ethnicity: 'Ethnicity',
  languages: 'Languages',
  profession: 'Profession',
  education: 'Education',
  marital: 'Marital status',
  children: 'Want children',
  abroad: 'Would move abroad',
  family: 'Family background',
  smoke: 'Smoke',
  alcohol: 'Alcohol',
  religion: 'Religious practice',
  sect: 'Sect',
  halal: 'Halal food only',
  bornMuslim: 'Born Muslim',
  intentions: 'Marriage intentions',
  interests: 'Interests',
  personality: 'Personality',
  bio: 'About you',
  photos: 'Photos',
};

export const SECTIONS: FormSection[] = [
  {
    id: 'basics',
    title: 'About you',
    rows: [
      { key: 'name', mode: 'inline' },
      { key: 'gender', mode: 'inline' },
      { key: 'dob', mode: 'inline' },
      { key: 'height', mode: 'sheet' },
    ],
  },
  {
    id: 'location',
    title: 'Location & background',
    rows: [
      { key: 'location', mode: 'inline' },
      { key: 'nationality', mode: 'sheet' },
      { key: 'ethnicity', mode: 'sheet' },
      { key: 'languages', mode: 'sheet' },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & family',
    rows: [
      { key: 'profession', mode: 'sheet' },
      { key: 'education', mode: 'sheet' },
      { key: 'marital', mode: 'sheet' },
      { key: 'children', mode: 'sheet' },
      { key: 'abroad', mode: 'sheet' },
      { key: 'family', mode: 'sheet' },
      { key: 'smoke', mode: 'sheet' },
      { key: 'alcohol', mode: 'sheet' },
    ],
  },
  {
    id: 'religion',
    title: 'Religion',
    rows: [
      { key: 'religion', mode: 'sheet' },
      { key: 'sect', mode: 'sheet' },
      { key: 'halal', mode: 'sheet' },
      { key: 'bornMuslim', mode: 'sheet' },
      { key: 'intentions', mode: 'sheet' },
    ],
  },
  {
    id: 'personality',
    title: 'Personality & interests',
    rows: [
      { key: 'interests', mode: 'sheet' },
      { key: 'personality', mode: 'sheet' },
    ],
  },
  {
    id: 'about',
    title: 'About',
    rows: [{ key: 'bio', mode: 'inline' }],
  },
  {
    id: 'photos',
    title: 'Photos',
    rows: [{ key: 'photos', mode: 'inline' }],
  },
];
