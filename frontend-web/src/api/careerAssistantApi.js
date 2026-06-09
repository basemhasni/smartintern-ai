import axiosClient from './axiosClient.js';

export const generateCareerAdvice = async (payload) => {
  const response = await axiosClient.post('/api/students/career-assistant', payload);

  return {
    message: response.data.message,
    careerAdvice: response.data.careerAdvice,
    ragContext: response.data.ragContext,
  };
};
