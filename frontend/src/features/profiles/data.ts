import type { ImageSourcePropType } from 'react-native';

export type ReligiousPractice =
  | 'Do not practice'
  | 'Occasionally practicing'
  | 'Actively practicing'
  | 'Strictly practicing';

export type Profile = {
  id: string;
  name: string;
  age: number;
  isVerified: boolean;
  photos: ImageSourcePropType[];
  country: string;
  city: string;
  occupation: string;
  religiousPractice: ReligiousPractice;
  similarities: string[];
  aboutMe: string;
  height: string;
  maritalStatus: string;
  childrenCount: number;
  marriagePlan: {
    chatDuration: string;
    familyMeeting: string;
    marriageTimeline: string;
  };
  futurePlan: {
    wantsChildren: string;
    relocationPreference: string;
  };
  interests: string[];
  personalityTraits: string[];
  qualification: string;
  career: string;
  languages: string[];
  ethnicity: string;
  sect: string;
  bio: string;
};

const photo1 = require('@/assets/intro/intro-1.jpg');
const photo2 = require('@/assets/intro/intro-2.jpg');
const photo3 = require('@/assets/intro/intro-3.jpg');

export const profiles: Profile[] = [
  {
    id: 'profile-01',
    name: 'Ayesha',
    age: 27,
    isVerified: true,
    photos: [photo1, photo2, photo3],
    country: 'Pakistan',
    city: 'Lahore',
    occupation: 'Product Designer',
    religiousPractice: 'Actively practicing',
    similarities: [
      'Both value family involvement',
      'Both like meaningful communication',
      'Both prefer marriage in 4-12 months',
    ],
    aboutMe: 'Calm, family-oriented, and serious about a respectful marriage process.',
    height: "5'5\"",
    maritalStatus: 'Single',
    childrenCount: 0,
    marriagePlan: {
      chatDuration: '2-3 months',
      familyMeeting: 'Yes, after initial compatibility',
      marriageTimeline: '4-12 months',
    },
    futurePlan: {
      wantsChildren: 'Yes',
      relocationPreference: 'Open to relocate globally',
    },
    interests: ['Travel', 'Quran study', 'Reading', 'Cooking'],
    personalityTraits: ['Empathetic', 'Honest', 'Patient'],
    qualification: 'BS Computer Science',
    career: 'Senior Product Designer',
    languages: ['Urdu', 'English'],
    ethnicity: 'Punjabi',
    sect: 'Sunni',
    bio: 'I am looking for a sincere life partner with strong values, emotional maturity, and clear marriage intentions. I value deen, mutual respect, and open communication.',
  },
  {
    id: 'profile-02',
    name: 'Mariam',
    age: 25,
    isVerified: true,
    photos: [photo2, photo3, photo1],
    country: 'United Arab Emirates',
    city: 'Dubai',
    occupation: 'Teacher',
    religiousPractice: 'Strictly practicing',
    similarities: ['Both prioritize deen', 'Both want children', 'Both value education'],
    aboutMe: 'I appreciate kindness, responsibility, and meaningful partnership.',
    height: "5'3\"",
    maritalStatus: 'Single',
    childrenCount: 0,
    marriagePlan: {
      chatDuration: '1-2 months',
      familyMeeting: 'Early family involvement preferred',
      marriageTimeline: '6-10 months',
    },
    futurePlan: {
      wantsChildren: 'Yes',
      relocationPreference: 'Home country only',
    },
    interests: ['Volunteering', 'Islamic lectures', 'Fitness'],
    personalityTraits: ['Disciplined', 'Warm', 'Thoughtful'],
    qualification: 'MEd Education',
    career: 'Islamic School Teacher',
    languages: ['Arabic', 'English', 'Urdu'],
    ethnicity: 'Pashtun',
    sect: 'Sunni',
    bio: 'I want to build a peaceful home based on trust, deen, and shared long-term goals. I believe marriage works best with compassion and teamwork.',
  },
  {
    id: 'profile-03',
    name: 'Noor',
    age: 29,
    isVerified: false,
    photos: [photo3, photo1, photo2],
    country: 'Saudi Arabia',
    city: 'Riyadh',
    occupation: 'Software Engineer',
    religiousPractice: 'Occasionally practicing',
    similarities: ['Both prefer honest communication', 'Both are career-oriented', 'Both open to relocation'],
    aboutMe: 'Balanced between career and family life, looking for serious commitment.',
    height: "5'7\"",
    maritalStatus: 'Divorced',
    childrenCount: 1,
    marriagePlan: {
      chatDuration: '2 months',
      familyMeeting: 'Yes, after intent is clear',
      marriageTimeline: '8-12 months',
    },
    futurePlan: {
      wantsChildren: 'Open to discuss',
      relocationPreference: 'Open to relocate globally',
    },
    interests: ['Tech', 'Podcasts', 'Hiking'],
    personalityTraits: ['Practical', 'Loyal', 'Reflective'],
    qualification: 'BS Software Engineering',
    career: 'Lead Software Engineer',
    languages: ['Arabic', 'English'],
    ethnicity: 'Arab',
    sect: 'Shia',
    bio: 'I am seeking a mature partner who understands responsibility, mutual growth, and healthy communication. I value sincerity, patience, and long-term stability.',
  },
];

function hashToIndex(value: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

/**
 * Resolves any id (from Explore, Chat, or the Marriage feed) to a full profile.
 * Falls back to a deterministic profile from the pool so every id renders
 * consistently while we are on mock data.
 */
export function getProfileById(id?: string): Profile {
  if (!id) {
    return profiles[0];
  }
  const direct = profiles.find((profile) => profile.id === id);
  if (direct) {
    return direct;
  }
  const fallback = profiles[hashToIndex(id, profiles.length)];
  return { ...fallback, id };
}
