import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { countActiveFilters } from './config';
import { useFilters } from './filters-context';
import { profileMatchesFilters, type FilterableProfile } from './matcher';

/**
 * One-stop hook for any screen that wants to use the shared filters.
 *
 * Usage:
 *   const { activeCount, openFilters, filter } = useProfileFilters();
 *   const visible = filter(myProfiles);
 */
export function useProfileFilters() {
  const router = useRouter();
  const { applied, clearAllFilters } = useFilters();

  const activeCount = useMemo(() => countActiveFilters(applied), [applied]);

  const openFilters = useCallback(() => {
    router.push('/filters');
  }, [router]);

  const matches = useCallback(
    (profile: FilterableProfile) => profileMatchesFilters(profile, applied),
    [applied],
  );

  const filter = useCallback(
    <T extends FilterableProfile>(list: T[]) => list.filter((item) => profileMatchesFilters(item, applied)),
    [applied],
  );

  return { applied, activeCount, openFilters, matches, filter, clearAllFilters };
}
