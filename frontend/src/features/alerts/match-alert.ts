import { matches } from '@/features/likes/data';
import { getProfileById } from '@/features/profiles/data';

export function resolveMatchChatId(profileId: string): string {
  return matches.find((match) => match.id === profileId)?.chatId ?? profileId;
}

export function resolveMatchName(profileId: string): string {
  const fromMatch = matches.find((match) => match.id === profileId);
  if (fromMatch) {
    return fromMatch.name;
  }
  return getProfileById(profileId).name;
}
