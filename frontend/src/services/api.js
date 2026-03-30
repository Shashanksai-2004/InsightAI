import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export const uploadFiles = async (files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return response.data;
};

export const askQuestion = async (question, sessionId = 'default') => {
  const response = await api.post('/ask', {
    question,
    session_id: sessionId,
  });
  return response.data;
};

export const exportData = async (format = 'csv') => {
  const response = await api.get('/export', {
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json',
  });
  return response;
};

export const generateReport = async (data) => {
  const response = await api.post('/report', data, {
    responseType: 'blob',
  });
  return response;
};

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getFiles = async () => {
  const response = await api.get('/files');
  return response.data;
};

export const getHistory = async (sessionId = 'default') => {
  const response = await api.get('/history', { params: { session_id: sessionId } });
  return response.data;
};

export const clearAll = async () => {
  const response = await api.post('/clear');
  return response.data;
};

export default api;
