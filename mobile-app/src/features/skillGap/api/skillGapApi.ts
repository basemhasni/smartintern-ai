import { apiRequest } from '@/core/api/apiClient';
import type { SimulationMode, SkillGapSimulationResult } from '../models/skillGapSimulation';
import { normalizeSkillGapSimulation } from '../utils/normalizeSkillGapSimulation';
export const skillGapApi = { async simulate(offerId: string, mode: SimulationMode): Promise<SkillGapSimulationResult> { const response = await apiRequest<unknown>(`/offers/${encodeURIComponent(offerId)}/skill-gap-simulation`, { method: 'POST', body: JSON.stringify({ mode }), timeoutMs: 90000 }); return normalizeSkillGapSimulation(response); } };
