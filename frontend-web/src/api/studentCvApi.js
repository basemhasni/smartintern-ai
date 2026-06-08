import axiosClient from './axiosClient.js';

export const getStudentCvs = async () => {
  const response = await axiosClient.get('/api/students/cv');
  return response.data.cvs || [];
};

export const getStudentCvById = async (id) => {
  const response = await axiosClient.get(`/api/students/cv/${id}`);
  return response.data.cv;
};

export const uploadStudentCv = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('cv', file);

  const response = await axiosClient.post('/api/students/cv/upload', formData, {
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) {
        return;
      }

      onProgress(Math.round((event.loaded * 100) / event.total));
    },
  });

  return {
    message: response.data.message,
    cv: response.data.cv,
    ragIndexed: Boolean(response.data.ragIndexed),
    analysisFailed: response.data.message?.includes('AI analysis failed') || Boolean(response.data.cv?.analysisJson?.error),
  };
};

export const deleteStudentCv = async (id) => {
  const response = await axiosClient.delete(`/api/students/cv/${id}`);
  return response.data;
};
