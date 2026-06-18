import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { OnboardingForm } from '@/features/onboarding/config';

type EditProfileDraftContextValue = {
  draft: OnboardingForm | null;
  beginDraft: (profile: OnboardingForm) => void;
  patchDraft: (partial: Partial<OnboardingForm>) => void;
  endDraft: () => void;
};

const EditProfileDraftContext = createContext<EditProfileDraftContextValue | null>(null);

export default function EditProfileDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingForm | null>(null);

  const beginDraft = useCallback((profile: OnboardingForm) => {
    setDraft(profile);
  }, []);

  const patchDraft = useCallback((partial: Partial<OnboardingForm>) => {
    setDraft((current) => (current ? { ...current, ...partial } : current));
  }, []);

  const endDraft = useCallback(() => {
    setDraft(null);
  }, []);

  const value = useMemo(
    () => ({ draft, beginDraft, patchDraft, endDraft }),
    [draft, beginDraft, patchDraft, endDraft],
  );

  return <EditProfileDraftContext.Provider value={value}>{children}</EditProfileDraftContext.Provider>;
}

export function useEditProfileDraft(): EditProfileDraftContextValue {
  const context = useContext(EditProfileDraftContext);
  if (!context) {
    throw new Error('useEditProfileDraft must be used within an EditProfileDraftProvider');
  }
  return context;
}
