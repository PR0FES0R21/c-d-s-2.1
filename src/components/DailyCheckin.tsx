// ===========================================================================
// File: src/components/DailyCheckin.tsx (OPTIMIZED - Responsive Design)
// Deskripsi: Versi ringkas dari Daily Checkin yang dioptimalkan untuk ukuran
// yang lebih kecil dan responsif di semua perangkat.
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

// Tipe untuk setiap hari di kalender
interface CheckinDay {
  date: string;       // Format YYYY-MM-DD
  isToday: boolean;
  isCheckedIn: boolean;
  dayNumber: number;
  dayName: string;
}


const DailyCheckin: React.FC = () => {
  const { user, fetchUserProfile } = useAuth();
  const [checkinDays, setCheckinDays] = useState<CheckinDay[]>([]);
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

          generateCheckinCalendar(historyDateSet);

        } catch (error) {
          console.error("Failed to fetch check-in history:", error);
          generateCheckinCalendar(new Set()); // Buat kalender kosong jika API gagal
        } finally {
          setIsLoadingHistory(false);
        }
      };

      fetchCheckinHistory();
    }
  }, [user]); // Jalankan setiap kali user berubah

  const generateCheckinCalendar = (historySet: Set<string>) => {
    const today = new Date();
    const days: CheckinDay[] = [];

    // Buat 10 hari terakhir (dari -9 hari yang lalu sampai hari ini)
    for (let i = -9; i <= 0; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const isToday = i === 0;

      days.push({
        date: dateString,
        isToday: isToday,
        isCheckedIn: historySet.has(dateString) || (isToday && todayCheckedIn),
        dayNumber: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    setCheckinDays(days);
  };


  const handleCheckin = async () => {
    if (isCheckingIn || todayCheckedIn) return;

    setIsCheckingIn(true);
    const toastId = "daily-checkin";
    
    try {
      toast.loading("Processing daily check-in...", { id: toastId });
      
      const response = await apiClient.post('/missions/daily-checkin');
      const { message } = response.data;
      
      // setCurrentStreak(prev => prev + 1);
      
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

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (!user) {
    return null; // Jangan render apa-apa jika user tidak ada
  }

  const streakCount = user.daily_checkin_streak || 0;
  console.log(user)

  return (
    // Wrapper untuk kontrol responsif dengan ukuran yang lebih kecil
    <div className="bg-gray-900/30 rounded-lg p-2 sm:p-3"> 
      <div className="space-y-2 sm:space-y-3">
        {/* Header - Diperkecil */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base lg:text-lg font-orbitron font-bold text-white flex items-center gap-1 sm:gap-2">
            <Calendar size={12} className="text-green-400 sm:w-4 sm:h-4" />
            Daily Operations Log
          </h3>
          <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-900/30 border border-green-500/30 rounded-full">
            <span className="text-green-400 font-mono text-xs sm:text-sm">
              {streakCount} day streak
            </span>
          </div>
        </div>

        {/* Grid Kalender - Responsif 7 (mobile) & 10 (desktop) hari */}
        {isLoadingHistory ? (
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="grid grid-cols-7 lg:grid-cols-10 gap-1 sm:gap-2">
            {checkinDays.map((day, index) => (
              <div 
                key={day.date} 
                className={`text-center ${index < 3 ? 'hidden lg:block' : ''}`} // Sembunyikan 3 hari pertama di layar kecil
              >
                <div className="text-[9px] sm:text-[10px] font-mono text-gray-400 mb-0.5 sm:mb-1">
                  {day.dayName}
                </div>
                <div 
                  className={`relative w-full aspect-square rounded-md sm:rounded-lg border flex items-center justify-center transition-all duration-300 ${
                    day.isToday ? 'border-cyan-400 bg-cyan-400/10' : 
                    day.isCheckedIn ? 'border-green-500 bg-green-500/10' : 
                    'border-gray-800 bg-gray-900/30'
                  }`}
                  title={day.date}
                >
                  <span className={`font-orbitron text-xs sm:text-sm ${
                    day.isToday ? 'text-cyan-400' :
                    day.isCheckedIn ? 'text-green-400' :
                    'text-gray-500'
                  }`}>
                    {day.dayNumber}
                  </span>
                  {day.isCheckedIn && (
                    <div className="absolute -top-0.5 -right-0.5">
                      <CheckCircle size={10} className="text-green-400 bg-gray-900 rounded-full sm:w-3 sm:h-3" />
                    </div>
                  )}
                  {day.isToday && !todayCheckedIn && (
                     <div className="absolute -top-0.5 -right-0.5">
                       <Clock size={10} className="text-cyan-400 bg-gray-900 rounded-full animate-pulse sm:w-3 sm:h-3" />
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tombol Check-in - Diperkecil */}
        <div className="flex items-stretch gap-2 sm:gap-3">
          <button
            onClick={handleCheckin}
            disabled={isCheckingIn || todayCheckedIn}
            className={`flex-grow px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg font-orbitron text-xs sm:text-sm relative group overflow-hidden transition-all duration-300 ${
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
                <><CheckCircle size={12} className="sm:w-4 sm:h-4" /><span>Today's Mission Complete</span></>
              ) : (
                <><Zap size={12} className="text-cyan-400 sm:w-4 sm:h-4" /><span>Complete Mission</span></>
              )}
            </div>
          </button>

          {/* Info Hadiah - Diperkecil */}
          <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 bg-gray-800/30 rounded-md sm:rounded-lg border border-gray-700/30">
            <Gift size={12} className="text-purple-400 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-mono text-gray-300">+10 XP</span>
          </div>
        </div>

        {/* Status info - tambahan untuk memberikan feedback yang lebih jelas */}
        {todayCheckedIn && (
          <div className="text-center">
            <p className="text-xs font-mono text-green-400">
              ✓ Daily mission completed for today
            </p>
            {user.last_daily_checkin && (
              <p className="text-xs font-mono text-gray-500 mt-1">
                Last check-in: {new Date(user.last_daily_checkin).toLocaleDateString()} {new Date(user.last_daily_checkin).toLocaleTimeString()} UTC
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyCheckin;