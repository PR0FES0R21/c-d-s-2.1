// ===========================================================================
// File: src/types/user.ts (MODIFIKASI: Tambahkan UserTwitterData ke UserPublic)
// Deskripsi: Definisi tipe untuk data pengguna, misi, dan badge.
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

// Tipe baru untuk data Twitter yang disimpan di user
export interface UserTwitterData {
  twitter_user_id: string;
  twitter_username: string; // Handle @username
  connected_at: string; // Tanggal ISO
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
  twitter_data?: UserTwitterData; // Tambahkan field ini
  lastLogin?: string;
  createdAt: string;
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
  badge_doc_id: string; // ID dari BadgeInDB
  badgeId_str: string;
  name: string;
  imageUrl: string;
  description?: string;
  acquiredAt: string;
}

export interface MissionAction {
  label: string;
  type: "external_link" | "api_call" | "disabled" | "completed" | "oauth_connect"; // Tambahkan oauth_connect
  url?: string;
}

export type MissionStatus = "available" | "in_progress" | "completed" | "pending_verification" | "failed";
export type MissionType = "social" | "engagement" | "community" | "special";


export interface MissionDirective {
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
}

export interface MissionProgressSummary {
  completedMissions: number;
  totalMissions: number;
  activeSignals: number;
}

export interface TwitterOAuthInitiateResponse {
  authorization_url: string; 
}