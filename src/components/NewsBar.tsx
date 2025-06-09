import React, { useEffect, useRef } from 'react';
import { Radio } from 'lucide-react';

const newsItems = [
  "BREAKING: Krellnic Inversion aftermath stabilizing in sector 7G",
  "ALERT: Smoketron Council announces new tokenomics proposal",
  "UPDATE: $CIGAR burns exceed expectations by 420%",
  "NOTICE: DAO voting mechanism upgrade scheduled for next cycle",
  "ANNOUNCEMENT: NFT series 'Ashes of Krellnic' minting soon",
  "WARNING: Unauthorized mining operations detected in outer rim",
  "REPORT: Liquidity pools showing increased stability post-inversion",
  "BULLETIN: Community call scheduled in 3 solar cycles"
];

const NewsBar: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    const animateScroll = () => {
      if (!scrollContainer) return;
      
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };
    
    const interval = setInterval(animateScroll, 30);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative bg-gray-900/90 border-t border-purple-900/30 backdrop-blur-md py-2 mt-auto">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-900 to-transparent z-10 flex items-center justify-center">
        <Radio size={18} className="text-cyan-400 animate-pulse" />
      </div>
      
      <div 
        ref={scrollRef}
        className="overflow-x-scroll whitespace-nowrap pl-12 pr-4 hide-scrollbar"
      >
        <div className="inline-block">
          {newsItems.map((item, index) => (
            <React.Fragment key={index}>
              <span className="inline-block font-mono text-sm text-gray-400">
                {item}
              </span>
              <span className="inline-block mx-8 text-purple-500 font-bold">◉</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsBar;