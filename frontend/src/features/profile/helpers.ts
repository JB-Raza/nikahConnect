import type { ImageSourcePropType } from 'react-native';

import type { ExploreProfile } from '@/features/explore/data';
import { computeAge, type OnboardingForm } from '@/features/onboarding/config';
import type { Profile } from '@/features/profiles/data';

export type BlockedUser = {
  id: string;
  name: string;
  city: string;
  photo: ImageSourcePropType;
};

export function profileToExplore(profile: Profile): ExploreProfile {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    city: profile.city,
    activeLabel: 'Recently',
    photo: profile.photos[0],
    isVerified: profile.isVerified,
    isOnline: false,
  };
}

export function profileToBlocked(profile: Profile): BlockedUser {
  return {
    id: profile.id,
    name: profile.name,
    city: profile.city,
    photo: profile.photos[0],
  };
}

export function displayName(form: OnboardingForm): string {
  const full = `${form.firstName} ${form.lastName}`.trim();
  return full || 'Your profile';
}

export function displayAge(form: OnboardingForm): number | null {
  return computeAge(form.dob);
}

export function primaryPhotoSource(form: OnboardingForm): ImageSourcePropType {
  if (form.photos[0]) {
    return { uri: form.photos[0] };
  }
  return require('@/assets/intro/intro-3.jpg');
}
