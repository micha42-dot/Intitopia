import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Entity, Position, Message, EnvironmentItem as EnvItemType } from '../types';
import { 
  WORLD_WIDTH, WORLD_HEIGHT, ENTITY_SIZE, COLORS, 
  MOVEMENT_SPEED, PROXIMITY_RADIUS, KILL_RADIUS, KILL_COOLDOWN,
  TREE_COUNT, GRASS_COUNT
} from '../constants';
import Avatar from './Avatar';
import EnvironmentItem from './EnvironmentItem';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface WorldProps {
  username: string;
}

// Typen für den lokalen Broadcast Channel
type BroadcastEvent = 
  | { type: 'UPDATE_PLAYER'; entity: Entity }
  | { type: 'PLAYER_DISCONNECT'; id: string }
  | { type: 'CHAT_MESSAGE'; id: string; msg: Message }
  | { type: 'PLAYER_KILLED'; targetId: string }
  | { type: 'REQUEST_STATE'; requesterId: string } 
  | { type: 'STATE_RESPONSE'; entities: Entity[] }; 

const getRandomPos = (): Position => ({
  x: Math.random() * (WORLD_WIDTH - 100) + 50,
  y: Math.random() * (WORLD_HEIGHT - 100) + 50
});

const getDistance = (p1: Position, p2: Position) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const World: React.FC<WorldProps> = ({ username }) => {
  // State
  const [myId, setMyId] = useState<string | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [environment, setEnvironment] = useState<EnvItemType[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  const [camera, setCamera] = useState<Position>({ x: 0, y: 0 });
  const [messageLog, setMessageLog] = useState<Message[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [statusMessage, setStatusMessage] = useState<string>("");
  
  // Refs
  const myEntityRef = useRef<Entity | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const lastSyncTime = useRef<number>(0);
  const isOfflineMode = useRef<boolean>(false);
  
  // Network Refs
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);
  const peerMap = useRef<Map<string, number>>(new Map()); // Track last heartbeat

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Generate Environment
    const initialEnv: EnvItemType[] = [];
    initialEnv.push({ id: 'mysterious-door', type: 'door', position: { x: WORLD_WIDTH - 250, y: 250 }, scale: 1.5, variant: 0 });
    for (let i = 0; i < TREE_COUNT; i++) {
        initialEnv.push({ id: `tree-${i}`, type: 'tree', position: getRandomPos(), scale: 0.8 + Math.random() * 0.4, variant: 0 });
    }
    for (let i = 0; i < GRASS_COUNT; i++) initialEnv.push({ id: `grass-${i}`, type: 'grass', position: getRandomPos(), scale: 1, variant: 0 });
    setEnvironment(initialEnv);

    // 2. Create Local Player
    const playerId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setMyId(playerId);

    const initialMe: Entity = {
        id: playerId,
        name: username || `Guest ${Math.floor(Math.random() * 100)}`,
        isPlayer: true,
        position: getRandomPos(),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        isKiller: Math.random() < 0.1,
        isDead: false
    };

    myEntityRef.current = initialMe;
    setEntities([initialMe]);

    // 3. Network Setup
    const configured = isSupabaseConfigured();

    if (!configured) {
        // --- LOCAL FALLBACK ---
        setStatusMessage("⚠ LOCAL SIMULATION (MULTI-TAB)");
        addLog("Supabase Config missing.", "System");
        addLog("Mode: Local Broadcast (Open 2 Tabs!)", "System");
        isOfflineMode.current = true;

        const channel = new BroadcastChannel('intitopia_local_net');
        broadcastChannelRef.current = channel;

        channel.postMessage({ type: 'REQUEST_STATE', requesterId: playerId });

        channel.onmessage = (event: MessageEvent<BroadcastEvent>) => {
            handleNetworkEvent(event.data, playerId);
        };

        return () => {
             channel.postMessage({ type: 'PLAYER_DISCONNECT', id: playerId });
             channel.close();
        };

    } else {
        // --- SUPABASE REALTIME SETUP ---
        setStatusMessage("CONNECTING TO SUPABASE...");
        addLog("Connecting to global room...", "System");

        const channel = supabase.channel('intitopia_global_room', {
            config: {
                broadcast: { self: false } // Don't receive my own messages
            }
        });

        supabaseChannelRef.current = channel;

        channel
            .on('broadcast', { event: 'game_event' }, (payload) => {
                handleNetworkEvent(payload.payload as BroadcastEvent, playerId);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setStatusMessage("ONLINE - SUPABASE LINKED");
                    addLog("Joined Global Room.", "System");
                    // Announce presence immediately
                    sendNetworkEvent({ type: 'REQUEST_STATE', requesterId: playerId });
                    sendNetworkEvent({ type: 'UPDATE_PLAYER', entity: initialMe });
                } else if (status === 'CHANNEL_ERROR') {
                    setStatusMessage("⚠ CONNECTION ERROR");
                }
            });

        return () => {
            sendNetworkEvent({ type: 'PLAYER_DISCONNECT', id: playerId });
            supabase.removeChannel(channel);
        };
    }
  }, []);

  // --- UNIFIED NETWORK HANDLER ---
  const handleNetworkEvent = (data: BroadcastEvent, myPlayerId: string) => {
      // Update peer timestamp to keep them alive
      if (data.type === 'UPDATE_PLAYER') {
          peerMap.current.set(data.entity.id, Date.now());
      }

      switch (data.type) {
          case 'UPDATE_PLAYER':
              setEntities(prev => {
                  const exists = prev.find(e => e.id === data.entity.id);
                  // Ensure remote players are marked as players (so they get the hero sprite, not the bot sprite)
                  const remoteEntity = { ...data.entity, isPlayer: true }; 
                  
                  if (exists) {
                      return prev.map(e => e.id === data.entity.id ? remoteEntity : e);
                  }
                  return [...prev, remoteEntity];
              });
              break;
          
          case 'PLAYER_DISCONNECT':
              setEntities(prev => prev.filter(e => e.id !== data.id));
              peerMap.current.delete(data.id);
              break;

          case 'REQUEST_STATE':
              // A new player joined and wants to know about us
              if (myEntityRef.current) {
                  sendNetworkEvent({ type: 'UPDATE_PLAYER', entity: myEntityRef.current });
              }
              break;

          case 'PLAYER_KILLED':
              if (data.targetId === myPlayerId) {
                  if (myEntityRef.current) myEntityRef.current.isDead = true;
                  setEntities(prev => prev.map(e => e.id === myPlayerId ? { ...e, isDead: true } : e));
                  addLog("You have been killed!", "System");
              } else {
                  setEntities(prev => prev.map(e => e.id === data.targetId ? { ...e, isDead: true } : e));
              }
              break;

          case 'CHAT_MESSAGE':
              setEntities(prev => prev.map(e => e.id === data.id ? { ...e, lastMessage: data.msg } : e));
              break;
      }
  };

  const sendNetworkEvent = (event: BroadcastEvent) => {
      if (isOfflineMode.current) {
          broadcastChannelRef.current?.postMessage(event);
      } else {
          supabaseChannelRef.current?.send({
              type: 'broadcast',
              event: 'game_event',
              payload: event
          });
      }
  };

  // --- CLEANUP INACTIVE PLAYERS ---
  useEffect(() => {
      const cleanupInterval = setInterval(() => {
          const now = Date.now();
          setEntities(prev => {
              return prev.filter(e => {
                  if (e.id === myId) return true; // Keep self
                  const lastSeen = peerMap.current.get(e.id);
                  // Remove players not seen for 10 seconds (Supabase broadcast doesn't have auto-leave for broadcast-only)
                  if (!lastSeen || now - lastSeen > 10000) {
                      return false; 
                  }
                  return true;
              });
          });
      }, 5000);
      return () => clearInterval(cleanupInterval);
  }, [myId]);

  // --- HEARTBEAT ---
  useEffect(() => {
      // Send full state periodically to ensure consistency for new joiners
      const heartbeat = setInterval(() => {
          if (myEntityRef.current) {
              sendNetworkEvent({ type: 'UPDATE_PLAYER', entity: myEntityRef.current });
          }
      }, 2000); 
      return () => clearInterval(heartbeat);
  }, []);

  // --- TIMER ---
  useEffect(() => {
      const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
      return () => clearInterval(timer);
  }, []);

  // --- INPUT ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      keysPressed.current.add(e.code);
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- LOOP ---
  const update = useCallback((time: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = time;
    lastTimeRef.current = time;

    if (myId && myEntityRef.current && !myEntityRef.current.isDead) {
        const keys = keysPressed.current;
        let dx = 0;
        let dy = 0;
        if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= MOVEMENT_SPEED;
        if (keys.has('ArrowDown') || keys.has('KeyS')) dy += MOVEMENT_SPEED;
        if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= MOVEMENT_SPEED;
        if (keys.has('ArrowRight') || keys.has('KeyD')) dx += MOVEMENT_SPEED;

        if (dx !== 0 || dy !== 0) {
            const oldPos = myEntityRef.current.position;
            const newPos = {
                x: Math.max(ENTITY_SIZE, Math.min(WORLD_WIDTH - ENTITY_SIZE, oldPos.x + dx)),
                y: Math.max(ENTITY_SIZE, Math.min(WORLD_HEIGHT - ENTITY_SIZE, oldPos.y + dy))
            };
            
            myEntityRef.current.position = newPos;

            // Local Update
            setEntities(prev => prev.map(e => e.id === myId ? { ...e, position: newPos } : e));

            // Network Update (Throttled)
            const throttleLimit = isOfflineMode.current ? 33 : 50; // 50ms = 20 ticks/sec for online
            if (Date.now() - lastSyncTime.current > throttleLimit) {
                sendNetworkEvent({ type: 'UPDATE_PLAYER', entity: myEntityRef.current });
                lastSyncTime.current = Date.now();
            }
        }
    }

    if (myEntityRef.current) {
        setCamera({
            x: myEntityRef.current.position.x - (window.innerWidth - 320) / 2, 
            y: myEntityRef.current.position.y - window.innerHeight / 2
        });
    }
    requestRef.current = requestAnimationFrame(update);
  }, [myId]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  // --- UI HELPERS ---
  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [messageLog]);

  const addLog = (text: string, sender: string = "System") => {
    setMessageLog(prev => [...prev.slice(-49), { id: Date.now().toString() + Math.random(), text, senderId: sender, timestamp: Date.now() }]);
  };

  const handlePlayerKill = () => {
      if (!myId || !myEntityRef.current || !myEntityRef.current.isKiller || myEntityRef.current.isDead) return;
      if (myEntityRef.current.lastKillTime && (Date.now() - myEntityRef.current.lastKillTime < KILL_COOLDOWN)) return;

      let nearestDist = KILL_RADIUS;
      let victimId: string | null = null;
      let victimName = "";

      entities.forEach(ent => {
          if (ent.id !== myId && !ent.isDead) {
              const d = getDistance(myEntityRef.current!.position, ent.position);
              if (d < nearestDist) {
                  nearestDist = d;
                  victimId = ent.id;
                  victimName = ent.name;
              }
          }
      });

      if (victimId) {
          // Send Kill Event
          sendNetworkEvent({ type: 'PLAYER_KILLED', targetId: victimId! });
          
          // Local update immediately (optimistic UI)
          setEntities(prev => prev.map(e => e.id === victimId ? { ...e, isDead: true } : e));
          
          if (myEntityRef.current) myEntityRef.current.lastKillTime = Date.now();
          addLog(`You eliminated ${victimName}.`, "Combat");
      } else {
          addLog("No valid target in range!", "Combat");
      }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim() || !myId) return;
    if (myEntityRef.current?.isDead) return;

    const text = playerInput.trim();
    setPlayerInput('');
    const msg: Message = { id: Date.now().toString(), text, senderId: myId, timestamp: Date.now() };

    // Update local immediately
    setEntities(prev => prev.map(e => e.id === myId ? { ...e, lastMessage: msg } : e));
    addLog(`"${text}"`, "Me");

    // Send my message
    sendNetworkEvent({ type: 'CHAT_MESSAGE', id: myId, msg });
  };

  const player = entities.find(e => e.id === myId) || myEntityRef.current;

  let killCooldownRemaining = 0;
  if (player?.isKiller && player.lastKillTime) {
      killCooldownRemaining = Math.max(0, KILL_COOLDOWN - (currentTime - player.lastKillTime));
  }
  const cooldownSecs = Math.ceil(killCooldownRemaining / 1000);
  const cooldownStr = `${Math.floor(cooldownSecs / 60)}:${(cooldownSecs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex w-full h-full bg-[#c0c0c0] win31-text select-none overflow-hidden">
      
      {/* Game View */}
      <div className="flex-1 relative win31-border-inset bg-black overflow-hidden cursor-crosshair m-2 mr-0">
          <div 
              className="absolute origin-top-left will-change-transform"
              style={{
                  width: WORLD_WIDTH,
                  height: WORLD_HEIGHT,
                  transform: `translate(${-camera.x}px, ${-camera.y}px)`,
                  backgroundColor: '#509b2e', 
                  backgroundImage: `linear-gradient(#468a28 1px, transparent 1px), linear-gradient(90deg, #468a28 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
              }}
          >
              {environment.map(item => <EnvironmentItem key={item.id} item={item} />)}
              {entities.map(entity => (
                  <Avatar 
                      key={entity.id} 
                      entity={entity} 
                      isCurrentUser={entity.id === myId}
                      isInRange={player ? getDistance(player.position, entity.position) <= PROXIMITY_RADIUS : false}
                  />
              ))}
          </div>
          
          <div className={`absolute top-2 left-2 px-1 border border-black text-xs font-bold pointer-events-none ${statusMessage.includes("LOCAL") ? 'bg-yellow-300 text-black' : (statusMessage.includes("ERROR") ? 'bg-red-500 text-white animate-pulse' : 'bg-white/80')}`}>
             {statusMessage || "MULTIPLAYER LIVE"}
          </div>
          
          {player?.isDead && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-red-900 text-white p-4 border-4 border-white win31-border-outset animate-pulse flex flex-col items-center">
                      <h1 className="text-4xl font-bold mb-4">YOU ARE DEAD</h1>
                      <button onClick={() => window.location.reload()} className="win31-btn px-4 py-2 text-black font-bold border border-white">
                          REJOIN
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-3 p-2">
          <div className="win31-border-inset bg-white p-2 font-mono text-sm">
              <div className="bg-[#000080] text-white px-1 mb-2 font-bold text-center">CHARACTER</div>
              <div className="grid grid-cols-2 gap-x-2">
                  <span>NAME:</span> <span className="text-right font-bold">{player?.name || 'Loading...'}</span>
                  <span>STATUS:</span> <span className={`text-right font-bold ${player?.isDead ? 'text-red-600' : 'text-green-600'}`}>{player?.isDead ? 'DEAD' : 'ALIVE'}</span>
                  <span>ROLE:</span> <span className="text-right">{player?.isKiller ? 'KILLER' : 'CITIZEN'}</span>
                  <span>ONLINE:</span> <span className="text-right">{entities.filter(e => !e.isDead).length}</span>
              </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 relative">
             <div className="bg-[#000080] text-white px-1 font-bold text-center mb-1">MESSAGES</div>
             <div ref={logContainerRef} className="flex-1 win31-border-inset bg-white overflow-y-scroll p-2 font-mono text-sm leading-snug">
                {messageLog.length === 0 && <span className="text-gray-400 italic">Connected...</span>}
                {messageLog.map(msg => (
                    <div key={msg.id} className="mb-1">
                        <span className={`font-bold ${msg.senderId === 'System' ? 'text-gray-500' : (msg.senderId === 'Combat' ? 'text-red-600' : 'text-blue-800')}`}>
                            {msg.senderId}:
                        </span> 
                        <span className="ml-1 text-black">{msg.text}</span>
                    </div>
                ))}
             </div>
          </div>

          {player?.isKiller && !player.isDead && (
              <div className="flex flex-col gap-1">
                  <button 
                    onClick={handlePlayerKill}
                    disabled={killCooldownRemaining > 0}
                    className={`win31-btn py-4 font-bold border-2 text-xl ${killCooldownRemaining > 0 ? 'bg-gray-400 text-gray-600 border-gray-500 cursor-not-allowed' : 'bg-red-100 text-red-900 border-red-800 active:bg-red-200'}`}
                  >
                      {killCooldownRemaining > 0 ? (
                          <div className="flex flex-col items-center"><span className="text-sm">COOLDOWN</span><span>{cooldownStr}</span></div>
                      ) : "⚠ KILL TARGET ⚠"}
                  </button>
                  {killCooldownRemaining > 0 && (
                      <div className="w-full h-2 bg-gray-300 border border-gray-500 relative">
                          <div className="h-full bg-red-600 transition-all duration-1000 linear" style={{ width: `${((KILL_COOLDOWN - killCooldownRemaining) / KILL_COOLDOWN) * 100}%` }} />
                      </div>
                  )}
              </div>
          )}

          <div className="win31-border-outset p-2 bg-[#c0c0c0]">
             <form onSubmit={handleChatSubmit} className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase">Chat Input:</label>
                <input 
                    type="text" 
                    className="w-full win31-border-inset px-2 py-1 focus:outline-none font-mono text-sm"
                    value={playerInput}
                    onChange={e => setPlayerInput(e.target.value)}
                    placeholder="..."
                    autoFocus
                    maxLength={100}
                    disabled={player?.isDead}
                />
                <button type="submit" disabled={player?.isDead} className="win31-btn py-1 font-bold active:translate-y-[1px] border border-black disabled:opacity-50">SEND</button>
             </form>
          </div>
          <div className="text-[10px] text-center text-gray-600 font-mono">Intitopia Multiplayer v1.6 (Colors)<br/>(c) 2024</div>
      </div>
    </div>
  );
};

export default World;