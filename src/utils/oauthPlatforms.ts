// ===========================================================================
// File: src/utils/oauthPlatforms.ts (NEW)
// Deskripsi: Konfigurasi platform OAuth yang didukung
// ===========================================================================
import { Twitter, MessageSquare, Send, Github } from 'lucide-react';
import { OAuthPlatform, OAuthPlatformConfig } from '../types/auth';

export const OAUTH_PLATFORMS: Record<OAuthPlatform, OAuthPlatformConfig> = {
  x: {
    name: 'x',
    displayName: 'X (Twitter)',
    icon: 'Twitter',
    color: 'text-blue-400',
    endpoint: '/auth/x/initiate-oauth'
  },
  discord: {
    name: 'discord',
    displayName: 'Discord',
    icon: 'MessageSquare',
    color: 'text-indigo-400',
    endpoint: '/auth/discord/initiate-oauth'
  },
  telegram: {
    name: 'telegram',
    displayName: 'Telegram',
    icon: 'Send',
    color: 'text-blue-500',
    endpoint: '/auth/telegram/initiate-oauth'
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    icon: 'Github',
    color: 'text-gray-400',
    endpoint: '/auth/github/initiate-oauth'
  }
};

export const getOAuthPlatformConfig = (platform: string): OAuthPlatformConfig | null => {
  return OAUTH_PLATFORMS[platform as OAuthPlatform] || null;
};

export const getIconComponent = (iconName: string) => {
  const icons = {
    Twitter,
    MessageSquare,
    Send,
    Github
  };
  return icons[iconName as keyof typeof icons] || Twitter;
};

// Helper function to check if user is connected to a platform
export const isConnectedToPlatform = (user: any, platform: string): boolean => {
  // Check legacy twitter_data for backward compatibility
  if (platform === 'x' && user?.twitter_data?.twitter_username) {
    return true;
  }
  
  // Check new oauth_connections array
  if (user?.oauth_connections && Array.isArray(user.oauth_connections)) {
    return user.oauth_connections.some((conn: any) => conn.platform === platform);
  }
  
  return false;
};

// Helper function to get platform connection data
export const getPlatformConnectionData = (user: any, platform: string) => {
  // Check legacy twitter_data for backward compatibility
  if (platform === 'x' && user?.twitter_data?.twitter_username) {
    return {
      platform: 'x',
      user_id: user.twitter_data.twitter_user_id,
      username: user.twitter_data.twitter_username,
      connected_at: user.twitter_data.connected_at
    };
  }
  
  // Check new oauth_connections array
  if (user?.oauth_connections && Array.isArray(user.oauth_connections)) {
    return user.oauth_connections.find((conn: any) => conn.platform === platform);
  }
  
  return null;
};