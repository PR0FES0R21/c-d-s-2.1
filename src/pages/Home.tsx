import React from 'react';
import ProjectStatus from '../components/ProjectStatus';
import PortfolioCard from '../components/PortfolioCard';
import MissionLog from '../components/MissionLog';
import MissionProgress from '../components/MissionProgress';
import AllyTracker from '../components/AllyTracker';

const Home: React.FC = () => {
  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <ProjectStatus />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <PortfolioCard />
        <MissionLog />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <MissionProgress />
        </div>
        <div className="lg:col-span-3">
          <AllyTracker />
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
  );
};

export default Home;