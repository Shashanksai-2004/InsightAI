import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
})

export default {
  getHealth: () =>
    http.get('/health'),

  uploadFiles: (files, onProgress) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    return http.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(e.loaded / e.total)
      },
    })
  },

  askQuestion: (question, sessionId = 'default') =>
    http.post('/ask', { question, session_id: sessionId }),

  exportData: (format = 'csv') =>
    http.get('/export', {
      params: { format },
      responseType: format === 'csv' ? 'text' : 'json',
    }),

  getFiles: () =>
    http.get('/files'),

  getHistory: (sessionId = 'default') =>
    http.get('/history', { params: { session_id: sessionId } }),

  generateReport: (data) =>
    http.post('/report', data, { responseType: 'blob' }),

  clearAll: () =>
    http.post('/clear'),
}
