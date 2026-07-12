import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ApiError, normalizeApiError } from '@/core/api/apiError';
import { skillGapApi } from '../api/skillGapApi';
import type { SimulationMode, SkillGapSimulationResult } from '../models/skillGapSimulation';
type Value = {
    getResult: (offerId: string, mode: SimulationMode) => SkillGapSimulationResult | undefined;
    getLastSimulationAt: (offerId: string, mode: SimulationMode) => string | undefined;
    simulate: (offerId: string, mode: SimulationMode) => Promise<void>;
    isSimulating: boolean;
    error: string | null;
    clearError: () => void;
};
const C = createContext<Value | null>(null);
const key = (id: string, mode: SimulationMode) => `${id}:${mode}`;
const message = (e: unknown) => { if (e instanceof ApiError && e.status === 400 && /cv|candidate|matching/i.test(e.message))
    return 'Completez votre profil et ajoutez un CV analyse pour obtenir une simulation pertinente.'; if (e instanceof ApiError && [502, 503, 504].includes(e.status ?? 0))
    return 'La simulation est temporairement indisponible. Reessayez plus tard.'; return normalizeApiError(e); };
export function SkillGapProvider({ children }: {
    children: ReactNode;
}) { const [results, setResults] = useState<Record<string, SkillGapSimulationResult>>({}); const [times, setTimes] = useState<Record<string, string>>({}); const [isSimulating, setIsSimulating] = useState(false); const [error, setError] = useState<string | null>(null); const running = useRef(false); const simulate = useCallback(async (id: string, mode: SimulationMode) => { if (running.current)
    return; running.current = true; setIsSimulating(true); setError(null); try {
    const result = await skillGapApi.simulate(id, mode);
    setResults(c => ({ ...c, [key(id, mode)]: result }));
    setTimes(c => ({ ...c, [key(id, mode)]: new Date().toISOString() }));
}
catch (e) {
    setError(message(e));
}
finally {
    running.current = false;
    setIsSimulating(false);
} }, []); const value = useMemo<Value>(() => ({ getResult: (id, mode) => results[key(id, mode)], getLastSimulationAt: (id, mode) => times[key(id, mode)], simulate, isSimulating, error, clearError: () => setError(null) }), [results, times, simulate, isSimulating, error]); return <C.Provider value={value}>{children}</C.Provider>; }
;
export const useSkillGap = () => { const value = useContext(C); if (!value)
    throw new Error('useSkillGap must be used inside SkillGapProvider'); return value; };
