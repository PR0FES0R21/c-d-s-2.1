// ===========================================================================
// File: src/services/apiService.ts (PASTIKAN EKSPOR INI BENAR)
// Deskripsi: Utility untuk melakukan panggilan API ke backend.
// ===========================================================================
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AlliesListResponse, MissionDirective, UserBadge, MissionProgressSummary } from '../types/user';
import { TwitterOAuthInitiateResponse } from '../types/auth'; // Pastikan path ini benar

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cigar_ds_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getMyAllies = async (page: number = 1, limit: number = 5): Promise<AlliesListResponse> => {
  try {
    const response = await apiClient.get<AlliesListResponse>('/users/me/allies', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching allies:", error);
    throw error; 
  }
};

export const getMissionDirectives = async (): Promise<MissionDirective[]> => {
  try {
    const response = await apiClient.get<{ directives: MissionDirective[] }>('/missions/directives'); 
    return response.data.directives || [];
  } catch (error) {
    console.error("Error fetching mission directives:", error);
    throw error;
  }
};

export const getMyBadges = async (): Promise<UserBadge[]> => {
  try {
    const response = await apiClient.get<{ badges: UserBadge[] }>('/users/me/badges');
    return response.data.badges || [];
  } catch (error) {
    console.error("Error fetching user badges:", error);
    throw error;
  }
};

export const getMyMissionProgressSummary = async (): Promise<MissionProgressSummary> => {
  try {
    const response = await apiClient.get<MissionProgressSummary>('/missions/me/summary');
    return response.data;
  } catch (error) {
    console.error("Error fetching mission progress summary:", error);
    return { completedMissions: 0, totalMissions: 0, activeSignals: 0 }; 
  }
};

export const completeMissionDirective = async (missionIdStr: string, completionData?: any): Promise<any> => {
  try {
    const response = await apiClient.post(`/missions/directives/${missionIdStr}/complete`, completionData || {});
    return response.data;
  } catch (error) {
    console.error(`Error completing mission ${missionIdStr}:`, error);
    throw error;
  }
};

// PASTIKAN FUNGSI INI DI-EXPORT DENGAN BENAR SEBAGAI NAMED EXPORT
export const getTwitterOAuthUrl = async (): Promise<TwitterOAuthInitiateResponse> => {
    try {
        const response = await apiClient.get<TwitterOAuthInitiateResponse>('/auth/x/initiate-oauth');
        return response.data;
    } catch (error) {
        console.error("Error fetching Twitter OAuth URL:", error);
        throw error;
    }
};

export default apiClient;