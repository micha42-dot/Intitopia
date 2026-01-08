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
  const [isShaking, setIsShaking] = useState(false);

  // Cycle quotes if magical
  useEffect(() => {
    if (!isMagicActive) return;
    const interval = setInterval(() => {
        setQuoteIndex(prev => (prev + 1) % MAGIC_QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isMagicActive]);

  // "Something is trying to break through" - Random Shake Effect
  useEffect(() => {
    // Only shake if it's the door
    if (type !== 'door') return;

    const scheduleShake = () => {
        // Random time between 3 and 10 seconds
        const nextShakeTime = Math.random() * 7000 + 3000;
        
        setTimeout(() => {
            setIsShaking(true);
            // Shake duration (500ms)
            setTimeout(() => {
                setIsShaking(false);
                scheduleShake(); // Schedule next
            }, 500);
        }, nextShakeTime);
    };

    scheduleShake();
  }, [type]);

  const style: React.CSSProperties = {
    left: position.x,
    top: position.y,
    transform: `translate(-50%, -50%) scale(${scale})`,
    position: 'absolute',
    pointerEvents: 'none', 
    zIndex: Math.floor(position.y), 
  };

  if (type === 'door') {
    // THE NATURAL MOUNTAIN GATE
    return (
      <div style={{...style, zIndex: Math.floor(position.y) + 20}}> 
        <style>
            {`
            @keyframes mountain-shake {
                0% { transform: translate(1px, 1px) rotate(0deg); }
                10% { transform: translate(-1px, -2px) rotate(-1deg); }
                20% { transform: translate(-3px, 0px) rotate(1deg); }
                30% { transform: translate(3px, 2px) rotate(0deg); }
                40% { transform: translate(1px, -1px) rotate(1deg); }
                50% { transform: translate(-1px, 2px) rotate(-1deg); }
                60% { transform: translate(-3px, 1px) rotate(0deg); }
                70% { transform: translate(3px, 1px) rotate(-1deg); }
                80% { transform: translate(-1px, -1px) rotate(1deg); }
                90% { transform: translate(1px, 2px) rotate(0deg); }
                100% { transform: translate(1px, -2px) rotate(-1deg); }
            }
            `}
        </style>
        
        {/* Container Size for the Natural Mountain */}
        <div className="relative w-80 h-64 -mt-32 flex justify-center items-end">
            
            <svg 
                viewBox="0 0 64 64" 
                className={`w-full h-full drop-shadow-2xl transition-all duration-300 ${isShaking ? 'animate-[mountain-shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]' : ''}`} 
                shapeRendering="crispEdges"
            >
                {/* --- ROCK FORMATION (Natural/Irregular) --- */}
                
                {/* 1. Base Darkest Rock (The massive silhouette) */}
                <path d="M4 64 L12 50 L8 40 L20 20 L32 5 L48 24 L56 36 L62 50 L64 64 Z" fill="#1f1f1f" />
                
                {/* 2. Main Rock Body (Mid-Grey) - Creating stepped/jagged surface */}
                <path d="M14 64 L18 52 L16 45 L22 30 L32 12 L42 28 L50 48 L54 64 Z" fill="#2d2d2d" />
                
                {/* 3. Rock Highlights/Plateaus (Lighter Grey) */}
                <path d="M32 12 L36 16 L30 18 Z" fill="#4a4a4a" /> {/* Peak highlight */}
                <path d="M18 52 L22 52 L20 48 Z" fill="#4a4a4a" /> {/* Left outcrop */}
                <path d="M48 40 L52 42 L48 44 Z" fill="#4a4a4a" /> {/* Right outcrop */}
                
                {/* 4. Deep Shadows/Crevices */}
                <path d="M22 30 L24 38 L22 42" stroke="#111" strokeWidth="1" fill="none" />
                <path d="M42 28 L40 36 L44 40" stroke="#111" strokeWidth="1" fill="none" />
                
                {/* --- THE ANCIENT GATE (Set INTO the rock) --- */}
                
                {/* The Recessed Archway (Darker than rock) */}
                <path d="M26 64 V38 C26 34 38 34 38 38 V64" fill="#1a1a1a" />
                
                {/* The Gate Material (Rusty Iron/Dark Wood) */}
                <rect x="27" y="40" width="5" height="24" fill="#291d18" /> {/* Left slab */}
                <rect x="32" y="40" width="5" height="24" fill="#291d18" /> {/* Right slab */}
                
                {/* Heavy Iron Bands */}
                <rect x="26" y="44" width="12" height="2" fill="#0f0f0f" />
                <rect x="26" y="56" width="12" height="2" fill="#0f0f0f" />
                
                {/* The Seam (Where magic leaks) */}
                <rect x="31.5" y="40" width="1" height="24" fill="#000" />

                {/* --- MAGIC EFFECTS --- */}
                {isMagicActive && (
                    <g>
                        {/* Glowing Cracks in Rock */}
                        <path d="M32 25 L32 35" stroke="#a855f7" strokeWidth="0.5" className="animate-pulse" />
                        <path d="M28 30 L32 35 L36 30" stroke="#a855f7" strokeWidth="0.5" className="animate-pulse" />
                        
                        {/* Gate Seam Glow */}
                        <rect x="31.5" y="40" width="1" height="24" fill="#d8b4fe" className="animate-pulse" />
                        
                        {/* Runes on the Arch */}
                        <rect x="28" y="36" width="1" height="1" fill="#d8b4fe" />
                        <rect x="35" y="36" width="1" height="1" fill="#d8b4fe" />
                    </g>
                )}

                {/* Impact dust when shaking */}
                {isShaking && (
                     <g>
                         <circle cx="26" cy="62" r="1" fill="#7d7d7d" className="animate-ping" />
                         <circle cx="38" cy="62" r="1" fill="#7d7d7d" className="animate-ping" />
                     </g>
                )}
            </svg>

            {/* --- OVERLAY TEXT --- */}
            {isMagicActive && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 text-center pointer-events-none z-50">
                    <div className="text-[#d8b4fe] text-[10px] animate-bounce bg-black/90 px-3 py-2 border-2 border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{fontFamily: '"Pixelify Sans", sans-serif'}}>
                        "{MAGIC_QUOTES[quoteIndex]}"
                    </div>
                </div>
            )}
            
            {/* Subtle "Thud" text when shaking but NOT magic */}
            {isShaking && !isMagicActive && (
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none">
                     <div className="text-white text-xs font-bold bg-black/50 px-1 animate-ping" style={{fontFamily: '"Pixelify Sans", sans-serif'}}>
                        *THUD*
                     </div>
                 </div>
            )}

        </div>
      </div>
    );
  }

  if (type === 'grass') {
    return (
      <div style={{...style, zIndex: 0}}> 
         <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" className="opacity-80">
           <rect x="8" y="12" width="1" height="3" fill="#2e7d32" />
           <rect x="6" y="13" width="1" height="2" fill="#4caf50" />
           <rect x="10" y="13" width="1" height="2" fill="#1b5e20" />
         </svg>
      </div>
    );
  }

  if (type === 'tree') {
    return (
      <div style={{...style, zIndex: Math.floor(position.y)}}> {/* Better Z-Indexing for trees vs players */}
        <div className="relative w-32 h-40 -mt-28">
            <svg viewBox="0 0 32 40" className="w-full h-full drop-shadow-lg" shapeRendering="crispEdges">
                {/* Trunk */}
                <rect x="14" y="28" width="4" height="8" fill="#5D4037" />
                <rect x="13" y="36" width="6" height="2" fill="#3E2723" /> {/* Roots */}
                
                {/* Leaves (Layered Rects) */}
                {/* Bottom Layer */}
                <rect x="8" y="24" width="16" height="6" fill="#1B5E20" />
                <rect x="6" y="26" width="20" height="2" fill="#1B5E20" />
                
                {/* Middle Layer */}
                <rect x="10" y="18" width="12" height="8" fill="#2E7D32" />
                <rect x="8" y="20" width="16" height="4" fill="#2E7D32" />

                {/* Top Layer */}
                <rect x="12" y="12" width="8" height="8" fill="#4CAF50" />
                <rect x="14" y="10" width="4" height="2" fill="#4CAF50" />
                
                {/* Highlights */}
                <rect x="13" y="14" width="2" height="2" fill="#81C784" />
                <rect x="18" y="20" width="2" height="2" fill="#66BB6A" />
            </svg>
        </div>
      </div>
    );
  }

  return null;
};

export default React.memo(EnvironmentItem);