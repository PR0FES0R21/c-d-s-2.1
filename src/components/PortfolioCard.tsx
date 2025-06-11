import React from 'react';
import { Sparkles, TrendingUp as Trending, CircleDashed, Lock } from 'lucide-react';

const PortfolioCard: React.FC = () => {
  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-5 h-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
      
      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-5 relative z-20">
        <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          Portfolio Overview
        </h2>
        <div className="text-xs font-mono text-gray-400 flex items-center gap-1">
          <span>LAST SYNC:</span>
          <span className="text-cyan-400">00:05:32</span>
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
        </div>
      </div>
      
      {/* Content Container with Blur Effect */}
      <div className="relative">
        {/* Original Content - Blurred */}
        <div className="space-y-5 filter blur-sm opacity-30 pointer-events-none">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-900/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono text-gray-400">BALANCE</span>
              <div className="flex items-center gap-1 text-xs font-mono text-green-400">
                <Trending size={14} />
                <span>+2.4%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400">
                42,069
              </span>
              <span className="text-lg font-orbitron text-white">$CIGAR</span>
            </div>
            <div className="mt-1 text-xs font-mono text-gray-400">
              ≈ 1,337 USD
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-900/30">
              <div className="text-xs font-mono text-gray-400 mb-1">NFTs</div>
              <div className="text-xl font-orbitron font-bold text-cyan-400">3</div>
              <div className="mt-1 text-xs font-mono text-gray-500">COLLECTION</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-900/30">
              <div className="text-xs font-mono text-gray-400 mb-1">PENDING</div>
              <div className="text-xl font-orbitron font-bold text-purple-400">2</div>
              <div className="mt-1 text-xs font-mono text-gray-500">AIRDROPS</div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-900/30">
            <div className="text-xs font-mono text-gray-400 mb-2">QUICK ACTIONS</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 bg-gray-900/70 border border-purple-900/50 rounded-md text-sm font-orbitron text-gray-400 flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                <CircleDashed size={14} className="text-purple-400" />
                <span>Claim Airdrop</span>
              </button>
              <button className="px-3 py-2 bg-gray-900/70 border border-purple-900/50 rounded-md text-sm font-orbitron text-gray-400 flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                <CircleDashed size={14} className="text-cyan-400" />
                <span>Stake Tokens</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overlay with Lock Message */}
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] border border-red-500/20 rounded-lg flex items-center justify-center pointer-events-none">
          {/* Subtle animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-red-500/20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent animate-scan-line-horizontal"></div>
          </div>
          
          {/* Lock Message Container */}
          <div className="relative text-center space-y-3 px-4">
            {/* Lock Icon with Glow */}
            <div className="flex justify-center">
              <div className="relative">
                <Lock size={32} className="text-red-400 animate-pulse" />
                <div className="absolute inset-0 bg-red-400/30 rounded-full filter blur-lg animate-pulse"></div>
              </div>
            </div>
            
            {/* Main Lock Message with Wave Animation */}
            <div className="space-y-2">
              <h3 className="font-orbitron text-red-400 text-lg font-bold animate-wave">
                🔒 Data Access Locked
              </h3>
              <p className="font-mono text-gray-400 text-sm leading-relaxed animate-glitch-text">
                System Integration Pending:<br />
                Portfolio Sync Incomplete
              </p>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              <span className="animate-pulse">AWAITING CLEARANCE</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Effects - Unchanged */}
      <div className="absolute bottom-0 right-0 w-full h-40 pointer-events-none opacity-10">
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-cyan-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};

export default PortfolioCard;