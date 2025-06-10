// ===========================================================================
// File: src/pages/MissionTerminal.tsx (MODIFIKASI UTAMA)
// Deskripsi: Menangani pesan dari redirect callback Twitter dan menampilkannya sebagai toast.
// ===========================================================================
import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Target, Award, Sparkles, CheckCircle, ExternalLink, Hourglass, XCircle, Loader2, AlertTriangle, Twitter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
    getMissionDirectives, 
    getMyBadges, 
    getMyMissionProgressSummary, 
    completeMissionDirective 
} from '../services/apiService';
import { 
    MissionDirective, 
    UserBadge, 
    MissionProgressSummary,
    MissionStatus as MissionStatusType,
} from '../types/user';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation dan useNavigate

const QUANTUM_FLUX_STABILITY = 87.0; 

const MissionTerminal: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, fetchUserProfile, initiateTwitterConnect } = useAuth();
  const location = useLocation(); // Hook untuk mendapatkan info lokasi/URL saat ini
  const navigate = useNavigate(); // Hook untuk navigasi programatik (mengubah URL)

  const [directives, setDirectives] = useState<MissionDirective[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [missionSummary, setMissionSummary] = useState<MissionProgressSummary>({
    completedMissions: 0,
    totalMissions: 0,
    activeSignals: 0,
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);

  const completedQuests = missionSummary.completedMissions;
  const totalQuests = missionSummary.totalMissions;
  const progress = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  const fetchData = async () => {
    if (!isAuthenticated) return;

    setIsLoadingData(true);
    setErrorData(null);
    try {
      const [directivesData, badgesData, summaryData] = await Promise.all([
        getMissionDirectives(),
        getMyBadges(),
        getMyMissionProgressSummary()
      ]);
      setDirectives(directivesData || []);
      setUserBadges(badgesData || []);
      setMissionSummary(summaryData || { completedMissions: 0, totalMissions: 0, activeSignals: 0 });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Gagal memuat data terminal misi.";
      setErrorData(errorMessage);
      // Tidak menampilkan toast error di sini lagi, karena mungkin sudah ditangani oleh toast dari callback
      console.error("Error fetching mission terminal data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const twitterConnectedStatus = urlParams.get('x_connected');
    const twitterMessage = urlParams.get('message');
    const twitterError = urlParams.get('error');

    let redirectedFromTwitter = false;

    if (twitterConnectedStatus) {
      redirectedFromTwitter = true;
      const toastId = "twitter-callback-toast";
      if (twitterConnectedStatus === 'true' && twitterMessage) {
        toast.success(decodeURIComponent(twitterMessage), { id: toastId });
      } else if (twitterError) {
        toast.error(decodeURIComponent(twitterError), { id: toastId, duration: 5000 }); // Tampilkan lebih lama
      } else if (twitterConnectedStatus === 'false' && twitterMessage) {
        toast.error(decodeURIComponent(twitterMessage), { id: toastId, duration: 5000 });
      }
      
      // Hapus parameter dari URL setelah dibaca
      urlParams.delete('x_connected');
      urlParams.delete('message');
      urlParams.delete('error');
      navigate(`${location.pathname}?${urlParams.toString()}`, { replace: true });
    }
    
    if (isAuthenticated && !authLoading) {
      if(redirectedFromTwitter){
        console.log("Redirected from Twitter, fetching user profile and mission data...");
        if(fetchUserProfile) fetchUserProfile(); 
      }
      fetchData();
    } else if (!isAuthenticated && !authLoading) {
      setDirectives([]);
      setUserBadges([]);
      setMissionSummary({ completedMissions: 0, totalMissions: 0, activeSignals: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, location.search, navigate]); // Tambahkan location.search dan navigate ke dependency array

  const handleMissionAction = async (mission: MissionDirective) => {
    if (mission.action.type === "external_link" && mission.action.url) {
      window.open(mission.action.url, '_blank');
      toast.info(`Membuka link untuk misi: ${mission.title}. Pastikan Anda kembali untuk verifikasi jika diperlukan.`);
    } else if (mission.action.type === "oauth_connect") {
        if (mission.missionId_str === "connect-x-account") {
            if (user?.twitter_data) {
                toast.success("Akun X sudah terhubung!", {id: `mission-${mission.id}`});
                // Mungkin refresh data untuk memastikan status misi 'completed'
                await fetchData();
                if(fetchUserProfile) await fetchUserProfile();
                return;
            }
            await initiateTwitterConnect();
        } else {
            toast.error("Aksi OAuth tidak dikenal untuk misi ini.");
        }
    } else if (mission.action.type === "api_call") {
      setCompletingMissionId(mission.id);
      const toastId = `mission-${mission.id}`;
      try {
        toast.loading(`Memproses misi: ${mission.title}...`, { id: toastId });
        const result = await completeMissionDirective(mission.missionId_str); 
        toast.success(result.message || `Misi '${mission.title}' berhasil diproses!`, { id: toastId });
        
        await fetchData(); 
        if(fetchUserProfile) await fetchUserProfile();
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || `Gagal menyelesaikan misi: ${mission.title}`;
        toast.error(errorMsg, { id: toastId });
        console.error(`Error completing mission ${mission.missionId_str} via API:`, error);
      } finally {
        setCompletingMissionId(null);
        // Tidak dismiss toast di sini agar pesan sukses/error bisa dibaca user
      }
    } else if (mission.action.type === "completed") {
        toast.success(`Misi '${mission.title}' sudah selesai!`);
    } else if (mission.action.type === "disabled") {
        toast.error(`Aksi untuk misi '${mission.title}' belum tersedia atau prasyarat belum terpenuhi.`);
    }
  };

  const getStatusIcon = (status: MissionStatusType) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'in_progress':
      case 'pending_verification':
        return <Hourglass size={16} className="text-yellow-400 animate-pulse" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'available':
      default:
        return <Zap size={16} className="text-cyan-400" />;
    }
  };
  
  if (authLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 size={48} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="p-6 sm:p-10 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <Zap size={48} className="text-purple-400 mb-4 opacity-50" />
        <h1 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400 mb-4">
          Mission Terminal Offline
        </h1>
        <p className="text-gray-400 font-mono">Please connect your wallet to access mission directives.</p>
      </div>
    );
  }
  
  if (errorData && !isLoadingData && directives.length === 0 && userBadges.length === 0) {
    return (
      <div className="p-6 sm:p-10 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-orbitron font-bold text-red-400 mb-4">
          Terminal Connection Error
        </h1>
        <p className="text-gray-400 font-mono mb-6">{errorData}</p>
        <button 
            onClick={fetchData} 
            className="px-6 py-2 bg-purple-500/80 hover:bg-purple-600/90 text-white font-orbitron rounded-lg transition-colors"
        >
            Retry Connection
        </button>
      </div>
    );
  }

  const isTwitterConnected = !!user?.twitter_data?.twitter_username;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Mission Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-3 sm:p-5 h-full flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
                  <Target size={18} className="text-purple-400" />
                  Operation Status
                </h2>
                <div className="text-xs font-mono text-gray-400">
                  CODENAME: VAPOR WALKER
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-cyan-400">
                    {isLoadingData && completedQuests === 0 ? <Loader2 size={12} className="inline animate-spin"/> : completedQuests} / {isLoadingData && totalQuests === 0 ? '...' : totalQuests} Directives Executed
                  </span>
                  <span className="text-gray-400">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="w-full h-full opacity-50 animate-pulse"></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-mono italic">
                  Synchronize with Terran frequencies to unlock Plasma-tier clearance
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/30 rounded-lg p-3 border border-purple-900/30">
                  <div className="text-xs font-mono text-gray-400 mb-1">ACTIVE SIGNALS</div>
                  <div className="text-xl font-orbitron font-bold text-cyan-400">
                    {isLoadingData && missionSummary.activeSignals === 0 ? <Loader2 size={16} className="inline animate-spin"/> : missionSummary.activeSignals}
                  </div>
                  <div className="mt-1 text-xs font-mono text-gray-500">DETECTED</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 border border-purple-900/30">
                  <div className="text-xs font-mono text-gray-400 mb-1">QUANTUM FLUX</div>
                  <div className="text-xl font-orbitron font-bold text-purple-400">{QUANTUM_FLUX_STABILITY}%</div>
                  <div className="mt-1 text-xs font-mono text-gray-500">STABILITY</div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
                 <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg font-orbitron text-sm text-white relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-center gap-2">
                        <Sparkles size={16} className="text-cyan-400" />
                        <span>Continue Operation</span>
                    </div>
                </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-3 sm:p-5 h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
            
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
                <Trophy size={18} className="text-cyan-400" />
                Neural Imprints
              </h2>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 hide-scrollbar pr-1 min-h-0">
              {isLoadingData && userBadges.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 size={24} className="text-cyan-400 animate-spin"/>
                </div>
              ) : userBadges.length > 0 ? (
                userBadges.map(badge => (
                  <div key={badge.id} title={`${badge.name}: ${badge.description || ''}`} className="bg-gray-800/50 rounded-lg p-3 border border-purple-900/30 flex items-center gap-3 hover:bg-gray-700/60 transition-colors">
                    <img src={badge.imageUrl} alt={badge.name} className="w-8 h-8 object-contain rounded-sm bg-gray-700/50 p-1" onError={(e)=>(e.currentTarget.src = 'https://placehold.co/32x32/555/ccc?text=X')}/>
                    <span className="font-mono text-gray-300 text-sm">{badge.name}</span>
                  </div>
                ))
              ) : (
                <div className="flex-grow flex justify-center items-center text-center text-gray-500 font-mono">
                    No imprints acquired.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quest Feed */}
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-3 sm:p-5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-green-400" />
              Active Directives
            </h2>
          </div>

          {isLoadingData && directives.length === 0 ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-cyan-400" size={32}/></div>
          ) : directives.length > 0 ? (
            <div className="grid gap-4">
              {directives.map(mission => (
                <div 
                  key={mission.id}
                  className={`bg-gray-800/30 rounded-lg p-4 border border-purple-900/30 relative group hover:bg-gray-800/50 transition-all duration-300 ${mission.status === 'completed' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-orbitron text-white">{mission.title}</h3>
                        {mission.status === 'completed' && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-[10px] font-mono text-green-400 rounded-full">
                            COMPLETED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 font-mono">{mission.description}</p>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-cyan-400">+{mission.rewardXp} XP</span>
                        {mission.rewardBadge && (
                          <span className="text-purple-400 flex items-center gap-1">
                            <Award size={12} />
                            {mission.rewardBadge.name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleMissionAction(mission)}
                      disabled={
                        (mission.missionId_str === "connect-x-account" && isTwitterConnected && mission.status !== 'completed') ||
                        mission.action.type === 'disabled' || 
                        mission.status === 'completed' || 
                        completingMissionId === mission.id
                      }
                      className={`px-4 py-2 rounded-lg font-orbitron text-sm relative group overflow-hidden whitespace-nowrap
                        ${mission.status === 'completed' || (mission.missionId_str === "connect-x-account" && isTwitterConnected && mission.status !== 'completed')
                          ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white hover:from-purple-500/30 hover:to-cyan-500/30 disabled:opacity-50'}`}
                    >
                      {mission.status !== 'completed' && mission.action.type !== 'disabled' && !(mission.missionId_str === "connect-x-account" && isTwitterConnected) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      )}
                      <span className="relative flex items-center justify-center gap-1.5">
                        {completingMissionId === mission.id ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : mission.missionId_str === "connect-x-account" ? (
                            isTwitterConnected ? <CheckCircle size={14} className="text-green-400"/> : <Twitter size={14} />
                        ) : mission.action.type === "external_link" ? (
                            <ExternalLink size={14} />
                        ) : mission.status === 'completed' ? (
                            <CheckCircle size={14} />
                        ) : (
                            <Zap size={14} />
                        )}
                        <span>
                            {completingMissionId === mission.id 
                                ? "Processing..." 
                                : mission.missionId_str === "connect-x-account" 
                                    ? (isTwitterConnected ? "X Connected" : mission.action.label)
                                    : mission.status === 'completed' 
                                        ? 'Completed' 
                                        : mission.action.label}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-8 text-gray-500 font-mono">
                No active directives at this moment, Commander.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionTerminal;