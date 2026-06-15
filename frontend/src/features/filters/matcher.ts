import { NONE, type FilterValues } from './config';

/**
 * Minimal shape any screen's profile/card must expose to be filterable.
 * Marriage, Explore, Menu, etc. all satisfy this structurally.
 */
export type FilterableProfile = {
  age: number;
  country: string;
  sect: string;
  ethnicity: string;
  maritalStatus: string;
  childrenCount: number;
  religiousPractice: string;
};

export function profileMatchesFilters(profile: FilterableProfile, filters: FilterValues): boolean {
  const age = (filters.age as [number, number]) ?? [0, 120];
  if (profile.age < age[0] || profile.age > age[1]) {
    return false;
  }

  const single = (id: string) => filters[id] as string | undefined;

  const location = single('location');
  if (location && location !== NONE && profile.country !== location) {
    return false;
  }
  const nationality = single('nationality');
  if (nationality && nationality !== NONE && profile.country !== nationality) {
    return false;
  }
  const sect = single('sect');
  if (sect && sect !== NONE && profile.sect !== sect) {
    return false;
  }
  const ethnicity = single('ethnicity');
  if (ethnicity && ethnicity !== NONE && profile.ethnicity !== ethnicity) {
    return false;
  }
  const maritalStatus = single('maritalStatus');
  if (maritalStatus && maritalStatus !== NONE && profile.maritalStatus !== maritalStatus) {
    return false;
  }
  const children = single('children');
  if (children === 'Has children' && profile.childrenCount <= 0) {
    return false;
  }
  if (children === "Doesn't have children" && profile.childrenCount > 0) {
    return false;
  }
  const practice = single('religiousPractice');
  if (practice && practice !== NONE && profile.religiousPractice !== practice) {
    return false;
  }

  return true;
}
