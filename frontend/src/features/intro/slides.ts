import type { ImageSourcePropType } from 'react-native';

export type IntroSlide = {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
};

export const introSlides: IntroSlide[] = [
  {
    id: 'values-first',
    badge: 'Values First',
    title: 'Find meaningful Muslim matches',
    description: 'Serious intentions, values-first profiles, and respectful connections.',
    image: require('@/assets/intro/intro-1.jpg'),
  },
  {
    id: 'safety',
    badge: 'Safety & Privacy',
    title: 'Built with privacy in mind',
    description: 'Verification, reporting tools, and controls that protect your journey.',
    image: require('@/assets/intro/intro-2.jpg'),
  },
  {
    id: 'journey',
    badge: 'Your Journey',
    title: 'Start your Nikah journey',
    description: 'Set your profile, share your preferences, and discover compatible proposals.',
    image: require('@/assets/intro/intro-3.jpg'),
  },
];
