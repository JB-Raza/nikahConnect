import type { ImageSourcePropType } from 'react-native';

export type NotificationType = 'match' | 'message' | 'view' | 'like' | 'verification' | 'subscription';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  photo?: ImageSourcePropType;
  profileId?: string;
  chatId?: string;
};

const photo1 = require('@/assets/intro/intro-1.jpg');
const photo2 = require('@/assets/intro/intro-2.jpg');
const photo3 = require('@/assets/intro/intro-3.jpg');

export const notifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'match',
    title: "It's a match!",
    body: 'You and Ayesha liked each other. Say salam to break the ice.',
    time: '2m',
    unread: true,
    photo: photo1,
    profileId: 'profile-01',
    chatId: 'c1',
  },
  {
    id: 'n2',
    type: 'message',
    title: 'Mariam sent you a message',
    body: 'Walaikum assalam, how are you?',
    time: '14m',
    unread: true,
    photo: photo2,
    chatId: 'c2',
  },
  {
    id: 'n3',
    type: 'like',
    title: 'Noor liked your profile',
    body: 'Like them back to start a conversation.',
    time: '1h',
    unread: true,
    photo: photo3,
    profileId: 'profile-03',
  },
  {
    id: 'n4',
    type: 'view',
    title: 'Your profile is getting noticed',
    body: '5 people viewed your profile today.',
    time: '3h',
    unread: false,
    profileId: 'profile-02',
  },
  {
    id: 'n5',
    type: 'verification',
    title: 'Verification approved',
    body: 'Your profile is now verified. You earned a verified badge.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'n6',
    type: 'message',
    title: 'Hira sent you a compliment',
    body: 'Your bio really stood out to me, mashaAllah.',
    time: 'Yesterday',
    unread: false,
    photo: photo1,
    chatId: 'c3',
  },
  {
    id: 'n7',
    type: 'subscription',
    title: 'Premium trial ending soon',
    body: 'Your free Premium trial ends in 2 days. Keep unlimited likes.',
    time: '2d',
    unread: false,
  },
];
