export interface Position {
  x: number;
  y: number;
}

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  senderId: string;
}

export interface Entity {
  id: string;
  name: string;
  isPlayer: boolean;
  position: Position;
  color: string;
  lastMessage?: Message;
  targetPosition?: Position; 
  isKiller?: boolean;
  isDead?: boolean;
  lastKillTime?: number; // Timestamp of last kill
}

export interface EnvironmentItem {
  id: string;
  type: 'tree' | 'grass' | 'house' | 'door';
  position: Position;
  scale: number;
  variant: number; 
}

export interface GameState {
  entities: Entity[];
  lastUpdated: number;
}