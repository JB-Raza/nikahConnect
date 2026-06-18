import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { ExploreProfile, HistoryFilterId } from '@/features/explore/data';
import { historyResults } from '@/features/explore/data';
import { likers } from '@/features/likes/data';
import type { Profile } from '@/features/profiles/data';

import type { BlockedUser } from './helpers';
import { profileToBlocked, profileToExplore } from './helpers';

const MUTUAL_MATCH_IDS = new Set(likers.map((liker) => liker.id));

type HistoryState = Record<HistoryFilterId, ExploreProfile[]>;

type ProfileActionsContextValue = {
  blockedUsers: BlockedUser[];
  passedIds: string[];
  isBlocked: (id: string) => boolean;
  isFavorited: (id: string) => boolean;
  getHistory: (filter: HistoryFilterId) => ExploreProfile[];
  recordPass: (profile: Profile) => void;
  recordLike: (profile: Profile) => boolean;
  toggleFavorite: (profile: Profile) => boolean;
  recordCompliment: (profile: Profile) => void;
  blockUser: (profile: Profile) => void;
  unblockUser: (id: string) => void;
  resetDeck: () => void;
};

const ProfileActionsContext = createContext<ProfileActionsContextValue | null>(null);

function upsertExplore(list: ExploreProfile[], entry: ExploreProfile): ExploreProfile[] {
  return [entry, ...list.filter((item) => item.id !== entry.id)];
}

export default function ProfileActionsProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryState>({
    favourited: [...historyResults.favourited],
    liked: [...historyResults.liked],
    passed: [...historyResults.passed],
    complimented: [...historyResults.complimented],
  });
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [passedIds, setPassedIds] = useState<string[]>(historyResults.passed.map((item) => item.id));

  const isBlocked = useCallback((id: string) => blockedUsers.some((user) => user.id === id), [blockedUsers]);

  const isFavorited = useCallback(
    (id: string) => history.favourited.some((item) => item.id === id),
    [history.favourited],
  );

  const getHistory = useCallback((filter: HistoryFilterId) => history[filter], [history]);

  const recordPass = useCallback((profile: Profile) => {
    const entry = profileToExplore(profile);
    setHistory((current) => ({ ...current, passed: upsertExplore(current.passed, entry) }));
    setPassedIds((current) => (current.includes(profile.id) ? current : [...current, profile.id]));
  }, []);

  const recordLike = useCallback((profile: Profile) => {
    const entry = profileToExplore(profile);
    setHistory((current) => ({ ...current, liked: upsertExplore(current.liked, entry) }));
    setPassedIds((current) => (current.includes(profile.id) ? current : [...current, profile.id]));
    return MUTUAL_MATCH_IDS.has(profile.id);
  }, []);

  const toggleFavorite = useCallback((profile: Profile) => {
    const entry = profileToExplore(profile);
    let added = false;
    setHistory((current) => {
      const exists = current.favourited.some((item) => item.id === profile.id);
      if (exists) {
        return { ...current, favourited: current.favourited.filter((item) => item.id !== profile.id) };
      }
      added = true;
      return { ...current, favourited: upsertExplore(current.favourited, entry) };
    });
    return added;
  }, []);

  const recordCompliment = useCallback((profile: Profile) => {
    const entry = profileToExplore(profile);
    setHistory((current) => ({ ...current, complimented: upsertExplore(current.complimented, entry) }));
    setPassedIds((current) => (current.includes(profile.id) ? current : [...current, profile.id]));
  }, []);

  const blockUser = useCallback((profile: Profile) => {
    const entry = profileToBlocked(profile);
    setBlockedUsers((current) => (current.some((item) => item.id === profile.id) ? current : [entry, ...current]));
    setPassedIds((current) => (current.includes(profile.id) ? current : [...current, profile.id]));
  }, []);

  const unblockUser = useCallback((id: string) => {
    setBlockedUsers((current) => current.filter((item) => item.id !== id));
  }, []);

  const resetDeck = useCallback(() => {
    setPassedIds([]);
  }, []);

  const value = useMemo<ProfileActionsContextValue>(
    () => ({
      blockedUsers,
      passedIds,
      isBlocked,
      isFavorited,
      getHistory,
      recordPass,
      recordLike,
      toggleFavorite,
      recordCompliment,
      blockUser,
      unblockUser,
      resetDeck,
    }),
    [
      blockedUsers,
      passedIds,
      isBlocked,
      isFavorited,
      getHistory,
      recordPass,
      recordLike,
      toggleFavorite,
      recordCompliment,
      blockUser,
      unblockUser,
      resetDeck,
    ],
  );

  return <ProfileActionsContext.Provider value={value}>{children}</ProfileActionsContext.Provider>;
}

export function useProfileActions(): ProfileActionsContextValue {
  const context = useContext(ProfileActionsContext);
  if (!context) {
    throw new Error('useProfileActions must be used within a ProfileActionsProvider');
  }
  return context;
}
