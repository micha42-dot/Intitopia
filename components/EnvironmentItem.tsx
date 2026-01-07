import React, { useEffect, useState } from 'react';
import { EnvironmentItem as EnvItemType } from '../types';
import { MAGIC_QUOTES } from '../constants';

interface Props {
  item: EnvItemType;
  isMagicActive?: boolean;
}

const EnvironmentItem: React.FC<Props> = ({ item, isMagicActive }) => {
  const { type, position, scale } = item;
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Cycle quotes if magical
  useEffect(() => {
    if (!isMagicActive) return;
    const interval = setInterval(() => {
        setQuoteIndex(prev => (prev + 1) % MAGIC_QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isMagicActive]);

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
            
            {/* --- MAGIC EFFECTS UNDERLAYER --- */}
            {isMagicActive && (
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {/* Rising Smoke Effect using simple CSS anims mapped to inline styles for randomness */}
                    {[...Array(8)].map((_, i) => (
                        <div 
                            key={`smoke-${i}`}
                            className="absolute bg-purple-900 rounded-full opacity-0 blur-md animate-[ping_3s_infinite]"
                            style={{
                                bottom: '20%',
                                left: `${20 + Math.random() * 60}%`,
                                width: '20px',
                                height: '20px',
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`,
                                transform: 'translateY(-50px)'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Detached Shadow to sell the "floating" effect */}
            <div className={`absolute bottom-0 left-4 w-16 h-4 bg-black/30 rounded-full blur-[2px] transition-all duration-1000 ${isMagicActive ? 'bg-purple-900/60 w-20 scale-110' : ''}`}></div>
            
            {/* The Door Frame & Void - Bobbing animation via Tailwind */}
            <div className={`absolute bottom-8 w-24 h-24 animate-[bounce_3s_infinite] ${isMagicActive ? 'animate-[bounce_1s_infinite]' : ''}`}>
                {/* Stone Frame */}
                <svg viewBox="0 0 100 120" className={`w-full h-full drop-shadow-lg transition-all duration-1000 ${isMagicActive ? 'drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]' : ''}`}>
                    {/* Arch Frame */}
                    <path d="M10 120 L10 40 Q50 -20 90 40 L90 120 L80 120 L80 45 Q50 5 20 45 L20 120 Z" fill={isMagicActive ? "#4c1d95" : "#57534e"} stroke="black" strokeWidth="2" />
                    <rect x="5" y="110" width="90" height="10" fill="#44403c" stroke="black" strokeWidth="2" /> {/* Step */}
                    
                    {/* The Void (Portal) */}
                    <path d="M20 45 Q50 5 80 45 L80 110 L20 110 Z" fill={isMagicActive ? "#000" : "#2e1065"} />
                    
                    {/* Swirls/Stars in the void */}
                    <circle cx="50" cy="60" r={isMagicActive ? "25" : "15"} fill="#a855f7" opacity="0.5" className={isMagicActive ? 'animate-spin' : ''} style={{transformBox: 'fill-box', transformOrigin: 'center'}}/>
                    
                    {/* Sparkles inside */}
                    {isMagicActive ? (
                         <g fill="#FFF">
                             <circle cx="50" cy="60" r="2" className="animate-ping" />
                             <circle cx="30" cy="40" r="1" className="animate-pulse" />
                             <circle cx="70" cy="80" r="1" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                         </g>
                    ) : (
                        <>
                            <circle cx="50" cy="60" r="8" fill="#e879f9" opacity="0.8" />
                            <path d="M30 90 L40 80 M70 50 L60 60" stroke="#f0abfc" strokeWidth="2" />
                        </>
                    )}
                    
                    {/* Keyhole / Symbol */}
                    <circle cx="50" cy="30" r="5" fill={isMagicActive ? "#fff" : "#facc15"} stroke="black" className={isMagicActive ? 'animate-pulse' : ''} />
                </svg>
            </div>

            {/* --- MAGIC QUOTES OVERLAYER --- */}
            {isMagicActive && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 text-center pointer-events-none z-50">
                    <div className="text-yellow-300 font-bold text-xs animate-bounce drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] px-2 py-1 bg-purple-900/80 rounded border border-yellow-500">
                        "{MAGIC_QUOTES[quoteIndex]}"
                    </div>
                </div>
            )}
            
            {/* Floating Sparkles Outside */}
            {isMagicActive && (
                 <div className="absolute -top-10 -left-10 w-44 h-44 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rotate-45 animate-[ping_1s_infinite]"></div>
                     <div className="absolute top-0 right-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                     <div className="absolute bottom-10 left-0 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                 </div>
            )}

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