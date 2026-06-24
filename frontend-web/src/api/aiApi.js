import axiosClient from './axiosClient.js';
import { normalizeOfferQuality, normalizeSkillGapSimulation } from '../utils/ai.js';

export const analyzeOfferQuality = async (offer) => {
  const response = await axiosClient.post('/api/ai/analyze-offer-quality', offer);
  return normalizeOfferQuality(response.data);
};

export const simulateSkillGaps = async (matchingResult, selectedSkills = [], options = {}) => {
  const response = await axiosClient.post('/api/ai/skill-gap-simulator', {
    matchingResult,
    selectedSkills,
    options: {
      maxCombinations: 3,
      includeProjects: true,
      includeDecisionTrace: true,
      simulationMode: 'REALISTIC',
      ...options,
    },
  });
  return normalizeSkillGapSimulation(response.data);
};

export const orchestrateAi = async (payload) => {
  const response = await axiosClient.post('/api/ai/orchestrate', payload);
  return response.data;
};
