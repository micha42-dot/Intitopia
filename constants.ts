
export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 2000;
export const VIEWPORT_WIDTH = window.innerWidth;
export const VIEWPORT_HEIGHT = window.innerHeight;

export const ENTITY_SIZE = 40; // pixels
export const MOVEMENT_SPEED = 2.5; // pixels per tick (Reduced from 5)
export const PROXIMITY_RADIUS = 250; // pixels to hear chat
export const MESSAGE_LIFETIME = 6000; // ms
export const KILL_RADIUS = 60; // Range for kill action
export const KILL_COOLDOWN = 120 * 1000; // 2 minutes in ms

// Magic Door Event Constants
export const MAGIC_PLAYER_THRESHOLD = 10; // Players needed
export const MAGIC_TIME_REQUIRED = 60 * 60 * 1000; // 1 Hour in ms
// For testing purposes, you might want to lower this locally, e.g.: 10 * 1000

export const TREE_COUNT = 50;
export const GRASS_COUNT = 150;

export const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e"
];

export const MAGIC_QUOTES = [
  "The veil thins...",
  "Intitopia awakens.",
  "Reality is buffering...",
  "The ancients are watching.",
  "Connection established.",
  "Awaiting input...",
  "Pixels tremble.",
  "The door hums."
];
