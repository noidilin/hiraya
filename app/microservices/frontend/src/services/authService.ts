import apiClient from './api';
import { ApiEnvelope, AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

const unwrapEnvelope = <T>(envelope: ApiEnvelope<T>): T => {
  if (envelope.success) {
    return envelope.data;
  }

  throw new Error(envelope.error);
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/login', credentials);
    return unwrapEnvelope(response.data);
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/register', credentials);
    return unwrapEnvelope(response.data);
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await apiClient.post<ApiEnvelope<{ token: string }>>('/auth/refresh', { refreshToken });
    return unwrapEnvelope(response.data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiEnvelope<User>>('/auth/me');
    return unwrapEnvelope(response.data);
  },
};
