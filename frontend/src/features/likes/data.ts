import type { ImageSourcePropType } from 'react-native';

export type Liker = {
  id: string;
  name: string;
  age: number;
  city: string;
  country: string;
  photo: ImageSourcePropType;
  time: string;
  compliment?: string;
};

export type Match = {
  id: string;
  name: string;
  age: number;
  city: string;
  photo: ImageSourcePropType;
  matchedAt: string;
  isOnline: boolean;
  chatId: string;
};

const photo1 = require('@/assets/intro/intro-1.jpg');
const photo2 = require('@/assets/intro/intro-2.jpg');
const photo3 = require('@/assets/intro/intro-3.jpg');

export const likers: Liker[] = [
  { id: 'profile-01', name: 'Ayesha', age: 27, city: 'Lahore', country: 'Pakistan', photo: photo1, time: '2m', compliment: 'Your bio really resonated with me.' },
  { id: 'profile-02', name: 'Mariam', age: 25, city: 'Dubai', country: 'UAE', photo: photo2, time: '18m' },
  { id: 'profile-03', name: 'Noor', age: 29, city: 'Riyadh', country: 'KSA', photo: photo3, time: '1h', compliment: 'We share so many values, mashaAllah.' },
  { id: 'like-04', name: 'Hira', age: 24, city: 'Karachi', country: 'Pakistan', photo: photo2, time: '3h' },
  { id: 'like-05', name: 'Sana', age: 28, city: 'Istanbul', country: 'Turkey', photo: photo1, time: '5h' },
  { id: 'like-06', name: 'Zainab', age: 26, city: 'London', country: 'UK', photo: photo3, time: 'Yesterday' },
  { id: 'like-07', name: 'Fatima', age: 23, city: 'Doha', country: 'Qatar', photo: photo2, time: 'Yesterday' },
  { id: 'like-08', name: 'Aisha', age: 30, city: 'Toronto', country: 'Canada', photo: photo1, time: '2d' },
];

export const matches: Match[] = [
  { id: 'profile-01', name: 'Ayesha', age: 27, city: 'Lahore', photo: photo1, matchedAt: 'Today', isOnline: true, chatId: 'c1' },
  { id: 'profile-02', name: 'Mariam', age: 25, city: 'Dubai', photo: photo2, matchedAt: 'Today', isOnline: false, chatId: 'c2' },
  { id: 'profile-03', name: 'Noor', age: 29, city: 'Riyadh', photo: photo3, matchedAt: 'Yesterday', isOnline: true, chatId: 'c3' },
  { id: 'match-04', name: 'Hira', age: 24, city: 'Karachi', photo: photo2, matchedAt: '2d ago', isOnline: false, chatId: 'c4' },
];

export function getLikerById(id?: string): Liker | undefined {
  return likers.find((liker) => liker.id === id);
}
