import React from 'react';
import ProjectStatus from '../components/ProjectStatus';
import PortfolioCard from '../components/PortfolioCard';
import MissionLog from '../components/MissionLog';
import MissionProgress from '../components/MissionProgress';
import AllyTracker from '../components/AllyTracker';
import RankUpCinematic from '../components/RankUpCinematic';
import { useAuth } from '../contexts/AuthContext';
import { useRankUpDetection } from '../hooks/useRankUpDetection';

const Home: React.FC = () => {
  const { user } = useAuth();
  console.log(user)
  const { shouldShowRankUp, oldRank, newRank, oldRankImageUrl, newRankImageUrl, dismissRankUp } = useRankUpDetection(user);

  return (
    <>
      <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
        <ProjectStatus />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PortfolioCard />
          <MissionLog />
        </div>
        
        {/* Unified Mission Progress & Ally Tracker Section */}
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
          
          <div className="flex flex-col lg:flex-row">
            {/* Left Column - Mission Progress (50%) */}
            <div className="flex-1 lg:w-1/2 p-3 sm:p-5">
              <MissionProgress />
            </div>
            
            {/* Divider - Vertical on desktop, horizontal on mobile */}
            <div className="mt-4 lg:mt-0 lg:w-px lg:h-auto h-px bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
            
            {/* Right Column - Ally Tracker (50%) */}
            <div className="flex-1 lg:w-1/2 p-3 sm:p-5">
              <AllyTracker />
            </div>
          </div>
          
          {/* Shared background effects */}
          <div className="absolute bottom-0 right-0 w-full h-40 pointer-events-none opacity-10">
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-cyan-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-3 sm:p-5 lg:col-span-3">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
            
            <div className="text-center p-4 sm:p-6">
              <h3 className="font-orbitron text-lg mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400">
                The $CIGAR Restoration Project
              </h3>
              <p className="text-gray-400 font-mono text-sm max-w-2xl mx-auto">
                After the Krellnic Inversion, our civilization's future depends on rebuilding our ecosystem. 
                Each $CIGAR token represents a quantum fragment of our collective memory and provides access 
                to the reconstruction efforts. Stay tuned for upcoming governance proposals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rank-Up Cinematic */}
      <RankUpCinematic
        isVisible={shouldShowRankUp}
        oldRank={oldRank}
        newRank={newRank}
        oldRankImageUrl={oldRankImageUrl}
        newRankImageUrl={newRankImageUrl}
        onContinue={dismissRankUp}
      />
    </>
  );
};

export default Home;