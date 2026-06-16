import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type PlanId = 'monthly' | 'yearly';

type PremiumContextValue = {
  isPremium: boolean;
  plan: PlanId | null;
  activate: (plan: PlanId) => void;
  deactivate: () => void;
};

const PremiumContext = createContext<PremiumContextValue | null>(null);

export default function PremiumProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanId | null>(null);

  const activate = useCallback((next: PlanId) => setPlan(next), []);
  const deactivate = useCallback(() => setPlan(null), []);

  const value = useMemo<PremiumContextValue>(
    () => ({ isPremium: plan !== null, plan, activate, deactivate }),
    [plan, activate, deactivate],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumContextValue {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
