// ===========================================================================
// File: src/types/user.ts (UPDATED - Multi-platform OAuth Support)
// Deskripsi: Definisi tipe untuk data pengguna, misi, dan badge dengan support multi-platform OAuth.
// ===========================================================================
export interface UserProfile {
  commanderName: string;
  rankBadgeUrl?: string;
  rankProgressPercent: number;
  nextRank?: string;
}

export interface UserSystemStatus {
  starDate?: string;
  signalStatus: string;
  networkLoadPercent?: number;
  anomaliesResolved?: number;
}

// Tipe untuk data OAuth platform yang disimpan di user
export interface UserOAuthData {
  platform: string; // 'x', 'discord', 'telegram', etc.
  user_id: string;
  username: string;
  connected_at: string;
  additional_data?: Record<string, any>; // For platform-specific data
}

// Legacy type untuk backward compatibility
export interface UserTwitterData {
  twitter_user_id: string;
  twitter_username: string;
  connected_at: string;
}

export interface UserPublic {
  id: string;
  walletAddress: string;
  username: string;
  email?: string;
  rank: string;
  xp: number;
  referralCode?: string;
  alliesCount: number;
  profile: UserProfile;
  systemStatus?: UserSystemStatus;
  twitter_data?: UserTwitterData; // Keep for backward compatibility
  oauth_connections?: UserOAuthData[]; // New multi-platform support
  lastLogin?: string;
  last_daily_checkin?: string;
  createdAt: string;
  daily_checkin_streak: Number
}

export interface AllyInfo {
  id: string;
  username: string;
  rank: string;
  joinedAt: string;
}

export interface AlliesListResponse {
  totalAllies: number;
  allies: AllyInfo[];
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserBadge {
  id: string;
  badge_doc_id: string;
  badgeId_str: string;
  name: string;
  imageUrl: string;
  description?: string;
  acquiredAt: string;
}

export interface MissionAction {
  label: string;
  type: "external_link" | "api_call" | "disabled" | "completed" | "oauth_connect" | "claim_if_eligible" | "redirect_and_verify";
  url?: string;
  platform?: string; // For oauth_connect actions
}

export type MissionStatus = "available" | "in_progress" | "completed" | "pending_verification" | "failed";
export type MissionType = "connect" | "interact" | "contribute" | "special";

export interface MissionDirective {
  _id: string;
  id: string;
  missionId_str: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardBadge?: {
    badgeId_str: string;
    name: string;
    imageUrl: string;
  };
  status: MissionStatus;
  type: MissionType;
  action: MissionAction;
  prerequisites?: string[];
  order?: number;
  currentProgress?: number;
  requiredProgress?: number;
}

export interface MissionProgressSummary {
  completedMissions: number;
  totalMissions: number;
  activeSignals: number;
}

export interface TwitterOAuthInitiateResponse {
  authorization_url: string; 
}