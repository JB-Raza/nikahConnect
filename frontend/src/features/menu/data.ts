import type { ImageSourcePropType } from 'react-native';

export type CurrentUser = {
  id: string;
  name: string;
  age: number;
  city: string;
  country: string;
  photo: ImageSourcePropType;
  isVerified: boolean;
  completion: number;
};

export const currentUser: CurrentUser = {
  id: 'me',
  name: 'Ahmed Raza',
  age: 29,
  city: 'Lahore',
  country: 'Pakistan',
  photo: require('@/assets/intro/intro-3.jpg'),
  isVerified: true,
  completion: 0.72,
};
