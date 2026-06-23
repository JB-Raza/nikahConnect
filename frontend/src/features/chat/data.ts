import type { ImageSourcePropType } from 'react-native';

export type ChatKind = 'message' | 'complimentReceived' | 'complimentSent';

export type ChatItem = {
  id: string;
  name: string;
  photo: ImageSourcePropType;
  isVerified: boolean;
  isOnline: boolean;
  kind: ChatKind;
  preview: string;
  timestamp: string;
  unreadCount: number;
};

const photoA = require('@/assets/intro/intro-1.jpg');
const photoB = require('@/assets/intro/intro-2.jpg');
const photoC = require('@/assets/intro/intro-3.jpg');

export const chats: ChatItem[] = [
  {
    id: 'c1',
    name: 'Sana',
    photo: photoA,
    isVerified: true,
    isOnline: true,
    kind: 'complimentReceived',
    preview: 'Complimented your profile',
    timestamp: '2m',
    unreadCount: 1,
  },
  {
    id: 'c2',
    name: 'Noor',
    photo: photoB,
    isVerified: true,
    isOnline: true,
    kind: 'message',
    preview: 'Looking forward to the family meeting',
    timestamp: 'now',
    unreadCount: 0,
  },
  {
    id: 'c3',
    name: 'Hira',
    photo: photoC,
    isVerified: false,
    isOnline: false,
    kind: 'message',
    preview: 'Salam! How are you doing?',
    timestamp: '1h',
    unreadCount: 0,
  },
  {
    id: 'c4',
    name: 'Zoya',
    photo: photoA,
    isVerified: true,
    isOnline: true,
    kind: 'complimentSent',
    preview: 'You complimented Zoya',
    timestamp: '3h',
    unreadCount: 0,
  },
  {
    id: 'c5',
    name: 'Aiman',
    photo: photoB,
    isVerified: false,
    isOnline: false,
    kind: 'message',
    preview: 'JazakAllah for connecting',
    timestamp: 'Yesterday',
    unreadCount: 2,
  },
  {
    id: 'c6',
    name: 'Iqra',
    photo: photoC,
    isVerified: true,
    isOnline: false,
    kind: 'complimentReceived',
    preview: 'Complimented you',
    timestamp: 'Mon',
    unreadCount: 1,
  },
  {
    id: 'c7',
    name: 'Komal',
    photo: photoA,
    isVerified: true,
    isOnline: false,
    kind: 'message',
    preview: 'Sure, that sounds good',
    timestamp: '2d',
    unreadCount: 0,
  },
];

export type NewMatch = {
  id: string;
  name: string;
  photo: ImageSourcePropType;
  isOnline: boolean;
};

/** Recent matches the user hasn't messaged yet — shown as a carousel atop the chat list. */
export const newMatches: NewMatch[] = [
  { id: 'm1', name: 'Mariam', photo: photoB, isOnline: true },
  { id: 'm2', name: 'Ayesha', photo: photoC, isOnline: true },
  { id: 'm3', name: 'Fatima', photo: photoA, isOnline: false },
  { id: 'm4', name: 'Rabia', photo: photoB, isOnline: false },
  { id: 'm5', name: 'Sadia', photo: photoC, isOnline: true },
];

export type ChatFilterId = 'all' | 'unread' | 'compliments' | 'online';

export const chatFilters: { id: ChatFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'compliments', label: 'Compliments' },
  { id: 'online', label: 'Online' },
];

export function filterChats(list: ChatItem[], filter: ChatFilterId): ChatItem[] {
  switch (filter) {
    case 'unread':
      return list.filter((chat) => chat.unreadCount > 0);
    case 'compliments':
      return list.filter((chat) => chat.kind === 'complimentReceived' || chat.kind === 'complimentSent');
    case 'online':
      return list.filter((chat) => chat.isOnline);
    default:
      return list;
  }
}

export type ChatMessage = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  kind?: 'text' | 'compliment' | 'voice';
  /** Length of the voice note in seconds (only for `kind: 'voice'`). */
  durationSec?: number;
  /** Local file URI of the recorded voice note (only for `kind: 'voice'`). */
  audioUri?: string;
};

const chatThreads: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: 'c1-m1',
      sender: 'them',
      kind: 'compliment',
      text: 'I really admire how family-oriented your profile is. Would love to get to know you more.',
      time: '2m',
    },
  ],
  c2: [
    { id: 'c2-m1', sender: 'them', text: 'Assalamu alaikum!', time: '10:01' },
    { id: 'c2-m2', sender: 'me', text: 'Walaikum assalam, how are you?', time: '10:03' },
    { id: 'c2-m3', sender: 'them', text: 'Alhamdulillah, doing well.', time: '10:04' },
    { id: 'c2-m5', sender: 'them', text: 'Looking forward to the family meeting', time: 'now' },
  ],
  c3: [
    { id: 'c3-m1', sender: 'me', text: 'Salam! How are you doing?', time: '1h' },
  ],
  c4: [
    {
      id: 'c4-m1',
      sender: 'me',
      kind: 'compliment',
      text: 'Your profile really stood out to me, masha Allah.',
      time: '3h',
    },
  ],
  c5: [
    { id: 'c5-m1', sender: 'me', text: 'Hello, nice to connect.', time: 'Yesterday' },
    { id: 'c5-m2', sender: 'them', text: 'JazakAllah for connecting', time: 'Yesterday' },
    { id: 'c5-m3', sender: 'them', text: 'Where are you currently based?', time: 'Yesterday' },
  ],
  c6: [
    {
      id: 'c6-m1',
      sender: 'them',
      kind: 'compliment',
      text: 'Your bio is beautifully written. I appreciate your clarity about your intentions.',
      time: 'Mon',
    },
  ],
  c7: [
    { id: 'c7-m1', sender: 'them', text: 'Shall we plan a call this weekend?', time: '2d' },
    { id: 'c7-m2', sender: 'me', text: 'Sure, that sounds good', time: '2d' },
  ],
};

export function getChatById(id: string): ChatItem | undefined {
  return chats.find((chat) => chat.id === id);
}

export function getChatThread(id: string): ChatMessage[] {
  return chatThreads[id] ?? [];
}
