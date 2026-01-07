import React from 'react';
import { EnvironmentItem as EnvItemType } from '../types';

interface Props {
  item: EnvItemType;
}

const EnvironmentItem: React.FC<Props> = ({ item }) => {
  const { type, position, scale } = item;

  // Position style
  const style: React.CSSProperties = {
    left: position.x,
    top: position.y,
    transform: `translate(-50%, -50%) scale(${scale})`,
    position: 'absolute',
    pointerEvents: 'none', 
    zIndex: type === 'door' ? 15 : 5, // Door sits higher than grass/trees
  };

  if (type === 'door') {
    return (
      <div style={style}>
        {/* Floating Door Sprite */}
        <div className="relative w-24 h-32">
            {/* Detached Shadow to sell the "floating" effect */}
            <div className="absolute bottom-0 left-4 w-16 h-4 bg-black/30 rounded-full blur-[2px]"></div>
            
            {/* The Door Frame & Void - Bobbing animation via Tailwind */}
            <div className="absolute bottom-8 w-24 h-24 animate-[bounce_3s_infinite]">
                {/* Stone Frame */}
                <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
                    {/* Arch Frame */}
                    <path d="M10 120 L10 40 Q50 -20 90 40 L90 120 L80 120 L80 45 Q50 5 20 45 L20 120 Z" fill="#57534e" stroke="black" strokeWidth="2" />
                    <rect x="5" y="110" width="90" height="10" fill="#44403c" stroke="black" strokeWidth="2" /> {/* Step */}
                    
                    {/* The Void (Portal) */}
                    <path d="M20 45 Q50 5 80 45 L80 110 L20 110 Z" fill="#2e1065" />
                    
                    {/* Swirls/Stars in the void */}
                    <circle cx="50" cy="60" r="15" fill="#a855f7" opacity="0.5" />
                    <circle cx="50" cy="60" r="8" fill="#e879f9" opacity="0.8" />
                    <path d="M30 90 L40 80 M70 50 L60 60" stroke="#f0abfc" strokeWidth="2" />
                    
                    {/* Keyhole / Symbol */}
                    <circle cx="50" cy="30" r="5" fill="#facc15" stroke="black" />
                </svg>
            </div>
        </div>
      </div>
    );
  }

  if (type === 'grass') {
    // A simple tuft of grass tile
    return (
      <div style={style}>
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
           <path d="M12 20L10 12" stroke="#4ade80" strokeWidth="2" />
           <path d="M12 20L14 10" stroke="#22c55e" strokeWidth="2" />
           <path d="M12 20L8 14" stroke="#166534" strokeWidth="2" />
         </svg>
      </div>
    );
  }

  if (type === 'tree') {
    // Castle of the Winds style Tree (Top down, flat looking)
    return (
      <div style={style}>
        <div className="relative w-16 h-20">
            {/* Shadow */}
            <div className="absolute bottom-0 left-2 w-12 h-4 bg-black/40 rounded-full"></div>
            
            {/* Trunk */}
            <div className="absolute bottom-2 left-6 w-4 h-8 bg-[#5D4037]"></div>
            
            {/* Leaves - stacked circles/blobs for that 90s look */}
            <div className="absolute bottom-6 left-0 w-16 h-12 bg-[#1B5E20] rounded-full border-b-4 border-[#0d3310]"></div>
            <div className="absolute bottom-10 left-2 w-12 h-10 bg-[#2E7D32] rounded-full border-b-4 border-[#145218]"></div>
            <div className="absolute bottom-14 left-4 w-8 h-8 bg-[#4CAF50] rounded-full border-b-4 border-[#1e6622]"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default React.memo(EnvironmentItem);