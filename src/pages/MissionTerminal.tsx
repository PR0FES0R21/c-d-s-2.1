// ===========================================================================
// File: src/pages/MissionTerminal.tsx (ENHANCED - Complete Action Integration with Cooldown)
// Deskripsi: Menangani semua jenis action.type dari mission data dengan logika cooldown untuk like/retweet
// ===========================================================================
import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Target, Award, Sparkles, CheckCircle, ExternalLink, Hourglass, XCircle, Loader2, AlertTriangle, Twitter, Filter, Users, Eye, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMissionCooldown } from '../hooks/useMissionCooldown';
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
    MissionType,
} from '../types/user';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const QUANTUM_FLUX_STABILITY = 87.0; 

// Type untuk filter options
type FilterType = 'all' | MissionType;

// State untuk tracking redirect_and_verify missions
interface RedirectVerifyState {
  [missionId: string]: 'initial' | 'redirected' | 'verifying';
}

const MissionTerminal: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, fetchUserProfile, initiateTwitterConnect } = useAuth();
  const { 
    cooldownData, 
    startCooldown, 
    isMissionOnCooldown, 
    getMissionCooldownInfo, 
    getMissionType 
  } = useMissionCooldown();
  const location = useLocation();
  const navigate = useNavigate();

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
  
  // State untuk filter
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // State untuk tracking redirect_and_verify missions
  const [redirectVerifyStates, setRedirectVerifyStates] = useState<RedirectVerifyState>({});

  const completedQuests = missionSummary.completedMissions;
  const totalQuests = missionSummary.totalMissions;
  const progress = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  // Filter directives berdasarkan type yang dipilih
  const filteredDirectives = directives.filter(directive => {
    if (activeFilter === 'all') return true;
    return directive.type === activeFilter;
  });

  // Hitung jumlah directive per type untuk badge di filter buttons
  const getDirectiveCountByType = (type: FilterType) => {
    if (type === 'all') return directives.length;
    return directives.filter(d => d.type === type).length;
  };

  // Filter button configuration
  const filterButtons = [
    { type: 'all' as FilterType, label: 'All', icon: Filter },
    { type: 'connect' as FilterType, label: 'Connect', icon: Twitter },
    { type: 'interact' as FilterType, label: 'Interact', icon: Zap },
    { type: 'contribute' as FilterType, label: 'Contribute', icon: Trophy },
  ];

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
      const errorMessage = error.response?.data?.detail || error.message || "Failed to load mission terminal data";
      setErrorData(errorMessage);
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
        toast.error(decodeURIComponent(twitterError), { id: toastId, duration: 5000 });
      } else if (twitterConnectedStatus === 'false' && twitterMessage) {
        toast.error(decodeURIComponent(twitterMessage), { id: toastId, duration: 5000 });
      }
      
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
  }, [isAuthenticated, authLoading, location.search, navigate]);

  // Helper function untuk mendapatkan status button dan label
  const getMissionButtonState = (mission: MissionDirective) => {
    const { action, status, missionId_str, currentProgress, requiredProgress } = mission;
    const userAlliesCount = user?.alliesCount || 0;
    const isTwitterConnected = !!user?.twitter_data?.twitter_username;
    const redirectState = redirectVerifyStates[mission._id] || 'initial';
    
    // Check cooldown untuk like/retweet missions
    const missionType = getMissionType(missionId_str);
    const cooldownInfo = getMissionCooldownInfo(missionId_str);
    const isOnCooldown = isMissionOnCooldown(missionId_str);

    switch (action.type) {
      case 'oauth_connect':
        if (missionId_str === "connect-x-account") {
          if (status === 'completed') {
            return {
              label: 'Connected',
              icon: CheckCircle,
              disabled: true,
              variant: 'completed'
            };
          }
          if (isTwitterConnected && status !== 'completed') {
            return {
              label: 'Verify Connection',
              icon: RefreshCw,
              disabled: false,
              variant: 'verify'
            };
          }
          return {
            label: action.label,
            icon: Twitter,
            disabled: false,
            variant: 'action'
          };
        }
        break;

      case 'claim_if_eligible':
        const currentProg = currentProgress || 0;
        const requiredProg = requiredProgress || 1;
        const isEligible = currentProg >= requiredProg;
        
        if (status === 'completed') {
          return {
            label: 'Claimed',
            icon: CheckCircle,
            disabled: true,
            variant: 'completed',
            progress: { current: currentProg, required: requiredProg }
          };
        }
        
        return {
          label: isEligible ? action.label : `Need ${requiredProg - currentProg} more`,
          icon: isEligible ? Award : Users,
          disabled: !isEligible,
          variant: isEligible ? 'action' : 'disabled',
          progress: { current: currentProg, required: requiredProg }
        };

      case 'redirect_and_verify':
        if (status === 'completed') {
          return {
            label: 'Completed',
            icon: CheckCircle,
            disabled: true,
            variant: 'completed'
          };
        }
        
        // Check cooldown untuk like/retweet missions
        if (isOnCooldown && cooldownInfo) {
          return {
            label: `Wait ${cooldownInfo.formattedTime}`,
            icon: Clock,
            disabled: true,
            variant: 'cooldown',
            cooldownInfo
          };
        }
        
        if (redirectState === 'initial') {
          return {
            label: action.label,
            icon: ExternalLink,
            disabled: false,
            variant: 'action'
          };
        } else if (redirectState === 'redirected') {
          return {
            label: 'Verify Completion',
            icon: Eye,
            disabled: false,
            variant: 'verify'
          };
        } else if (redirectState === 'verifying') {
          return {
            label: 'Verifying...',
            icon: Loader2,
            disabled: true,
            variant: 'loading'
          };
        }
        break;

      default:
        if (status === 'completed') {
          return {
            label: 'Completed',
            icon: CheckCircle,
            disabled: true,
            variant: 'completed'
          };
        }
        
        // Check cooldown untuk missions lainnya juga
        if (isOnCooldown && cooldownInfo) {
          return {
            label: `Wait ${cooldownInfo.formattedTime}`,
            icon: Clock,
            disabled: true,
            variant: 'cooldown',
            cooldownInfo
          };
        }
        
        return {
          label: action.label,
          icon: Zap,
          disabled: action.type === 'disabled',
          variant: action.type === 'disabled' ? 'disabled' : 'action'
        };
    }

    return {
      label: action.label,
      icon: Zap,
      disabled: true,
      variant: 'disabled'
    };
  };

  const handleMissionAction = async (mission: MissionDirective) => {
    const { action, missionId_str } = mission;
    const redirectState = redirectVerifyStates[mission._id] || 'initial';
    const missionType = getMissionType(missionId_str);

    if (action.type === "oauth_connect") {
      if (missionId_str === "connect-x-account") {
        const isTwitterConnected = !!user?.twitter_data?.twitter_username;
        
        if (isTwitterConnected && mission.status !== 'completed') {
          // User has connected Twitter but mission not marked as completed - verify
          setCompletingMissionId(mission._id);
          const toastId = `mission-${mission._id}`;
          try {
            toast.loading(`Verifying X connection...`, { id: toastId });
            const result = await completeMissionDirective(missionId_str);
            toast.success(result.message || `X connection verified successfully!`, { id: toastId });
            
            await fetchData();
            if(fetchUserProfile) await fetchUserProfile();
          } catch (error: any) {
            const errorMsg = error.response?.data?.detail || `Failed to verify X connection`;
            toast.error(errorMsg, { id: toastId });
            console.error(`Error verifying X connection:`, error);
          } finally {
            setCompletingMissionId(null);
          }
        } else if (!isTwitterConnected) {
          // Initiate Twitter OAuth
          await initiateTwitterConnect();
        } else {
          toast.success("X account already connected!", {id: `mission-${mission._id}`});
        }
      }
    } 
    else if (action.type === "claim_if_eligible") {
      const currentProg = mission.currentProgress || 0;
      const requiredProg = mission.requiredProgress || 1;
      const isEligible = currentProg >= requiredProg;
      
      if (!isEligible) {
        toast.error(`You need ${requiredProg - currentProg} more allies to claim this reward.`);
        return;
      }
      
      setCompletingMissionId(mission._id);
      const toastId = `mission-${mission._id}`;
      try {
        toast.loading(`Claiming reward: ${mission.title}...`, { id: toastId });
        const result = await completeMissionDirective(missionId_str);
        toast.success(result.message || `Reward claimed successfully!`, { id: toastId });
        
        await fetchData();
        if(fetchUserProfile) await fetchUserProfile();
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || `Failed to claim reward`;
        toast.error(errorMsg, { id: toastId });
        console.error(`Error claiming reward:`, error);
      } finally {
        setCompletingMissionId(null);
      }
    }
    else if (action.type === "redirect_and_verify") {
      if (redirectState === 'initial' && action.url) {
        // First click - redirect to URL
        window.open(action.url, '_blank');
        setRedirectVerifyStates(prev => ({
          ...prev,
          [mission._id]: 'redirected'
        }));
        toast.info(`Opened ${mission.title}. Return here to verify completion.`);
      } 
      else if (redirectState === 'redirected') {
        // Second click - verify completion
        setRedirectVerifyStates(prev => ({
          ...prev,
          [mission._id]: 'verifying'
        }));
        
        const toastId = `mission-${mission._id}`;
        try {
          toast.loading(`Verifying completion: ${mission.title}...`, { id: toastId });
          const result = await completeMissionDirective(missionId_str);
          toast.success(result.message || `Mission completed successfully!`, { id: toastId });
          
          // Start cooldown untuk like/retweet missions
          if (missionType) {
            startCooldown(missionType);
            console.log(`Started ${missionType} cooldown for mission: ${missionId_str}`);
          }
          
          // Reset state on success
          setRedirectVerifyStates(prev => ({
            ...prev,
            [mission._id]: 'initial'
          }));
          
          await fetchData();
          if(fetchUserProfile) await fetchUserProfile();
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || `Failed to verify completion`;
          toast.error(errorMsg, { id: toastId });
          console.error(`Error verifying completion:`, error);
          
          // Reset to redirected state on error
          setRedirectVerifyStates(prev => ({
            ...prev,
            [mission._id]: 'redirected'
          }));
        }
      }
    }
    else if (action.type === "api_call") {
      setCompletingMissionId(mission._id);
      const toastId = `mission-${mission._id}`;
      try {
        toast.loading(`Processing mission: ${mission.title}...`, { id: toastId });
        const result = await completeMissionDirective(missionId_str);
        toast.success(result.message || `Mission '${mission.title}' completed successfully!`, { id: toastId });
        
        // Start cooldown untuk like/retweet missions
        if (missionType) {
          startCooldown(missionType);
          console.log(`Started ${missionType} cooldown for mission: ${missionId_str}`);
        }
        
        await fetchData();
        if(fetchUserProfile) await fetchUserProfile();
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || `Failed to complete mission: ${mission.title}`;
        toast.error(errorMsg, { id: toastId });
        console.error(`Error completing mission ${missionId_str} via API:`, error);
      } finally {
        setCompletingMissionId(null);
      }
    }
    else if (action.type === "completed") {
      toast.success(`Mission '${mission.title}' is already completed!`);
    } 
    else if (action.type === "disabled") {
      toast.error(`Action for mission '${mission.title}' is not available or prerequisites not met.`);
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

  const getButtonStyles = (variant: string) => {
    switch (variant) {
      case 'completed':
        return 'bg-gray-700/30 text-gray-500 cursor-not-allowed';
      case 'disabled':
        return 'bg-gray-700/30 text-gray-500 cursor-not-allowed opacity-50';
      case 'verify':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-white hover:from-yellow-500/30 hover:to-orange-500/30';
      case 'loading':
        return 'bg-gray-700/50 text-gray-400 cursor-wait';
      case 'cooldown':
        return 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 cursor-not-allowed';
      case 'action':
      default:
        return 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white hover:from-purple-500/30 hover:to-cyan-500/30';
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

              {/* Cooldown Status Display */}
              {(cooldownData.like.isOnCooldown || cooldownData.retweet.isOnCooldown) && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <div className="text-xs font-mono text-red-400 mb-2">MISSION COOLDOWNS</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {cooldownData.like.isOnCooldown && (
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-red-400" />
                        <span className="text-red-300">Like: {cooldownData.like.formattedTime}</span>
                      </div>
                    )}
                    {cooldownData.retweet.isOnCooldown && (
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-red-400" />
                        <span className="text-red-300">Retweet: {cooldownData.retweet.formattedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

      {/* Active Directives with Filter */}
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-3 sm:p-5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-green-400" />
              Active Directives
            </h2>
            
            {/* Filter Buttons - Responsive */}
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((filter) => {
                const IconComponent = filter.icon;
                const count = getDirectiveCountByType(filter.type);
                const isActive = activeFilter === filter.type;
                
                return (
                  <button
                    key={filter.type}
                    onClick={() => setActiveFilter(filter.type)}
                    className={`relative px-3 py-2 rounded-lg font-orbitron text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-500/50 text-white'
                        : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                    }`}
                  >
                    <IconComponent size={14} className={isActive ? 'text-cyan-400' : 'text-gray-500'} />
                    <span className="hidden sm:inline">{filter.label}</span>
                    <span className="sm:hidden">{filter.label.slice(0, 3)}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-mono ${
                        isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-gray-600/50 text-gray-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directives List */}
          {isLoadingData && directives.length === 0 ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-cyan-400" size={32}/></div>
          ) : filteredDirectives.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredDirectives.map(mission => {
                const buttonState = getMissionButtonState(mission);
                const IconComponent = buttonState.icon;
                const isProcessing = completingMissionId === mission._id;

                return (
                  <div 
                    key={mission._id}
                    className={`bg-gray-800/30 rounded-lg p-3 sm:p-4 border border-purple-900/30 relative group hover:bg-gray-800/50 transition-all duration-300 ${mission.status === 'completed' ? 'opacity-60' : ''}`}
                  >
                    {/* Mobile Layout */}
                    <div className="block sm:hidden space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-orbitron text-white text-sm truncate">{mission.title}</h3>
                            {mission.status === 'completed' && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-[10px] font-mono text-green-400 rounded-full flex-shrink-0">
                                COMPLETED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                              mission.type === 'connect' ? 'bg-blue-500/20 text-blue-400' :
                              mission.type === 'interact' ? 'bg-yellow-500/20 text-yellow-400' :
                              mission.type === 'contribute' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {mission.type.toUpperCase()}
                            </span>
                            {getStatusIcon(mission.status)}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 font-mono leading-relaxed">{mission.description}</p>
                      
                      {/* Progress indicator for claim_if_eligible */}
                      {mission.action.type === 'claim_if_eligible' && buttonState.progress && (
                        <div className="bg-gray-700/30 rounded-md p-2">
                          <div className="flex items-center justify-between text-xs font-mono mb-1">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-cyan-400">
                              {buttonState.progress.current} / {buttonState.progress.required} Allies
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                              style={{ width: `${Math.min((buttonState.progress.current / buttonState.progress.required) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-cyan-400">+{mission.rewardXp} XP</span>
                          {mission.rewardBadge && (
                            <span className="text-purple-400 flex items-center gap-1">
                              <Award size={10} />
                              <span className="truncate max-w-[80px]">{mission.rewardBadge.name}</span>
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleMissionAction(mission)}
                          disabled={buttonState.disabled || isProcessing}
                          className={`px-3 py-1.5 rounded-md font-orbitron text-xs relative group overflow-hidden flex-shrink-0 transition-all duration-300 ${getButtonStyles(buttonState.variant)}`}
                        >
                          {buttonState.variant === 'action' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          )}
                          <span className="relative flex items-center justify-center gap-1">
                            {isProcessing ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <IconComponent size={12} className={buttonState.variant === 'loading' ? 'animate-spin' : ''} />
                            )}
                            <span className="text-xs">
                              {isProcessing ? "..." : buttonState.label}
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-orbitron text-white">{mission.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                            mission.type === 'connect' ? 'bg-blue-500/20 text-blue-400' :
                            mission.type === 'interact' ? 'bg-yellow-500/20 text-yellow-400' :
                            mission.type === 'contribute' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {mission.type.toUpperCase()}
                          </span>
                          {mission.status === 'completed' && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-[10px] font-mono text-green-400 rounded-full">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 font-mono">{mission.description}</p>
                        
                        {/* Progress indicator for claim_if_eligible */}
                        {mission.action.type === 'claim_if_eligible' && buttonState.progress && (
                          <div className="bg-gray-700/30 rounded-md p-2 max-w-xs">
                            <div className="flex items-center justify-between text-xs font-mono mb-1">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-cyan-400">
                                {buttonState.progress.current} / {buttonState.progress.required} Allies
                              </span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                                style={{ width: `${Math.min((buttonState.progress.current / buttonState.progress.required) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
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
                        disabled={buttonState.disabled || isProcessing}
                        className={`px-4 py-2 rounded-lg font-orbitron text-sm relative group overflow-hidden whitespace-nowrap transition-all duration-300 ${getButtonStyles(buttonState.variant)}`}
                      >
                        {buttonState.variant === 'action' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        )}
                        <span className="relative flex items-center justify-center gap-1.5">
                          {isProcessing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <IconComponent size={14} className={buttonState.variant === 'loading' ? 'animate-spin' : ''} />
                          )}
                          <span>
                            {isProcessing ? "Processing..." : buttonState.label}
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-8 text-gray-500 font-mono">
                {activeFilter === 'all' 
                  ? "No active directives at this moment, Commander."
                  : `No ${activeFilter} directives available.`
                }
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionTerminal;