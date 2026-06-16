import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { buildDefaultValues, type FilterValue, type FilterValues } from './config';

type FiltersContextValue = {
  applied: FilterValues;
  draft: FilterValues;
  setDraftField: (id: string, value: FilterValue) => void;
  syncDraftFromApplied: () => void;
  applyDraft: () => void;
  clearDraft: () => void;
  clearAllFilters: () => void;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export default function FiltersProvider({ children }: { children: ReactNode }) {
  const [applied, setApplied] = useState<FilterValues>(buildDefaultValues);
  const [draft, setDraft] = useState<FilterValues>(buildDefaultValues);

  const appliedRef = useRef(applied);
  appliedRef.current = applied;
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const setDraftField = useCallback((id: string, value: FilterValue) => {
    setDraft((previous) => ({ ...previous, [id]: value }));
  }, []);

  const syncDraftFromApplied = useCallback(() => {
    setDraft({ ...appliedRef.current });
  }, []);

  const applyDraft = useCallback(() => {
    setApplied({ ...draftRef.current });
  }, []);

  const clearDraft = useCallback(() => {
    setDraft(buildDefaultValues());
  }, []);

  const clearAllFilters = useCallback(() => {
    const defaults = buildDefaultValues();
    setDraft(defaults);
    setApplied(buildDefaultValues());
  }, []);

  const value = useMemo(
    () => ({ applied, draft, setDraftField, syncDraftFromApplied, applyDraft, clearDraft, clearAllFilters }),
    [applied, draft, setDraftField, syncDraftFromApplied, applyDraft, clearDraft, clearAllFilters],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): FiltersContextValue {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}
