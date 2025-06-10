// ===========================================================================
// File: src/components/ProjectStatus.tsx (OPTIMIZED - Responsive Design)
// Deskripsi: Menampilkan profil komandan yang dioptimalkan untuk semua ukuran layar
// dengan ukuran yang lebih proporsional dan responsif.
// ===========================================================================

import React from 'react';
import { Shield, Star, Clock, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DailyCheckin from './DailyCheckin'; // <-- Komponen diimpor ke sini

const ProjectStatus: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Tampilkan placeholder jika pengguna belum login
  if (!isAuthenticated || !user) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
        <div className="text-center py-6 sm:py-8">
          <Shield size={32} className="mx-auto mb-3 text-gray-600 sm:w-12 sm:h-12" />
          <p className="text-gray-400 font-mono text-sm">Connect wallet to access your command profile.</p>
        </div>
      </div>
    );
  }

  // Ekstrak data pengguna untuk kemudahan
  const { profile, rank, xp, systemStatus, createdAt } = user;
  const rankProgress = profile.rankProgressPercent || 0;
  const nextRankName = profile.nextRank || "Max Rank";

  // Hitung jumlah hari sejak bergabung
  const daysSinceJoining = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm mb-4 sm:mb-6">
      {/* Garis gradien di header */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
      
      {/* Efek latar belakang */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-cyan-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          
          {/* Kolom Kiri - Info Profil & Daily Checkin */}
          <div className="flex-1 flex flex-col space-y-3 sm:space-y-4">
            {/* Bagian Profil Atas - Diperkecil */}
            <div>
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Bagian Avatar - Diperkecil */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 p-0.5 sm:p-1">
                    <div className="w-full h-full rounded-md bg-gray-900 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={profile.rankBadgeUrl || "/assets/chevron_rank_badge.png"} 
                        alt={`${rank} Badge`}
                        className="w-full h-full object-cover relative"
                        onError={(e) => (e.currentTarget.src = "/assets/chevron_rank_badge.png")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 animate-pulse-slow"></div>
                    </div>
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                      <Shield size={10} className="text-cyan-400 sm:w-3 sm:h-3" />
                    </div>
                  </div>
                </div>

                {/* Detail Profil - Diperkecil */}
                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                  <div className="flex items-center justify-between gap-x-4">
                    <div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400 mb-1 truncate">
                        {profile.commanderName || "Commander"}
                      </h2>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-purple-900/30 border border-purple-500/30 rounded-full font-mono text-purple-300 text-xs">
                          {rank}
                        </span>
                        <span className="text-gray-400 font-mono text-xs sm:text-sm">
                          {xp.toLocaleString()} XP
                        </span>
                        <span className="text-gray-500 font-mono flex items-center gap-1 text-xs">
                          <Clock size={10} className="sm:w-3 sm:h-3" />
                          {daysSinceJoining}d active
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-lg">
                      <div className="w-full h-full rounded-md bg-gray-900 flex items-center justify-center relative overflow-hidden">
                        <img 
                          src="/assets/chevron_rank_badge.png"
                          className="w-full h-full object-cover relative"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 animate-pulse-slow"></div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Rank - Diperkecil */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400 font-mono flex items-center gap-1 sm:gap-2">
                        <Star size={10} className="text-cyan-400 sm:w-3 sm:h-3" />
                        Rank Progress
                      </span>
                      <span className="text-cyan-400 font-mono text-xs">
                        {rankProgress < 100 ? `${rankProgress.toFixed(0)}% to ${nextRankName}` : `${rank} Maxed`}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="h-1.5 sm:h-2 bg-gray-800/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400 transition-all duration-1000 ease-out relative"
                          style={{ width: `${rankProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      {rankProgress > 0 && rankProgress < 100 && (
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-cyan-400 rounded-full border border-gray-900 transition-all duration-1000"
                          style={{ left: `${rankProgress}%`, marginLeft: '-4px' }}
                        >
                          <div className="w-full h-full bg-cyan-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Komponen Daily Check-in Disisipkan di Sini - Diperkecil */}
            <div className="mt-2 sm:mt-3">
                <DailyCheckin />
            </div>
          </div>

          {/* Kolom Kanan - System Status */}
          <div className="lg:w-72 xl:w-80 lg:border-l lg:border-purple-500/20 lg:pl-4 xl:pl-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron text-sm sm:text-base lg:text-lg text-white flex items-center gap-1 sm:gap-2">
                  <Zap size={12} className="text-green-400 sm:w-4 sm:h-4" />
                  System Status
                </h3>
                <div className="flex items-center gap-1 text-xs font-mono text-green-400">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
                  ONLINE
                </div>
              </div>

              {/* Grid Status - Diperkecil */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-gray-800/30 rounded-lg p-2 sm:p-3 border border-gray-700/30">
                  <div className="text-xs font-mono text-gray-400 mb-1">StarDate</div>
                  <div className="text-xs sm:text-sm font-orbitron text-purple-400 truncate">
                    {systemStatus?.starDate || "N/A"}
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2 sm:p-3 border border-gray-700/30">
                  <div className="text-xs font-mono text-gray-400 mb-1">Signal</div>
                  <div className="text-xs sm:text-sm font-orbitron text-green-400">
                    {systemStatus?.signalStatus || "Stable"}
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2 sm:p-3 border border-gray-700/30">
                  <div className="text-xs font-mono text-gray-400 mb-1">Network</div>
                  <div className="text-xs sm:text-sm font-orbitron text-cyan-400">
                    {systemStatus?.networkLoadPercent || 42}%
                  </div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2 sm:p-3 border border-gray-700/30">
                  <div className="text-xs font-mono text-gray-400 mb-1">Anomalies</div>
                  <div className="text-xs sm:text-sm font-orbitron text-yellow-400">
                    {systemStatus?.anomaliesResolved || 7}
                  </div>
                </div>
              </div>

              {/* Metrik Komandan - Diperkecil */}
              <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-lg p-3 sm:p-4 border border-purple-500/20">
                <div className="text-xs font-mono text-gray-400 mb-2">COMMANDER METRICS</div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                  <div>
                    <div className="text-sm sm:text-base lg:text-lg font-orbitron font-bold text-cyan-400">{user.alliesCount}</div>
                    <div className="text-xs font-mono text-gray-500">Allies</div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base lg:text-lg font-orbitron font-bold text-purple-400 truncate">{rank}</div>
                    <div className="text-xs font-mono text-gray-500">Rank</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatus;