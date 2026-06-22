import { computeAge, MIN_AGE, MIN_BIO, MIN_INTERESTS, type OnboardingForm } from '@/features/onboarding/config';

type Check = { weight: number; done: boolean };

export function computeProfileCompletion(form: OnboardingForm): number {
  const age = computeAge(form.dob);
  const checks: Check[] = [
    { weight: 5, done: form.firstName.trim().length >= 2 },
    { weight: 3, done: form.lastName.trim().length >= 1 },
    { weight: 5, done: form.gender !== null },
    { weight: 5, done: age !== null && age >= MIN_AGE },
    { weight: 4, done: form.city.trim().length >= 2 },
    { weight: 4, done: form.country.trim().length >= 2 },
    { weight: 4, done: form.height !== null },
    { weight: 5, done: form.profession !== null },
    { weight: 5, done: form.education !== null },
    { weight: 4, done: form.nationalities.length > 0 },
    { weight: 4, done: form.ethnicity !== null },
    { weight: 4, done: form.languages.length >= 1 },
    { weight: 4, done: form.sect !== null },
    { weight: 3, done: form.familyBackground !== null },
    { weight: 4, done: form.maritalStatus !== null },
    { weight: 3, done: form.knowFor !== null },
    { weight: 3, done: form.marriedWithin !== null },
    { weight: 5, done: form.religionPractice !== null },
    { weight: 3, done: form.halal !== null },
    { weight: 3, done: form.bornMuslim !== null },
    { weight: 3, done: form.smoke !== null },
    { weight: 3, done: form.alcohol !== null },
    { weight: 3, done: form.wantsChildren !== null },
    { weight: 3, done: form.moveAbroad !== null },
    { weight: 5, done: form.interests.length >= MIN_INTERESTS },
    { weight: 4, done: form.personality.length >= 1 },
    { weight: 8, done: form.bio.trim().length >= MIN_BIO },
    { weight: 10, done: form.photos.length >= 1 },
  ];

  const total = checks.reduce((sum, item) => sum + item.weight, 0);
  const earned = checks.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  return Math.round((earned / total) * 100);
}
