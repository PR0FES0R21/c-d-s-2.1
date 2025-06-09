import React, { useState, useEffect } from 'react';
import { FlaskRound as Flask, Rocket, Gift, Megaphone, LineChart, Globe, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMissionDirectives } from '../services/apiService';
import { MissionDirective, MissionType } from '../types/user';

const MissionProgress: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [directives, setDirectives] = useState<MissionDirective[]>([]);
  const [isLoadingDirectives, setIsLoadingDirectives] = useState<boolean>(false);
  const [errorDirectives, setErrorDirectives] = useState<string | null>(null);

  const fetchDirectives = async () => {
    if (!isAuthenticated) return;

    setIsLoadingDirectives(true);
    setErrorDirectives(null);
    try {
      const data = await getMissionDirectives();
      setDirectives(data || []);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Gagal memuat data misi.";
      setErrorDirectives(errorMessage);
      console.error("Error fetching mission directives:", error);
    } finally {
      setIsLoadingDirectives(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDirectives();
    } else if (!isAuthenticated && !authLoading) {
      setDirectives([]);
    }
  }, [isAuthenticated, authLoading]);

  // Calculate mission statistics by type
  const calculateMissionStats = () => {
    const stats = {
      social: { completed: 0, total: 0 },
      engagement: { completed: 0, total: 0 },
      community: { completed: 0, total: 0 }
    };

    directives.forEach(directive => {
      const type = directive.type;
      if (type in stats) {
        stats[type].total++;
        if (directive.status === 'completed') {
          stats[type].completed++;
        }
      }
    });

    return stats;
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const totalMissions = directives.length;
    const completedMissions = directives.filter(d => d.status === 'completed').length;
    const progress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
    
    return {
      completed: completedMissions,
      total: totalMissions,
      progress
    };
  };

  const missionStats = calculateMissionStats();
  const overallProgress = calculateOverallProgress();
  const isCompleted = overallProgress.completed === overallProgress.total && overallProgress.total > 0;

  // Mission stats data with dynamic values
  const missionStatsDisplay = [
    {
      icon: <Megaphone size={16} className="text-purple-400" />,
      label: "Social",
      value: `${missionStats.social.completed}/${missionStats.social.total}`,
      trend: missionStats.social.completed > 0 ? `+${missionStats.social.completed} completed` : "No progress yet"
    },
    {
      icon: <LineChart size={16} className="text-cyan-400" />,
      label: "Engagement",
      value: `${missionStats.engagement.completed}/${missionStats.engagement.total}`,
      trend: missionStats.engagement.completed > 0 ? `+${missionStats.engagement.completed} completed` : "No progress yet"
    },
    {
      icon: <Globe size={16} className="text-green-400" />,
      label: "Community",
      value: `${missionStats.community.completed}/${missionStats.community.total}`,
      trend: missionStats.community.completed > 0 ? `+${missionStats.community.completed} completed` : "No progress yet"
    }
  ];

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-5 h-full flex items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
        <div className="text-center text-gray-500 font-mono">
          <Flask size={40} className="mx-auto mb-3 opacity-50" />
          Connect wallet to view progress.
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-5 h-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
      
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
          <Flask size={18} className="text-purple-400" />
          Quantum Progress
        </h2>
        <div className="text-xs font-mono text-gray-400">
          MISSION COMPLETION MATRIX
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative pt-4">
          <div className="flex justify-between mb-2 text-sm font-mono">
            <span className="text-cyan-400">
              {isLoadingDirectives && overallProgress.completed === 0 ? (
                <><Loader2 size={12} className="inline animate-spin mr-1" />Loading...</>
              ) : (
                `${overallProgress.completed} / ${overallProgress.total} Tasks Completed`
              )}
            </span>
            <span className="text-gray-400">
              {isLoadingDirectives ? '...' : `${overallProgress.progress.toFixed(0)}%`}
            </span>
          </div>
          <div className="relative h-4 bg-gray-800/50 progress-bar-shape overflow-hidden">
            <div 
              className="h-full bg-[#00f0ff]/20 progress-bar-shape progress-bar-glow transition-all duration-1000 ease-out flex items-center"
              style={{ width: `${overallProgress.progress}%` }}
            >
              <div className="w-full h-full progress-bar-grid"></div>
              <span className="absolute right-2 text-[#00f0ff] font-orbitron text-sm font-bold">
                {overallProgress.progress.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-mono italic">
            Engage with Terran channels to unlock your fate
          </div>
        </div>

        {/* Mission Stats Section */}
        <div className="grid grid-cols-3 gap-3 py-4">
          {isLoadingDirectives && directives.length === 0 ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div 
                key={index}
                className="bg-gray-800/30 rounded-lg p-3 border border-purple-900/30 animate-pulse"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <div className="w-12 h-3 bg-gray-600 rounded"></div>
                </div>
                <div className="w-8 h-5 bg-gray-600 rounded mb-1"></div>
                <div className="w-16 h-3 bg-gray-600 rounded"></div>
              </div>
            ))
          ) : errorDirectives ? (
            // Error state
            <div className="col-span-3 text-center py-4">
              <AlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
              <p className="text-red-400 text-sm font-mono">{errorDirectives}</p>
              <button 
                onClick={fetchDirectives}
                className="mt-2 text-xs px-3 py-1 bg-purple-500/20 rounded-md hover:bg-purple-500/30 text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            // Normal state with data
            missionStatsDisplay.map((stat, index) => (
              <div 
                key={index}
                className="bg-gray-800/30 rounded-lg p-3 border border-purple-900/30 hover:bg-gray-800/50 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  {stat.icon}
                  <span className="text-xs font-mono text-gray-400">{stat.label}</span>
                </div>
                <div className="font-orbitron text-lg text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-mono text-cyan-400">
                  {stat.trend}
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg font-orbitron text-sm text-white relative group overflow-hidden"
          disabled={isLoadingDirectives}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center justify-center gap-2">
            {isLoadingDirectives ? (
              <>
                <Loader2 size={16} className="text-cyan-400 animate-spin" />
                <span>Loading...</span>
              </>
            ) : isCompleted ? (
              <>
                <Gift size={16} className="text-green-400" />
                <span>View Rewards</span>
              </>
            ) : (
              <>
                <Rocket size={16} className="text-cyan-400" />
                <span>Continue Mission</span>
              </>
            )}
          </div>
          <div className="absolute inset-0 border border-purple-500/50 rounded-lg opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-500"></div>
        </button>
      </div>

      <div className="absolute bottom-0 right-0 w-full h-40 pointer-events-none opacity-10">
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-500 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};

export default MissionProgress;