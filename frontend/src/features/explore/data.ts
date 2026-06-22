import type { ImageSourcePropType } from 'react-native';

export type ExploreProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  activeLabel: string;
  photo: ImageSourcePropType;
  isVerified: boolean;
  isOnline: boolean;
};

const photoA = require('@/assets/intro/intro-1.jpg');
const photoB = require('@/assets/intro/intro-2.jpg');
const photoC = require('@/assets/intro/intro-3.jpg');

const pool: ExploreProfile[] = [
  { id: 'e1', name: 'Sana', age: 24, city: 'Lahore', activeLabel: 'Active now', photo: photoA, isVerified: true, isOnline: true },
  { id: 'e2', name: 'Hira', age: 26, city: 'Faisalabad', activeLabel: 'Active 5m ago', photo: photoB, isVerified: false, isOnline: false },
  { id: 'e3', name: 'Zoya', age: 23, city: 'Karachi', activeLabel: 'Active now', photo: photoC, isVerified: true, isOnline: true },
  { id: 'e4', name: 'Aiman', age: 28, city: 'Islamabad', activeLabel: 'Active 1h ago', photo: photoA, isVerified: false, isOnline: false },
  { id: 'e5', name: 'Maha', age: 25, city: 'Lahore', activeLabel: 'Active now', photo: photoB, isVerified: false, isOnline: true },
  { id: 'e6', name: 'Iqra', age: 27, city: 'Multan', activeLabel: 'Active 2h ago', photo: photoC, isVerified: true, isOnline: false },
  { id: 'e7', name: 'Areeba', age: 22, city: 'Rawalpindi', activeLabel: 'Active now', photo: photoA, isVerified: false, isOnline: true },
  { id: 'e8', name: 'Noor', age: 29, city: 'Karachi', activeLabel: 'Active yesterday', photo: photoB, isVerified: true, isOnline: false },
  { id: 'e9', name: 'Fatima', age: 24, city: 'Lahore', activeLabel: 'Active 10m ago', photo: photoC, isVerified: false, isOnline: true },
  { id: 'e10', name: 'Komal', age: 26, city: 'Faisalabad', activeLabel: 'Active now', photo: photoA, isVerified: true, isOnline: true },
  { id: 'e11', name: 'Rida', age: 23, city: 'Islamabad', activeLabel: 'Active 30m ago', photo: photoB, isVerified: false, isOnline: false },
  { id: 'e12', name: 'Hina', age: 28, city: 'Multan', activeLabel: 'Active now', photo: photoC, isVerified: true, isOnline: true },
];

const byId = (ids: string[]) => ids.map((id) => pool.find((profile) => profile.id === id)!).filter(Boolean);

export type ForYouSection = {
  id: string;
  title: string;
  subtitle?: string;
  layout: 'row' | 'twoRow';
  data: ExploreProfile[];
};

export const forYouSections: ForYouSection[] = [
  {
    id: 'likesInFilter',
    title: 'Likes in your filter',
    subtitle: 'People who liked you or closely match your preferences',
    layout: 'row',
    data: byId(['e1', 'e3', 'e6', 'e8', 'e10']),
  },
  {
    id: 'currentlyAvailable',
    title: 'Currently available',
    subtitle: 'Active right now',
    layout: 'twoRow',
    data: byId(['e1', 'e3', 'e5', 'e7', 'e9', 'e10', 'e12', 'e2', 'e4', 'e11']),
  },
  {
    id: 'visitedYou',
    title: 'Visited you',
    layout: 'row',
    data: byId(['e2', 'e4', 'e11', 'e6']),
  },
  {
    id: 'justJoined',
    title: 'Just joined',
    layout: 'row',
    data: byId(['e7', 'e9', 'e11', 'e12']),
  },
  {
    id: 'activeNearYou',
    title: 'Active near you',
    layout: 'row',
    data: byId(['e5', 'e1', 'e9']),
  },
];

export type HistoryFilterId = 'favourited' | 'liked' | 'passed' | 'complimented';

export const historyFilters: { id: HistoryFilterId; label: string; icon: string }[] = [
  { id: 'favourited', label: 'Favourited', icon: 'bookmark' },
  { id: 'liked', label: 'Liked', icon: 'heart' },
  { id: 'passed', label: 'Passed', icon: 'close-circle' },
  { id: 'complimented', label: 'Complimented', icon: 'sparkles' },
];

export const historyResults: Record<HistoryFilterId, ExploreProfile[]> = {
  favourited: byId(['e3', 'e8']),
  liked: byId(['e1', 'e5', 'e9', 'e10']),
  passed: byId(['e4', 'e11']),
  complimented: [],
};

// Lite sort applied on top of a History category (Favourited, Liked, etc.).
export type HistorySortId = 'recent' | 'matched' | 'active' | 'name';

export const historySorts: { id: HistorySortId; label: string; icon: string }[] = [
  { id: 'recent', label: 'Most recent', icon: 'time-outline' },
  { id: 'matched', label: 'Most matched', icon: 'heart-outline' },
  { id: 'active', label: 'Recently active', icon: 'radio-outline' },
  { id: 'name', label: 'Name (A–Z)', icon: 'text-outline' },
];

export function sortHistory(list: ExploreProfile[], sort: HistorySortId): ExploreProfile[] {
  const copy = [...list];
  switch (sort) {
    case 'recent':
      return copy.sort((a, b) => recencyRank(a.activeLabel) - recencyRank(b.activeLabel));
    case 'matched':
      return copy.sort((a, b) => matchScore(b) - matchScore(a));
    case 'active':
      return copy.sort(
        (a, b) => Number(b.isOnline) - Number(a.isOnline) || recencyRank(a.activeLabel) - recencyRank(b.activeLabel),
      );
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
}

// Lower rank = more recent, derived from the human-readable active label.
function recencyRank(label: string): number {
  const text = label.toLowerCase();
  if (text.includes('now')) return 0;
  if (text.includes('m ago')) return 1;
  if (text.includes('h ago')) return 2;
  if (text.includes('yesterday')) return 3;
  return 4;
}

// Mock relevance proxy until a real personality match score exists.
function matchScore(profile: ExploreProfile): number {
  return (profile.isVerified ? 2 : 0) + (profile.isOnline ? 1 : 0);
}
