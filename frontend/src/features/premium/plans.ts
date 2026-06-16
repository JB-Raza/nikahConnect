import type { Ionicons } from '@expo/vector-icons';

import type { PlanId } from './premium-context';

export type Plan = {
  id: PlanId;
  label: string;
  price: string;
  per: string;
  badge?: string;
};

export const PLANS: Plan[] = [
  { id: 'yearly', label: '12 months', price: '$59.99', per: '$5.00 / month', badge: 'Best value · Save 50%' },
  { id: 'monthly', label: '1 month', price: '$9.99', per: 'Billed monthly' },
];

export type PremiumBenefit = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
};

export const PREMIUM_BENEFITS: PremiumBenefit[] = [
  { icon: 'heart', title: 'See who likes you', subtitle: 'Reveal everyone who already liked your profile.' },
  { icon: 'infinite', title: 'Unlimited likes', subtitle: 'Like as many profiles as you want, every day.' },
  { icon: 'flash', title: 'Weekly Boost', subtitle: 'Be one of the top profiles in your area each week.' },
  { icon: 'options', title: 'Advanced filters', subtitle: 'Filter by sect, practice, education and more.' },
  { icon: 'eye', title: 'See who viewed you', subtitle: 'Know who checked out your profile.' },
  { icon: 'checkmark-done', title: 'Read receipts', subtitle: 'See when your messages have been read.' },
];

export function getPlan(id?: string): Plan {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0];
}
