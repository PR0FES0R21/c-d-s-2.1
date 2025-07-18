// ===========================================================================
// File: src/components/RankUpCinematic.tsx (ENHANCED - Responsive Text with clamp())
// Deskripsi: Sistem animasi cinematic untuk rank-up dengan UI taktis yang immersive dan teks responsif
// ===========================================================================
import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, Shield, Star } from 'lucide-react';

interface RankUpCinematicProps {
  isVisible: boolean;
  oldRank: string;
  newRank: string;
  oldRankImageUrl: string;
  newRankImageUrl: string;
  onContinue: () => void;
}

// Komponen Chevron Trail yang dapat digunakan kembali
const ChevronTrail: React.FC<{ 
  isActive: boolean; 
  count?: number; 
  className?: string;
  onBurst?: boolean;
}> = ({ 
  isActive, 
  count = 6, 
  className = "", 
  onBurst = false 
}) => {
  return (
    <div className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`relative transition-all duration-300 ${
            isActive ? 'opacity-100' : 'opacity-30'
          }`}
          style={{
            animationDelay: `${index * 0.15}s`,
          }}
        >
          {/* Chevron SVG dengan glow effect - Responsive size */}
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            className={`chevron-element ${isActive ? 'animate-chevron-glow' : ''} ${
              onBurst ? 'animate-chevron-burst' : ''
            } w-3 h-4 sm:w-4 sm:h-5`}
            style={{
              animationDelay: `${index * 0.15}s`,
            }}
          >
            <path
              d="M2 2 L12 10 L2 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="text-cyan-400"
            />
            {/* Glow layer */}
            <path
              d="M2 2 L12 10 L2 18"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="text-cyan-400 opacity-30 blur-sm"
            />
          </svg>
          
          {/* Additional glow effect */}
          <div className={`absolute inset-0 rounded-full ${
            isActive ? 'animate-chevron-pulse' : ''
          }`} 
          style={{
            animationDelay: `${index * 0.15}s`,
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.3) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}></div>
        </div>
      ))}
    </div>
  );
};

// Komponen Corner Decorations untuk UI Taktis
const CornerDecorations: React.FC = () => {
  return (
    <>
      {/* Top Left Corner */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-8 h-8 sm:w-16 sm:h-16 pointer-events-none">
        <div className="absolute top-0 left-0 w-4 h-0.5 sm:w-8 sm:h-1 bg-gradient-to-r from-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-0.5 h-4 sm:w-1 sm:h-8 bg-gradient-to-b from-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-1.5 h-1.5 sm:w-3 sm:h-3 border border-cyan-400/50 rotate-45 animate-pulse-slow"></div>
      </div>

      {/* Top Right Corner */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-16 sm:h-16 pointer-events-none">
        <div className="absolute top-0 right-0 w-4 h-0.5 sm:w-8 sm:h-1 bg-gradient-to-l from-purple-400 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-0 w-0.5 h-4 sm:w-1 sm:h-8 bg-gradient-to-b from-purple-400 to-transparent animate-pulse"></div>
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-3 sm:h-3 border border-purple-400/50 rotate-45 animate-pulse-slow"></div>
      </div>

      {/* Bottom Left Corner */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-16 sm:h-16 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-4 h-0.5 sm:w-8 sm:h-1 bg-gradient-to-r from-green-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-0.5 h-4 sm:w-1 sm:h-8 bg-gradient-to-t from-green-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-1.5 h-1.5 sm:w-3 sm:h-3 border border-green-400/50 rotate-45 animate-pulse-slow"></div>
      </div>

      {/* Bottom Right Corner */}
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-16 sm:h-16 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-4 h-0.5 sm:w-8 sm:h-1 bg-gradient-to-l from-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-0.5 h-4 sm:w-1 sm:h-8 bg-gradient-to-t from-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-1.5 h-1.5 sm:w-3 sm:h-3 border border-cyan-400/50 rotate-45 animate-pulse-slow"></div>
      </div>

      {/* Side Indicators */}
      <div className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 sm:gap-2 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="w-0.5 h-2 sm:w-1 sm:h-4 bg-gradient-to-b from-cyan-400/60 to-transparent animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>

      <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 sm:gap-2 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="w-0.5 h-2 sm:w-1 sm:h-4 bg-gradient-to-b from-purple-400/60 to-transparent animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </>
  );
};

// Komponen Motion Grid untuk Background Depth
const MotionGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {/* Animated Grid Lines */}
      <div className="absolute inset-0 motion-grid-lines"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Scanning Lines */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan-line-horizontal"></div>
        <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-purple-400/30 to-transparent animate-scan-line-vertical"></div>
      </div>
    </div>
  );
};

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
  const [chevronBurst, setChevronBurst] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Reset animation state
      setAnimationPhase('enter');
      setShowButton(false);
      setChevronBurst(false);

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

  const handleContinueClick = () => {
    // Trigger burst effect before continuing
    setChevronBurst(true);
    setTimeout(() => {
      onContinue();
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Enhanced Background with Parallax Effects */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-lg">
        {/* Motion Grid Background */}
        <MotionGrid />
        
        {/* Holographic Grid Background */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-holographic-grid"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-cyan-600/15 to-green-600/20"></div>
        </div>
        
        {/* Enhanced Animated Light Beams with Parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/15 rounded-full filter blur-3xl animate-parallax-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-cyan-500/15 rounded-full filter blur-3xl animate-parallax-medium" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-green-500/10 rounded-full filter blur-3xl animate-parallax-fast" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Corner Decorations */}
      <CornerDecorations />

      {/* Main Holographic Container */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Holographic Frame */}
        <div className="relative bg-gray-900/30 backdrop-blur-md border border-cyan-400/30 rounded-lg sm:rounded-2xl p-3 sm:p-6 lg:p-8 holographic-container">
          {/* Neon Frame Glow */}
          <div className="absolute inset-0 rounded-lg sm:rounded-2xl border border-cyan-400/50 animate-pulse-slow pointer-events-none"></div>
          <div className="absolute inset-1 sm:inset-2 rounded-md sm:rounded-xl border border-purple-400/30 animate-pulse-slow pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Header with Enhanced Frame */}
          <div className={`mb-4 sm:mb-6 lg:mb-8 transition-all duration-1000 relative ${
            animationPhase === 'enter' ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
          }`}>
            {/* Header Frame */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent rounded-lg border border-cyan-400/20"></div>
            
            <div className="relative p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <Sparkles className="text-cyan-400 animate-pulse w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                <h1 
                  className="font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-green-400 text-center leading-tight"
                  style={{ fontSize: 'clamp(1.25rem, 4vw, 3rem)' }} // Responsive font size using clamp()
                >
                  RANK ELEVATION
                </h1>
                <Sparkles className="text-purple-400 animate-pulse w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="font-mono text-gray-300 mb-2 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                <span 
                  className="text-purple-400 text-center"
                  style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.25rem)' }} // Responsive font size
                >
                  {oldRank}
                </span>
                {/* Enhanced Chevron Trail */}
                <ChevronTrail 
                  isActive={animationPhase !== 'enter'} 
                  count={5}
                  onBurst={chevronBurst}
                  className="mx-1 sm:mx-2"
                />
                <span 
                  className="text-green-400 text-center"
                  style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.25rem)' }} // Responsive font size
                >
                  {newRank}
                </span>
              </div>
              
              <p 
                className="text-cyan-400 font-mono text-center leading-relaxed"
                style={{ fontSize: 'clamp(0.75rem, 2vw, 1.125rem)' }} // Responsive font size
              >
                "Neural pathways synchronized. Clearance level upgraded."
              </p>
            </div>
          </div>

          {/* Badge Transformation Area with Enhanced Frames */}
          <div className={`relative mb-6 sm:mb-8 lg:mb-12 transition-all duration-1000 ${
            animationPhase === 'enter' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          }`}>
            {/* Transformation Container Frame */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/10 to-green-500/5 rounded-xl border border-purple-500/20"></div>
            
            <div className="relative p-3 sm:p-6 lg:p-8">
              <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-16">
                {/* Old Badge with Enhanced Frame */}
                <div className={`relative transition-all duration-2000 ${
                  animationPhase === 'transform' ? 'opacity-50 scale-90 -translate-x-2 sm:-translate-x-4' : 
                  animationPhase === 'complete' ? 'opacity-30 scale-75 -translate-x-4 sm:-translate-x-8' : 
                  'opacity-100 scale-100'
                }`}>
                  <div className="relative">
                    {/* Enhanced Badge Container with Neon Frame */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-gray-800/50 border-2 border-purple-500/40 p-1 sm:p-2 lg:p-3 neon-frame">
                      <div className="w-full h-full rounded-md sm:rounded-lg bg-gray-900 flex items-center justify-center relative overflow-hidden border border-purple-400/30">
                        <img 
                          src={oldRankImageUrl} 
                          alt={oldRank}
                          className="w-full h-full object-cover relative z-10"
                          onError={(e) => (e.currentTarget.src = "/assets/chevron_rank_badge.png")}
                        />
                        {/* Scanning Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent transform -skew-x-12 transition-all duration-1000 ${
                          animationPhase === 'transform' ? 'translate-x-full' : '-translate-x-full'
                        }`}></div>
                      </div>
                    </div>
                    
                    {/* Old Badge Label with Frame */}
                    <div className="absolute -bottom-6 sm:-bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-gray-900/80 border border-purple-400/30 rounded-md px-2 py-0.5 sm:px-3 sm:py-1">
                        <span 
                          className="font-orbitron text-purple-400"
                          style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)' }} // Responsive font size
                        >
                          {oldRank}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Central Chevron Trail - Larger Version with Frame */}
                <div className={`relative transition-all duration-1000 ${
                  animationPhase === 'transform' ? 'scale-125' : 
                  animationPhase === 'complete' ? 'scale-110' : 
                  'scale-100'
                }`}>
                  <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-2 sm:p-3 lg:p-4">
                    <ChevronTrail 
                      isActive={animationPhase !== 'enter'} 
                      count={3}
                      onBurst={chevronBurst}
                      className="transform scale-125 sm:scale-150"
                    />
                  </div>
                </div>

                {/* New Badge with Enhanced Frame */}
                <div className={`relative transition-all duration-2000 ${
                  animationPhase === 'enter' ? 'opacity-30 scale-75 translate-x-4 sm:translate-x-8' :
                  animationPhase === 'transform' ? 'opacity-80 scale-95 translate-x-2 sm:translate-x-4' : 
                  'opacity-100 scale-110 translate-x-0'
                }`}>
                  <div className="relative">
                    {/* Enhanced Badge Container with Enhanced Glow */}
                    <div className={`w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/30 to-green-500/20 border-2 p-1 sm:p-2 lg:p-3 transition-all duration-1000 neon-frame-enhanced ${
                      animationPhase === 'complete' ? 'border-green-400/60 shadow-lg shadow-green-400/30' : 'border-cyan-500/40'
                    }`}>
                      <div className="w-full h-full rounded-md sm:rounded-lg bg-gray-900 flex items-center justify-center relative overflow-hidden border border-cyan-400/30">
                        <img 
                          src={newRankImageUrl} 
                          alt={newRank}
                          className="w-full h-full object-cover relative z-10"
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
                              animationDelay: `${i * 0.15}s`,
                              animationDuration: '2s'
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                    
                    {/* New Badge Label with Frame */}
                    <div className="absolute -bottom-6 sm:-bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className={`bg-gray-900/80 border rounded-md px-2 py-0.5 sm:px-3 sm:py-1 transition-colors duration-1000 ${
                        animationPhase === 'complete' ? 'border-green-400/30' : 'border-cyan-400/30'
                      }`}>
                        <span 
                          className={`font-orbitron transition-colors duration-1000 ${
                            animationPhase === 'complete' ? 'text-green-400' : 'text-cyan-400'
                          }`}
                          style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)' }} // Responsive font size
                        >
                          {newRank}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button with Enhanced Frame */}
          <div className={`transition-all duration-1000 ${
            showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="relative">
              {/* Button Frame */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-green-500/10 rounded-lg sm:rounded-xl border border-cyan-400/30 animate-pulse-slow"></div>
              
              <div className="relative p-2 sm:p-3 lg:p-4">
                <button
                  onClick={handleContinueClick}
                  className="relative overflow-hidden group w-full px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-2 border-cyan-500/50 rounded-lg sm:rounded-xl font-orbitron text-white hover:from-purple-500/30 hover:to-cyan-500/30 hover:border-green-400/60 transition-all duration-500"
                >
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-green-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Button Content */}
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                    <Zap className="text-cyan-400 group-hover:text-green-400 transition-colors duration-300 w-4 h-4 sm:w-5 sm:h-5" />
                    <span 
                      className="text-center leading-tight"
                      style={{ fontSize: 'clamp(0.75rem, 2vw, 1.125rem)' }} // Responsive font size
                    >
                      Synchronize with Smoketron Network
                    </span>
                    <Shield className="text-purple-400 group-hover:text-cyan-400 transition-colors duration-300 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* Button Border Glow */}
                  <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-500"></div>
                </button>
                
                {/* Subtitle */}
                <p 
                  className="mt-2 sm:mt-4 font-mono text-gray-400 text-center leading-relaxed"
                  style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)' }} // Responsive font size
                >
                  Neural interface ready. Proceed when ready, Commander.
                </p>
              </div>
            </div>
          </div>

          {/* Status Indicators with Enhanced Frame */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2">
            <div className="bg-gray-900/80 border border-green-400/30 rounded-md px-1 py-0.5 sm:px-2 sm:py-1 flex items-center gap-1 sm:gap-2">
              <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span 
                className="font-mono text-green-400"
                style={{ fontSize: 'clamp(0.5rem, 1.2vw, 0.75rem)' }} // Responsive font size
              >
                NEURAL LINK ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankUpCinematic;