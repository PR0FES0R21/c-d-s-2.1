// ===========================================================================
// File: src/components/DailyCheckin.tsx (ENHANCED - Horizontal Timeline)
// Deskripsi: Daily Check-in dengan timeline horizontal yang responsif,
// menampilkan 7 hari di mobile dan 10 hari di desktop dengan today di tengah.
// ===========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, Zap, Gift, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiService';
import toast from 'react-hot-toast';

// Tipe untuk data dari API check-in history
interface CheckinRecord {
  checkinAt: string;
  streak_day_number: number;
}

// Tipe untuk setiap hari di timeline
interface TimelineDay {
  date: string;       // Format YYYY-MM-DD
  dayNumber: number;  // Tanggal (1-31)
  dayName: string;    // Nama hari (Mon, Tue, etc.)
  month: string;      // Nama bulan singkat (Jan, Feb, etc.)
  isToday: boolean;
  status: 'checked-in' | 'missed' | 'future'; // Status untuk styling
}

const DailyCheckin: React.FC = () => {
  const { user, fetchUserProfile } = useAuth();
  const [timelineDays, setTimelineDays] = useState<TimelineDay[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fungsi untuk mengecek apakah user sudah check-in hari ini
  const hasCheckedInToday = (): boolean => {
    if (!user?.last_daily_checkin) return false;
    const todayUTC = new Date();
    const lastCheckinUTC = new Date(user.last_daily_checkin);
    return todayUTC.getUTCDate() === lastCheckinUTC.getUTCDate() &&
           todayUTC.getUTCMonth() === lastCheckinUTC.getUTCMonth() &&
           todayUTC.getUTCFullYear() === lastCheckinUTC.getUTCFullYear();
  };
  
  const todayCheckedIn = useMemo(() => hasCheckedInToday(), [user?.last_daily_checkin]);

  useEffect(() => {
    if (user) {
      const fetchCheckinHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const response = await apiClient.get<{ history: CheckinRecord[] }>('/missions/me/checkin-history');
          const historyData = response.data.history || [];
          
          // Mengubah array history menjadi Set untuk pencarian cepat (O(1))
          const historyDateSet = new Set(
            historyData.map(record => record.checkinAt.split('T')[0])
          );

          generateTimelineCalendar(historyDateSet);

        } catch (error) {
          console.error("Failed to fetch check-in history:", error);
          generateTimelineCalendar(new Set()); // Buat timeline kosong jika API gagal
        } finally {
          setIsLoadingHistory(false);
        }
      };

      fetchCheckinHistory();
    }
  }, [user, todayCheckedIn]); // Tambahkan todayCheckedIn ke dependency

  const generateTimelineCalendar = (historySet: Set<string>) => {
    const today = new Date();
    const days: TimelineDay[] = [];

    // Tentukan range berdasarkan ukuran layar
    // Desktop: 10 hari (today di index 5), Mobile: 7 hari (today di index 3)
    const desktopRange = 10;
    const mobileRange = 7;
    
    // Untuk sekarang, kita generate untuk desktop range (10 hari)
    // CSS akan handle visibility untuk mobile
    const rangeSize = desktopRange;
    const centerIndex = Math.floor(rangeSize / 2); // Index 5 untuk desktop
    
    // Hitung startDate = today - centerIndex
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - centerIndex);

    // Generate timeline untuk rangeSize hari
    for (let i = 0; i < rangeSize; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const isToday = i === centerIndex;
      
      // Tentukan status
      let status: 'checked-in' | 'missed' | 'future';
      if (historySet.has(dateString) || (isToday && todayCheckedIn)) {
        status = 'checked-in';
      } else if (currentDate < today && !isToday) {
        status = 'missed';
      } else {
        status = 'future';
      }

      days.push({
        date: dateString,
        dayNumber: currentDate.getDate(),
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
        isToday: isToday,
        status: status
      });
    }
    
    setTimelineDays(days);
  };

  const handleCheckin = async () => {
    if (isCheckingIn || todayCheckedIn) return;

    setIsCheckingIn(true);
    const toastId = "daily-checkin";
    
    try {
      toast.loading("Processing daily check-in...", { id: toastId });
      
      const response = await apiClient.post('/missions/daily-checkin');
      const { message } = response.data;
      
      toast.success(message || "Daily check-in successful! +10 XP", { id: toastId });
      
      // Refresh user profile untuk mendapatkan data last_daily_checkin yang terbaru
      if (fetchUserProfile) {
        await fetchUserProfile();
        console.log('User profile refreshed after check-in');
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to complete daily check-in.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (!user) {
    return null; // Jangan render apa-apa jika user tidak ada
  }

  const streakCount = user.daily_checkin_streak || 0;

  return (
    <div className="bg-gray-900/30 rounded-lg p-3 sm:p-4"> 
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base lg:text-lg font-orbitron font-bold text-white flex items-center gap-2">
            <Calendar size={14} className="text-green-400 sm:w-4 sm:h-4" />
            Daily Operations Log
          </h3>
          <div className="px-2 py-1 sm:px-3 sm:py-1 bg-green-900/30 border border-green-500/30 rounded-full">
            <span className="text-green-400 font-mono text-xs sm:text-sm">
              {streakCount} day streak
            </span>
          </div>
        </div>

        {/* Timeline Horizontal */}
        {isLoadingHistory ? (
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Timeline Container */}
            <div className="relative overflow-hidden">
              {/* Desktop: Tampilkan semua 10 hari */}
              <div className="hidden lg:grid lg:grid-cols-10 gap-2">
                {timelineDays.map((day, index) => (
                  <TimelineItem key={day.date} day={day} />
                ))}
              </div>
              
              {/* Mobile: Tampilkan 7 hari tengah (index 1-7 dari 10 hari) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:hidden">
                {timelineDays.slice(1, 8).map((day, index) => (
                  <TimelineItem key={day.date} day={day} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Section */}
        <div className="flex items-stretch gap-2 sm:gap-3">
          <button
            onClick={handleCheckin}
            disabled={isCheckingIn || todayCheckedIn}
            className={`flex-grow px-3 py-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg font-orbitron text-xs sm:text-sm relative group overflow-hidden transition-all duration-300 ${
              todayCheckedIn
                ? 'bg-green-900/30 border border-green-500/30 text-green-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white hover:from-purple-500/30 hover:to-cyan-500/30 disabled:opacity-50'
            }`}
          >
            {!todayCheckedIn && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            )}
            <div className="relative flex items-center justify-center gap-1 sm:gap-2">
              {isCheckingIn ? (
                <><Loader2 size={12} className="animate-spin sm:w-4 sm:h-4" /><span>Processing...</span></>
              ) : todayCheckedIn ? (
                <><CheckCircle size={12} className="sm:w-4 sm:h-4" /><span>Mission Complete</span></>
              ) : (
                <><Zap size={12} className="text-cyan-400 sm:w-4 sm:h-4" /><span>Complete Mission</span></>
              )}
            </div>
          </button>

          {/* Info Hadiah */}
          <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 bg-gray-800/30 rounded-md sm:rounded-lg border border-gray-700/30">
            <Gift size={12} className="text-purple-400 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-mono text-gray-300">+10 XP</span>
          </div>
        </div>

        {/* Status info */}
        {todayCheckedIn && (
          <div className="text-center">


          </div>
        )}
      </div>
    </div>
  );
};

// Komponen Timeline Item yang dapat digunakan kembali
const TimelineItem: React.FC<{ day: TimelineDay }> = ({ day }) => {
  const getStatusStyles = () => {
    switch (day.status) {
      case 'checked-in':
        return 'border-green-500 bg-green-500/10 text-green-400';
      case 'missed':
        return 'border-red-500 bg-red-500/10 text-red-400';
      case 'future':
        return 'border-gray-600 bg-gray-900/30 text-gray-500';
      default:
        return 'border-gray-800 bg-gray-900/30 text-gray-500';
    }
  };

  const getTodayStyles = () => {
    if (!day.isToday) return '';
    return 'ring-2 ring-cyan-400 ring-opacity-50 animate-pulse-slow';
  };

  return (
    <div className="text-center">
      {/* Day Name */}
      <div className="text-[9px] sm:text-[10px] font-mono text-gray-400 mb-1">
        {day.dayName}
      </div>
      
      {/* Date Circle */}
      <div 
        className={`relative w-full aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-300 ${getStatusStyles()} ${getTodayStyles()}`}
        title={`${day.date} - ${day.status}`}
      >
        {/* Day Number */}
        <span className="font-orbitron text-xs sm:text-sm font-bold">
          {day.dayNumber}
        </span>
        
        {/* Month (hanya tampil di desktop untuk menghemat ruang) */}
        <span className="hidden sm:block text-[8px] font-mono opacity-70">
          {day.month}
        </span>
        
        {/* Status Indicator */}
        <div className="absolute -top-1 -right-1">
          {day.status === 'checked-in' && (
            <CheckCircle size={10} className="text-green-400 bg-gray-900 rounded-full sm:w-3 sm:h-3" />
          )}
          {day.isToday && day.status !== 'checked-in' && (
            <Clock size={10} className="text-cyan-400 bg-gray-900 rounded-full animate-pulse sm:w-3 sm:h-3" />
          )}
        </div>
        
        {/* Today Highlight */}
        {day.isToday && (
          <div className="absolute inset-0 rounded-lg border border-cyan-400/30 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default DailyCheckin;