// ===========================================================================
// File: src/hooks/useRankUpDetection.ts (NEW)
// Deskripsi: Custom hook untuk deteksi rank-up dan manajemen localStorage
// ===========================================================================
import { useState, useEffect } from 'react';
import { UserPublic } from '../types/user';

interface RankUpData {
  shouldShowRankUp: boolean;
  oldRank: string;
  newRank: string;
  oldRankImageUrl: string;
  newRankImageUrl: string;
}

const RANK_STORAGE_KEY = 'cigar_user_rank';
const RANK_IMAGE_STORAGE_KEY = 'cigar_user_rank_image';

export const useRankUpDetection = (user: UserPublic | null): RankUpData & {
  dismissRankUp: () => void;
} => {
  const [rankUpData, setRankUpData] = useState<RankUpData>({
    shouldShowRankUp: false,
    oldRank: '',
    newRank: '',
    oldRankImageUrl: '',
    newRankImageUrl: ''
  });

  useEffect(() => {
    if (!user) {
      // Reset state jika user logout
      setRankUpData({
        shouldShowRankUp: false,
        oldRank: '',
        newRank: '',
        oldRankImageUrl: '',
        newRankImageUrl: ''
      });
      return;
    }

    const currentRank = user.rank;
    const currentRankImageUrl = user.profile.rankBadgeUrl || "/assets/chevron_rank_badge.png";
    
    const storedRank = localStorage.getItem(RANK_STORAGE_KEY);
    const storedRankImageUrl = localStorage.getItem(RANK_IMAGE_STORAGE_KEY);

    // Jika belum ada data tersimpan (first-time user)
    if (!storedRank || !storedRankImageUrl) {
      console.log("First-time user detected, storing initial rank data");
      localStorage.setItem(RANK_STORAGE_KEY, currentRank);
      localStorage.setItem(RANK_IMAGE_STORAGE_KEY, currentRankImageUrl);
      return;
    }

    // Bandingkan rank saat ini dengan yang tersimpan
    if (storedRank !== currentRank) {
      console.log(`Rank up detected: ${storedRank} → ${currentRank}`);
      
      setRankUpData({
        shouldShowRankUp: true,
        oldRank: storedRank,
        newRank: currentRank,
        oldRankImageUrl: storedRankImageUrl,
        newRankImageUrl: currentRankImageUrl
      });
    }
  }, [user]);

  const dismissRankUp = () => {
    if (!user) return;

    // Update localStorage dengan data terbaru
    const currentRank = user.rank;
    const currentRankImageUrl = user.profile.rankBadgeUrl || "/assets/chevron_rank_badge.png";
    
    localStorage.setItem(RANK_STORAGE_KEY, currentRank);
    localStorage.setItem(RANK_IMAGE_STORAGE_KEY, currentRankImageUrl);

    // Reset state
    setRankUpData({
      shouldShowRankUp: false,
      oldRank: '',
      newRank: '',
      oldRankImageUrl: '',
      newRankImageUrl: ''
    });

    console.log("Rank up dismissed and localStorage updated");
  };

  return {
    ...rankUpData,
    dismissRankUp
  };
};