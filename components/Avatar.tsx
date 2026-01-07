import React from 'react';
import { Entity } from '../types';
import { ENTITY_SIZE, MESSAGE_LIFETIME, PROXIMITY_RADIUS } from '../constants';

interface AvatarProps {
  entity: Entity;
  isCurrentUser: boolean;
  isInRange: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ entity, isCurrentUser, isInRange }) => {
  const showMessage = entity.lastMessage && (Date.now() - entity.lastMessage.timestamp < MESSAGE_LIFETIME);
  
  // Visibility logic
  const displayStyle = isCurrentUser ? 1 : (isInRange ? 1 : 0.3);

  return (
    <div
      className="absolute flex flex-col items-center justify-center transition-transform duration-100 linear"
      style={{
        left: entity.position.x,
        top: entity.position.y,
        width: ENTITY_SIZE,
        height: ENTITY_SIZE,
        opacity: displayStyle,
        zIndex: isCurrentUser ? 50 : (entity.isDead ? 5 : 20), // Dead bodies at bottom
        transform: `translate(-50%, -50%)`
      }}
    >
      {/* Sprite Container */}
      <div 
        className="w-8 h-8 relative"
        style={{
           imageRendering: 'pixelated'
        }}
      >
        {entity.isDead ? (
            // Dead Sprite: Gravestone
            <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
                <path d="M6 30 L26 30 L26 12 Q16 0 6 12 Z" fill="#78716c" stroke="black" strokeWidth="1"/>
                <text x="16" y="18" textAnchor="middle" fill="black" fontSize="8" fontFamily="monospace">RIP</text>
            </svg>
        ) : (
            <>
                {/* Character Sprite */}
                {entity.isPlayer ? (
                    // Player: Hero Sprite
                    <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
                    <rect x="10" y="4" width="12" height="10" fill="#fca5a5" /> 
                    <rect x="8" y="2" width="16" height="4" fill="#555" /> 
                    <rect x="6" y="14" width="20" height="14" fill="#2563eb" /> 
                    <rect x="2" y="14" width="4" height="10" fill="#999" /> 
                    <rect x="26" y="14" width="4" height="10" fill="#999" />
                    </svg>
                ) : (
                    // Bot: Monster/NPC Sprite
                    <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
                    <rect x="8" y="6" width="16" height="20" fill={entity.color} />
                    <rect x="10" y="8" width="4" height="4" fill="white" /> 
                    <rect x="18" y="8" width="4" height="4" fill="white" /> 
                    <rect x="12" y="10" width="2" height="2" fill="black" /> 
                    <rect x="20" y="10" width="2" height="2" fill="black" /> 
                    <rect x="10" y="20" width="12" height="2" fill="black" /> 
                    </svg>
                )}
            </>
        )}
      </div>

      {/* Name Tag */}
      <div 
        className={`absolute -top-4 whitespace-nowrap px-1 text-[10px] font-bold ${isCurrentUser ? 'text-yellow-300 bg-blue-900' : 'text-black bg-white/80'}`}
        style={{ fontFamily: '"Pixelify Sans", sans-serif', opacity: entity.isDead ? 0.5 : 1 }}
      >
        {entity.name}
      </div>

      {/* Chat Bubble */}
      {showMessage && !entity.isDead && (
        <div className="absolute bottom-full mb-1 w-40 z-50 pointer-events-none">
           <div className="bg-white border border-black p-1 text-center text-xs text-black shadow-lg">
             {entity.lastMessage?.text}
           </div>
        </div>
      )}

      {/* Range Indicator (Only for player) */}
      {isCurrentUser && !entity.isDead && (
        <div 
          className="absolute border border-white/30 rounded-full pointer-events-none"
          style={{
            width: PROXIMITY_RADIUS * 2,
            height: PROXIMITY_RADIUS * 2,
            transform: 'translate(0%, 0%)',
            top: '50%',
            left: '50%',
            marginTop: -PROXIMITY_RADIUS,
            marginLeft: -PROXIMITY_RADIUS
          }}
        />
      )}
    </div>
  );
};

export default Avatar;