import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Entity } from '../types';
import { ENTITY_SIZE, MESSAGE_LIFETIME, PROXIMITY_RADIUS } from '../constants';

interface AvatarProps {
  entity: Entity;
  isCurrentUser: boolean;
  isInRange: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ entity, isCurrentUser, isInRange }) => {
  // Movement Detection
  const prevPos = useRef(entity.position);
  const [isMoving, setIsMoving] = useState(false);
  const stopMoveTimer = useRef<number | null>(null);

  useEffect(() => {
      const dx = Math.abs(entity.position.x - prevPos.current.x);
      const dy = Math.abs(entity.position.y - prevPos.current.y);

      // If position changed significantly
      if (dx > 0.1 || dy > 0.1) {
          if (!isMoving) setIsMoving(true);
          
          // Reset the timer that stops the animation
          if (stopMoveTimer.current) clearTimeout(stopMoveTimer.current);
          stopMoveTimer.current = window.setTimeout(() => {
              setIsMoving(false);
          }, 100); // Stop animation 100ms after last movement update
      }

      prevPos.current = entity.position;
  }, [entity.position.x, entity.position.y]);

  // Filter active messages based on lifetime
  const activeMessages = (entity.messages || []).filter(msg => Date.now() - msg.timestamp < MESSAGE_LIFETIME);
  
  // Visibility logic
  const displayStyle = isCurrentUser ? 1 : (isInRange ? 1 : 0.3);

  // Name color logic
  const nameColor = entity.isKiller ? '#ef4444' : '#3b82f6';
  
  // Generate stable archetypes based on ID
  const traits = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < entity.id.length; i++) {
        hash = entity.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const safeHash = Math.abs(hash);
    
    // 3 Distinct Archetypes
    const archetype = safeHash % 3;
    
    return { archetype };
  }, [entity.id]);

  // Palette
  const C_OUTLINE = "#1a1a1a";
  const C_METAL_DARK = "#525252";
  const C_METAL_LIGHT = "#9ca3af";
  const C_SKIN = "#ffdbac";
  const C_WOOD = "#5c4033";
  const C_PRIMARY = entity.color; // Tunic Color

  return (
    <div
      className="absolute flex flex-col items-center justify-center transition-all duration-100 linear will-change-transform"
      style={{
        left: entity.position.x,
        top: entity.position.y,
        width: ENTITY_SIZE, 
        height: ENTITY_SIZE,
        opacity: displayStyle,
        zIndex: Math.floor(entity.position.y), 
        transform: `translate(-50%, -50%)`,
        filter: entity.isDead ? 'grayscale(100%) brightness(0.7) sepia(0.5)' : 'none'
      }}
    >
      <style>{`
        @keyframes pixel-walk {
            0% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
            100% { transform: translateY(0); }
        }
        .walking-body {
            animation: pixel-walk 0.3s infinite steps(2);
        }
      `}</style>

      <div className="w-24 h-24 relative -mt-10"> 
        <svg 
            viewBox="0 0 24 24" 
            className="w-full h-full drop-shadow-md" 
            shapeRendering="crispEdges"
        >
            {entity.isDead ? (
                /* SKELETON REMAINS (Simple & Clean) */
                <g>
                    <rect x="10" y="18" width="4" height="2" fill="#ccc" /> {/* Hips */}
                    <rect x="11" y="13" width="2" height="5" fill="#ccc" /> {/* Spine */}
                    <rect x="9" y="14" width="6" height="1" fill="#ccc" /> {/* Ribs */}
                    <rect x="10" y="8" width="4" height="4" fill="#e5e5e5" /> {/* Skull */}
                    <rect x="11" y="10" width="1" height="1" fill="#000" />
                    <rect x="13" y="10" width="1" height="1" fill="#000" />
                    {/* Bones on ground */}
                    <rect x="6" y="20" width="3" height="1" fill="#ccc" />
                    <rect x="15" y="20" width="3" height="1" fill="#ccc" />
                </g>
            ) : (
                <g>
                    {/* SHADOW (Static - stays on ground) */}
                    <ellipse cx="12" cy="22" rx="6" ry="1.5" fill="rgba(0,0,0,0.3)" />

                    {/* ANIMATED BODY GROUP */}
                    <g className={isMoving ? "walking-body" : ""}>
                        {/* --- COMMON BASE: LEGS --- */}
                        <rect x="10" y="18" width="2" height="4" fill={C_METAL_DARK} />
                        <rect x="13" y="18" width="2" height="4" fill={C_METAL_DARK} />

                        {/* --- ARCHETYPE 0: THE CRUSADER (Shield & Bucket Helm) --- */}
                        {traits.archetype === 0 && (
                            <g>
                                {/* Tunic */}
                                <rect x="9" y="12" width="7" height="7" fill={C_PRIMARY} />
                                <rect x="9" y="17" width="7" height="1" fill="rgba(0,0,0,0.2)" /> {/* Belt Shadow */}
                                
                                {/* Shoulders */}
                                <rect x="8" y="12" width="2" height="2" fill={C_METAL_LIGHT} />
                                <rect x="15" y="12" width="2" height="2" fill={C_METAL_LIGHT} />

                                {/* Head: Bucket Helm */}
                                <rect x="9" y="5" width="7" height="7" fill={C_METAL_LIGHT} />
                                <rect x="9" y="8" width="7" height="1" fill={C_OUTLINE} /> {/* Eye Slit */}
                                <rect x="12" y="8" width="1" height="4" fill={C_OUTLINE} /> {/* Vertical Cross */}

                                {/* Weapon: Sword (Right Hand) */}
                                <rect x="17" y="11" width="1" height="8" fill={C_METAL_LIGHT} /> {/* Blade */}
                                <rect x="16" y="16" width="3" height="1" fill={C_METAL_DARK} /> {/* Hilt */}
                                <rect x="17" y="17" width="1" height="2" fill={C_WOOD} /> {/* Handle */}

                                {/* Item: Kite Shield (Left Hand - Covers Body slightly) */}
                                <path d="M6 13 L10 13 L10 17 L8 19 L6 17 Z" fill={C_METAL_LIGHT} />
                                <path d="M7 13 L9 13 L9 17 L8 18 L7 17 Z" fill={C_PRIMARY} /> {/* Painted stripe */}
                                <rect x="6" y="13" width="4" height="6" fill="none" stroke={C_OUTLINE} strokeWidth="0.5" />
                            </g>
                        )}

                        {/* --- ARCHETYPE 1: THE VANGUARD (Heavy Plate & Polearm) --- */}
                        {traits.archetype === 1 && (
                            <g>
                                {/* Heavy Armor Body */}
                                <rect x="8" y="11" width="9" height="8" fill={C_METAL_DARK} />
                                <rect x="10" y="11" width="5" height="8" fill={C_METAL_LIGHT} /> {/* Chestplate */}
                                
                                {/* Tabard hanging down */}
                                <rect x="11" y="17" width="3" height="4" fill={C_PRIMARY} />

                                {/* Head: Visor Helm */}
                                <rect x="10" y="5" width="5" height="6" fill={C_METAL_LIGHT} />
                                <rect x="10" y="7" width="5" height="1" fill={C_OUTLINE} /> {/* Visor Line */}
                                <rect x="11" y="3" width="3" height="2" fill={C_PRIMARY} /> {/* Plume */}

                                {/* Weapon: Halberd (Two Handed) */}
                                <rect x="16" y="4" width="1" height="18" fill={C_WOOD} /> {/* Staff */}
                                <rect x="16" y="5" width="3" height="4" fill={C_METAL_LIGHT} /> {/* Blade Head */}
                                <rect x="15" y="6" width="1" height="1" fill={C_METAL_LIGHT} /> {/* Spike Back */}
                            </g>
                        )}

                        {/* --- ARCHETYPE 2: THE RANGER (Hood & Daggers) --- */}
                        {traits.archetype === 2 && (
                            <g>
                                {/* Light Armor / Leather */}
                                <rect x="10" y="12" width="5" height="6" fill={C_WOOD} />
                                <rect x="10" y="12" width="5" height="2" fill={C_PRIMARY} opacity="0.8" /> {/* Scarf/Collar */}

                                {/* Head: Hood */}
                                <rect x="9" y="5" width="7" height="7" fill={C_PRIMARY} />
                                <rect x="10" y="7" width="5" height="4" fill="#000" opacity="0.3" /> {/* Face Shadow */}
                                <rect x="11" y="8" width="1" height="1" fill={C_SKIN} /> {/* Eye L */}
                                <rect x="14" y="8" width="1" height="1" fill={C_SKIN} /> {/* Eye R */}

                                {/* Weapon: Dagger (Left) */}
                                <rect x="7" y="15" width="1" height="3" fill={C_METAL_LIGHT} />
                                <rect x="7" y="17" width="1" height="2" fill={C_WOOD} />

                                {/* Weapon: Short Sword (Right) */}
                                <rect x="17" y="14" width="1" height="4" fill={C_METAL_LIGHT} />
                                <rect x="17" y="17" width="1" height="2" fill={C_WOOD} />
                            </g>
                        )}

                        {/* Killer Eyes (Glowing Red) */}
                        {entity.isKiller && (
                            <g>
                                <rect x="11" y="8" width="1" height="1" fill="#ff0000" className="animate-pulse" />
                                <rect x="13" y="8" width="1" height="1" fill="#ff0000" className="animate-pulse" />
                            </g>
                        )}
                    </g>
                </g>
            )}
        </svg>
      </div>

      {/* Clean Name Tag */}
      <div 
        className="absolute -top-3 whitespace-nowrap text-[8px] font-bold"
        style={{ 
            fontFamily: '"Pixelify Sans", sans-serif', 
            textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
            color: isCurrentUser ? '#ffff00' : nameColor,
        }}
      >
        {entity.name}
      </div>

      {/* Chat Bubble Stack */}
      {activeMessages.length > 0 && !entity.isDead && (
        <div className="absolute bottom-full mb-6 w-64 z-50 pointer-events-none flex flex-col justify-end items-center gap-1">
           {activeMessages.map((msg, index) => {
             const isLast = index === activeMessages.length - 1;
             return (
               <div 
                 key={msg.id}
                 className="text-center text-[15px] leading-snug text-black bg-white px-3 py-2 border border-black relative shadow-md"
                 style={{ fontFamily: '"Pixelify Sans", sans-serif' }}
               >
                 {msg.text}
                 {/* Only the last (bottom-most) message gets the tail */}
                 {isLast && (
                   <div className="absolute top-full left-1/2 -ml-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-black"></div>
                 )}
               </div>
             );
           })}
        </div>
      )}

      {/* Range Indicator */}
      {isCurrentUser && !entity.isDead && (
        <div 
          className="absolute rounded-full pointer-events-none opacity-20"
          style={{
            width: PROXIMITY_RADIUS * 2,
            height: PROXIMITY_RADIUS * 2,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px dashed white',
            imageRendering: 'pixelated'
          }}
        />
      )}
    </div>
  );
};

export default Avatar;