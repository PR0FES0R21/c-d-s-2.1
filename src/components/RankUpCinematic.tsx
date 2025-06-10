// ===========================================================================
// File: src/components/RankUpCinematic.tsx (NEW)
// Deskripsi: Sistem animasi cinematic untuk rank-up dengan kontrol penuh user
// ===========================================================================
import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, Sparkles, Shield, Star } from 'lucide-react';

interface RankUpCinematicProps {
  isVisible: boolean;
  oldRank: string;
  newRank: string;
  oldRankImageUrl: string;
  newRankImageUrl: string;
  onContinue: () => void;
}

const RankUpCinematic: React.FC<RankUpCinematicProps> = ({
  isVisible,
  oldRank,
  newRank,
  oldRankImageUrl,
  newRankImageUrl,
  onContinue
}) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'transform' | 'complete'>('enter');
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Reset animation state
      setAnimationPhase('enter');
      setShowButton(false);

      // Animation sequence
      const timer1 = setTimeout(() => setAnimationPhase('transform'), 1000);
      const timer2 = setTimeout(() => setAnimationPhase('complete'), 2500);
      const timer3 = setTimeout(() => setShowButton(true), 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background Overlay with Blur Effect */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md">
        {/* Holographic Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-grid-pattern"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-cyan-600/20 to-green-600/30"></div>
        </div>
        
        {/* Animated Light Beams */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Header Text */}
        <div className={`mb-8 transition-all duration-1000 ${
          animationPhase === 'enter' ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles size={32} className="text-cyan-400 animate-pulse" />
            <h1 className="text-4xl sm:text-5xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400">
              RANK UP!
            </h1>
            <Sparkles size={32} className="text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <div className="text-xl font-mono text-gray-300 mb-2">
            <span className="text-purple-400">{oldRank}</span>
            <ArrowRight size={24} className="inline mx-4 text-cyan-400" />
            <span className="text-green-400">{newRank}</span>
          </div>
          
          <p className="text-cyan-400 font-mono text-lg">
            "New Smoketron protocols unlocked."
          </p>
        </div>

        {/* Badge Transformation Area */}
        <div className={`relative mb-12 transition-all duration-1000 ${
          animationPhase === 'enter' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
        }`}>
          <div className="flex items-center justify-center gap-8 sm:gap-16">
            {/* Old Badge */}
            <div className={`relative transition-all duration-2000 ${
              animationPhase === 'transform' ? 'opacity-50 scale-90 -translate-x-4' : 
              animationPhase === 'complete' ? 'opacity-30 scale-75 -translate-x-8' : 
              'opacity-100 scale-100'
            }`}>
              <div className="relative">
                {/* Badge Container */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-gray-800/50 border border-purple-500/30 p-2 sm:p-3">
                  <div className="w-full h-full rounded-lg bg-gray-900 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={oldRankImageUrl} 
                      alt={oldRank}
                      className="w-full h-full sm:w-20 sm:h-20 object-cover relative z-10"
                      onError={(e) => (e.currentTarget.src = "/assets/chevron_rank_badge.png")}
                    />
                    {/* Scanning Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent transform -skew-x-12 transition-all duration-1000 ${
                      animationPhase === 'transform' ? 'translate-x-full' : '-translate-x-full'
                    }`}></div>
                  </div>
                </div>
                
                {/* Old Badge Label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-sm font-orbitron text-purple-400">{oldRank}</span>
                </div>
              </div>
            </div>

            {/* Transformation Arrow */}
            <div className={`transition-all duration-1000 ${
              animationPhase === 'transform' ? 'scale-125 text-cyan-400' : 
              animationPhase === 'complete' ? 'scale-110 text-green-400' : 
              'scale-100 text-gray-500'
            }`}>
              <ArrowRight size={32} className="animate-pulse" />
            </div>

            {/* New Badge */}
            <div className={`relative transition-all duration-2000 ${
              animationPhase === 'enter' ? 'opacity-30 scale-75 translate-x-8' :
              animationPhase === 'transform' ? 'opacity-80 scale-95 translate-x-4' : 
              'opacity-100 scale-110 translate-x-0'
            }`}>
              <div className="relative">
                {/* Badge Container with Enhanced Glow */}
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-cyan-500/30 to-green-500/20 border-2 p-2 sm:p-3 transition-all duration-1000 ${
                  animationPhase === 'complete' ? 'border-green-400/60 shadow-lg shadow-green-400/30' : 'border-cyan-500/30'
                }`}>
                  <div className="w-full h-full rounded-lg bg-gray-900 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={newRankImageUrl} 
                      alt={newRank}
                      className="w-full h-full sm:w-20 sm:h-20 object-cover relative z-10"
                      onError={(e) => (e.currentTarget.src = "/assets/chevron_rank_badge.png")}
                    />
                    {/* Success Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-green-500/20 transition-opacity duration-1000 ${
                      animationPhase === 'complete' ? 'opacity-100 animate-pulse' : 'opacity-0'
                    }`}></div>
                    {/* Scanning Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent transform -skew-x-12 transition-all duration-1000 ${
                      animationPhase === 'transform' ? 'translate-x-full' : '-translate-x-full'
                    }`} style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>

                {/* Particle Effects */}
                {animationPhase === 'complete' && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-green-400 rounded-full animate-ping"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${20 + Math.random() * 60}%`,
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: '2s'
                        }}
                      ></div>
                    ))}
                  </div>
                )}
                
                {/* New Badge Label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-sm font-orbitron transition-colors duration-1000 ${
                    animationPhase === 'complete' ? 'text-green-400' : 'text-cyan-400'
                  }`}>{newRank}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className={`transition-all duration-1000 ${
          showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <button
            onClick={onContinue}
            className="relative overflow-hidden group px-8 py-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-cyan-500/50 rounded-xl font-orbitron text-lg text-white hover:from-purple-500/30 hover:to-cyan-500/30 hover:border-green-400/60 transition-all duration-500"
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center justify-center gap-3">
              <Zap size={20} className="text-cyan-400 group-hover:text-green-400 transition-colors duration-300" />
              <span>Sync dengan Smoketron</span>
              <Shield size={20} className="text-purple-400 group-hover:text-cyan-400 transition-colors duration-300" />
            </div>

            {/* Button Border Glow */}
            <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-xl opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-500"></div>
          </button>
          
          {/* Subtitle */}
          <p className="mt-4 text-sm font-mono text-gray-400">
            Press to continue your mission, Commander.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-mono text-green-400"> </span>
        </div>
      </div>
    </div>
  );
};

export default RankUpCinematic;