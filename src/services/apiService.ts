// ===========================================================================
// File: src/services/apiService.ts (UPDATED - Cookie-based Authentication)
// Deskripsi: Utility untuk melakukan panggilan API ke backend dengan cookie authentication.
// ===========================================================================
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AlliesListResponse, MissionDirective, UserBadge, MissionProgressSummary } from '../types/user';
import { TwitterOAuthInitiateResponse, AuthSuccessResponse, ChallengeResponse } from '../types/auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Penting: untuk mengirim cookies secara otomatis
});

// Hapus interceptor untuk Authorization header karena sekarang menggunakan cookies
apiClient.interceptors.request.use(
  (config) => {
    // Tidak perlu menambahkan Authorization header lagi
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cookie expired atau invalid, bisa trigger logout di context
      console.warn('Authentication failed - cookie may be expired');
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const getChallengeMessage = async (walletAddress: string): Promise<ChallengeResponse> => {
  try {
    const response = await apiClient.get<ChallengeResponse>('/auth/challenge', {
      params: { walletAddress }
    });
    return response.data;
  } catch (error) {
    console.error("Error getting challenge message:", error);
    throw error;
  }
};

export const connectWallet = async (connectPayload: {
  walletAddress: string;
  message: string;
  signature: string;
  nonce: string;
  referral_code_input?: string;
}): Promise<AuthSuccessResponse> => {
  try {
    const response = await apiClient.post<AuthSuccessResponse>('/auth/connect', connectPayload);
    return response.data;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<AuthSuccessResponse> => {
  try {
    const response = await apiClient.post<AuthSuccessResponse>('/auth/logout');
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// User endpoints
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

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