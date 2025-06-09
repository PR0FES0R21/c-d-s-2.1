// ===========================================================================
// File: src/components/DailyCheckin.tsx (MODIFIED - Integrated Design)
// Deskripsi: Versi ringkas dari Daily Checkin yang dirancang untuk menyatu
// di dalam komponen lain seperti ProjectStatus.
// ===========================================================================

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Zap, Gift, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiService';
import toast from 'react-hot-toast';

interface CheckinDay {
  date: string;
  isCheckedIn: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  dayNumber: number;
}

const DailyCheckin: React.FC = () => {
  const { user } = useAuth(); // isAuthenticated tidak perlu, karena parent component sudah mengecek
  const [checkinDays, setCheckinDays] = useState<CheckinDay[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  useEffect(() => {
    // Hanya jalankan jika user ada
    if (user) {
      generateCheckinCalendar();
      // TODO: Ganti data simulasi ini dengan data dari API
      setCurrentStreak(3);
    }
  }, [user, todayCheckedIn]); // Jalankan ulang jika user berubah atau setelah check-in

  const generateCheckinCalendar = () => {
    const today = new Date();
    const days: CheckinDay[] = [];
    
    // Buat 7 hari (minggu ini)
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const isToday = i === 0;
      const isPast = i < 0;
      
      // Simulasi check-in yang sudah lewat
      const isCheckedIn = isPast && Math.random() > 0.3; 
      
      days.push({
        date: date.toISOString().split('T')[0],
        isCheckedIn: isCheckedIn || (isToday && todayCheckedIn),
        isToday,
        isPast,
        isFuture: i > 0,
        dayNumber: date.getDate()
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
      
      setTodayCheckedIn(true);
      setCurrentStreak(prev => prev + 1);
      
      toast.success(message || "Daily check-in successful! +10 XP", { id: toastId });
      
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

  return (
    // Wrapper untuk kontrol responsif, disembunyikan di layar kecil
    <div className=" bg-gray-900/30 rounded-lg p-4"> 
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-green-400" />
            Daily Operations Log
          </h3>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full">
              <span className="text-green-400 font-mono text-sm">
                {currentStreak} day streak
              </span>
            </div>
          </div>
        </div>

        {/* Grid Kalender */}
        <div className="grid grid-cols-7 gap-2">
          {checkinDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-[10px] font-mono text-gray-400 mb-1">
                {getDayName(day.date)}
              </div>
              <div 
                className={`relative w-full aspect-square rounded-lg border flex items-center justify-center transition-all duration-300 ${
                  day.isToday 
                    ? 'border-cyan-400 bg-cyan-400/10' 
                    : day.isCheckedIn 
                      ? 'border-green-500 bg-green-500/10' 
                      : day.isPast 
                        ? 'border-gray-700 bg-gray-800/50' 
                        : 'border-gray-800 bg-gray-900/30'
                }`}
                title={day.date}
              >
                <span className={`font-orbitron ${
                  day.isToday ? 'text-cyan-400 text-base' : 
                  day.isCheckedIn ? 'text-green-400 text-sm' : 
                  'text-gray-500 text-sm'
                }`}>
                  {day.dayNumber}
                </span>
                
                {day.isCheckedIn && (
                  <div className="absolute -top-1 -right-1">
                    <CheckCircle size={14} className="text-green-400 bg-gray-900 rounded-full" />
                  </div>
                )}
                
                {day.isToday && !day.isCheckedIn && (
                  <div className="absolute -top-1 -right-1">
                    <Clock size={14} className="text-cyan-400 bg-gray-900 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Check-in */}
        <div className="flex items-stretch gap-3">
          <button
            onClick={handleCheckin}
            disabled={isCheckingIn || todayCheckedIn}
            className={`flex-grow px-4 py-2 rounded-lg font-orbitron text-sm relative group overflow-hidden transition-all duration-300 ${
              todayCheckedIn
                ? 'bg-green-900/30 border border-green-500/30 text-green-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white hover:from-purple-500/30 hover:to-cyan-500/30 disabled:opacity-50'
            }`}
          >
            {!todayCheckedIn && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            )}
            <div className="relative flex items-center justify-center gap-2">
              {isCheckingIn ? (
                <><Loader2 size={16} className="animate-spin" /><span>Processing...</span></>
              ) : todayCheckedIn ? (
                <><CheckCircle size={16} /><span>Mission Complete</span></>
              ) : (
                <><Zap size={16} className="text-cyan-400" /><span>Complete Mission</span></>
              )}
            </div>
          </button>

          {/* Info Hadiah */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <Gift size={16} className="text-purple-400" />
            <span className="text-sm font-mono text-gray-300">+10 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckin;

