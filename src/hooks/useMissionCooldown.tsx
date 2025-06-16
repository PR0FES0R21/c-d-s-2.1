// ===========================================================================
// File: src/hooks/useMissionCooldown.ts (NEW)
// Deskripsi: Custom hook untuk mengelola cooldown mission like dan retweet
// ===========================================================================
import { useState, useEffect } from 'react';

interface CooldownState {
  isOnCooldown: boolean;
  remainingTime: number; // dalam detik
  formattedTime: string; // format MM:SS
}

interface CooldownData {
  like: CooldownState;
  retweet: CooldownState;
}

const COOLDOWN_DURATION = 15 * 60 * 1000; // 15 menit dalam milliseconds
const LIKE_COOLDOWN_KEY = 'cigar_like_cooldown';
const RETWEET_COOLDOWN_KEY = 'cigar_retweet_cooldown';

// Helper function untuk format waktu
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Helper function untuk mengecek dan menghitung cooldown
const calculateCooldown = (storageKey: string): CooldownState => {
  const lastActionTime = localStorage.getItem(storageKey);
  
  if (!lastActionTime) {
    return {
      isOnCooldown: false,
      remainingTime: 0,
      formattedTime: '00:00'
    };
  }

  const lastAction = parseInt(lastActionTime);
  const now = Date.now();
  const timePassed = now - lastAction;
  
  if (timePassed >= COOLDOWN_DURATION) {
    // Cooldown sudah selesai, hapus dari localStorage
    localStorage.removeItem(storageKey);
    return {
      isOnCooldown: false,
      remainingTime: 0,
      formattedTime: '00:00'
    };
  }

  const remainingMs = COOLDOWN_DURATION - timePassed;
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return {
    isOnCooldown: true,
    remainingTime: remainingSeconds,
    formattedTime: formatTime(remainingSeconds)
  };
};

export const useMissionCooldown = () => {
  const [cooldownData, setCooldownData] = useState<CooldownData>({
    like: calculateCooldown(LIKE_COOLDOWN_KEY),
    retweet: calculateCooldown(RETWEET_COOLDOWN_KEY)
  });

  // Update cooldown setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownData({
        like: calculateCooldown(LIKE_COOLDOWN_KEY),
        retweet: calculateCooldown(RETWEET_COOLDOWN_KEY)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Function untuk memulai cooldown
  const startCooldown = (missionType: 'like' | 'retweet') => {
    const now = Date.now();
    const storageKey = missionType === 'like' ? LIKE_COOLDOWN_KEY : RETWEET_COOLDOWN_KEY;
    
    localStorage.setItem(storageKey, now.toString());
    
    // Update state immediately
    setCooldownData(prev => ({
      ...prev,
      [missionType]: {
        isOnCooldown: true,
        remainingTime: COOLDOWN_DURATION / 1000,
        formattedTime: formatTime(COOLDOWN_DURATION / 1000)
      }
    }));
  };

  // Function untuk mengecek apakah mission tertentu sedang cooldown
  const isMissionOnCooldown = (missionIdStr: string): boolean => {
    const lowerMissionId = missionIdStr.toLowerCase();
    
    if (lowerMissionId.includes('like')) {
      return cooldownData.like.isOnCooldown;
    }
    
    if (lowerMissionId.includes('retweet')) {
      return cooldownData.retweet.isOnCooldown;
    }
    
    return false;
  };

  // Function untuk mendapatkan cooldown info untuk mission tertentu
  const getMissionCooldownInfo = (missionIdStr: string): CooldownState | null => {
    const lowerMissionId = missionIdStr.toLowerCase();
    
    if (lowerMissionId.includes('like')) {
      return cooldownData.like;
    }
    
    if (lowerMissionId.includes('retweet')) {
      return cooldownData.retweet;
    }
    
    return null;
  };

  // Function untuk mendapatkan tipe mission berdasarkan missionId_str
  const getMissionType = (missionIdStr: string): 'like' | 'retweet' | null => {
    const lowerMissionId = missionIdStr.toLowerCase();
    
    if (lowerMissionId.includes('like')) {
      return 'like';
    }
    
    if (lowerMissionId.includes('retweet')) {
      return 'retweet';
    }
    
    return null;
  };

  return {
    cooldownData,
    startCooldown,
    isMissionOnCooldown,
    getMissionCooldownInfo,
    getMissionType
  };
};