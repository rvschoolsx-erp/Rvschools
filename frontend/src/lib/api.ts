import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('accessToken');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token!));
  failedQueue = [];
};

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (original.headers) original.headers['Authorization'] = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        Cookies.set('accessToken', newToken, { secure: true, sameSite: 'strict' });
        processQueue(null, newToken);
        if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        Cookies.remove('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = (error.response?.data as { message?: string })?.message || 'Something went wrong';
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Typed API helpers
export const apiService = {
  auth: {
    login:          (data: { identifier: string; password: string; fcmToken?: string }) =>
                      api.post('/auth/login', data),
    logout:         () => api.post('/auth/logout'),
    me:             () => api.get('/auth/me'),
    refresh:        () => api.post('/auth/refresh'),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
                      api.patch('/auth/change-password', data),
  },
  students: {
    getAll:   (params?: Record<string, unknown>) => api.get('/students', { params }),
    getById:  (id: string) => api.get(`/students/${id}`),
    create:   (data: unknown) => api.post('/students', data),
    update:   (id: string, data: unknown) => api.patch(`/students/${id}`, data),
    delete:   (id: string) => api.delete(`/students/${id}`),
    getStats: () => api.get('/students/stats'),
  },
  attendance: {
    mark:            (data: unknown) => api.post('/attendance', data),
    getSection:      (sectionId: string, date: string) =>
                       api.get(`/attendance/section/${sectionId}`, { params: { date } }),
    getStudent:      (studentId: string, startDate: string, endDate: string) =>
                       api.get(`/attendance/student/${studentId}`, { params: { startDate, endDate } }),
    getMonthlyReport:(params: unknown) => api.get('/attendance/report/monthly', { params }),
    getDashboard:    () => api.get('/attendance/dashboard'),
  },
  marks: {
    enter:          (data: unknown) => api.post('/marks', data),
    getExam:        (examId: string, sectionId?: string) =>
                      api.get(`/marks/exam/${examId}`, { params: { sectionId } }),
    getStudent:     (studentId: string, academicYearId?: string) =>
                      api.get(`/marks/student/${studentId}`, { params: { academicYearId } }),
    getPerformance: (examId: string) => api.get(`/marks/exam/${examId}/performance`),
    generateReport: (data: { examId: string; studentId: string }) =>
                      api.post('/marks/report-card', data),
  },
  fees: {
    getStudent:    (studentId: string, academicYearId?: string) =>
                     api.get(`/fees/student/${studentId}`, { params: { academicYearId } }),
    getDashboard:  () => api.get('/fees/dashboard'),
    getOverdue:    () => api.get('/fees/overdue'),
    recordPayment: (data: unknown) => api.post('/fees/payment', data),
    generate:      (data: unknown) => api.post('/fees/generate', data),
  },
  exams: {
    getAll:   (params?: unknown) => api.get('/exams', { params }),
    getById:  (id: string) => api.get(`/exams/${id}`),
    create:   (data: unknown) => api.post('/exams', data),
    publish:  (id: string) => api.patch(`/exams/${id}/publish`),
  },
  homework: {
    getAll:  (params?: unknown) => api.get('/homework', { params }),
    create:  (data: unknown) => api.post('/homework', data),
    submit:  (id: string, data: unknown) => api.post(`/homework/${id}/submit`, data),
  },
  notifications: {
    getAll:      (unreadOnly?: boolean) => api.get('/notifications', { params: { unread: unreadOnly } }),
    markRead:    (ids: string[]) => api.patch('/notifications/read', { ids }),
    broadcast:   (data: unknown) => api.post('/notifications/broadcast', data),
  },
  analytics: {
    admin:   () => api.get('/analytics/admin'),
    teacher: (teacherId?: string) => api.get('/analytics/teacher', { params: { teacherId } }),
    student: (studentId: string) => api.get(`/analytics/student/${studentId}`),
  },
  reports: {
    reportCardPdf:     (examId: string, studentId: string) =>
                         `${API_URL}/reports/report-card/${examId}/${studentId}/pdf`,
    attendanceExport:  (params: unknown) => api.get('/reports/attendance/export', { params, responseType: 'blob' }),
  },
  schoolSettings: {
    get:    () => api.get('/school-settings'),
    update: (data: unknown) => api.put('/school-settings', data),
  },
};
