import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { INITIAL_FORM, type OnboardingForm } from '@/features/onboarding/config';

import { computeProfileCompletion } from './completion';
import { displayAge, displayName, primaryPhotoSource } from './helpers';

export type UserProfileState = {
  id: string;
  isVerified: boolean;
  profile: OnboardingForm;
};

const DEFAULT_PROFILE: OnboardingForm = {
  ...INITIAL_FORM,
  firstName: 'Ahmed',
  lastName: 'Raza',
  gender: 'male',
  dob: { day: '14', month: '3', year: '1996' },
  city: 'Lahore',
  country: 'Pakistan',
  height: "5'10\" (178 cm)",
  profession: 'Software Engineer',
  education: 'Undergraduate degree',
  nationalities: ['Pakistani'],
  ethnicities: ['Punjabi'],
  languages: ['Urdu', 'English'],
  sect: 'Sunni',
  familyBackground: 'Close-knit family',
  maritalStatus: 'Never married',
  knowFor: '4-12 months',
  marriedWithin: '1-2 years',
  religionPractice: 'Actively practising',
  halal: 'Yes',
  bornMuslim: 'Yes',
  smoke: 'No',
  alcohol: 'No',
  wantsChildren: 'Yes',
  moveAbroad: 'Open to discuss',
  interests: ['Reading', 'Travel', 'Fitness', 'Quran study'],
  personality: ['Honest', 'Patient', 'Loyal'],
  bio: 'Practising and family-oriented, looking for a partner to grow in deen with, insha’Allah.',
  photos: [],
};

type UserProfileContextValue = {
  user: UserProfileState;
  completionPercent: number;
  name: string;
  age: number | null;
  photo: ReturnType<typeof primaryPhotoSource>;
  setProfile: (profile: OnboardingForm) => void;
  patchProfile: (partial: Partial<OnboardingForm>) => void;
  setVerified: (verified: boolean) => void;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export default function UserProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileState>({
    id: 'me',
    isVerified: true,
    profile: DEFAULT_PROFILE,
  });

  const setProfile = useCallback((profile: OnboardingForm) => {
    setUser((current) => ({ ...current, profile }));
  }, []);

  const patchProfile = useCallback((partial: Partial<OnboardingForm>) => {
    setUser((current) => ({ ...current, profile: { ...current.profile, ...partial } }));
  }, []);

  const setVerified = useCallback((isVerified: boolean) => {
    setUser((current) => ({ ...current, isVerified }));
  }, []);

  const value = useMemo<UserProfileContextValue>(() => {
    const completionPercent = computeProfileCompletion(user.profile);
    return {
      user,
      completionPercent,
      name: displayName(user.profile),
      age: displayAge(user.profile),
      photo: primaryPhotoSource(user.profile),
      setProfile,
      patchProfile,
      setVerified,
    };
  }, [user, setProfile, patchProfile, setVerified]);

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile(): UserProfileContextValue {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
