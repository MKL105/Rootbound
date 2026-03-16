// src/types.ts

export interface SkillAction {
  name: string;
  label: string;
  duration: number;        // seconds
  xp: number;
  requires: Array<{ skill: string; level: number }>;
  season?: string;
  output: Array<{ item: string; qtyMin: number; qtyMax: number }>;
}

export interface SkillDef {
  label: string;
  tier: number;
  description: string;
  actions: SkillAction[];
}

export interface QueueEntry {
  skill: string;
  action: string;
  qty: number;   // 0 = infinite
}

export interface ActiveAction {
  skill: string;
  action: string;
  qtyTotal: number;
  qtyDone: number;
  startedAt: number;   // unix seconds
  duration: number;
  xpPer: number;
  output: Array<{ item: string; qtyMin: number; qtyMax: number }>;
}

export interface Buff {
  name: string;
  effect: string;
  expiresAt: number;   // unix seconds
}

export interface Companion {
  name: string;
  bonus: string;
}

export type LogCategory = 'general' | 'level_up' | 'rare_drop' | 'combat';

export interface LogEntry {
  ts: number;
  text: string;
  category: LogCategory;
}

export interface CompletionData {
  actionMastery:   string[];
  itemCollection:  string[];
  rareDrops:       string[];
  combatKills:     Record<string, number>;
  worldMilestones: string[];
}

export interface GameState {
  version:         number;
  createdAt:       number;   // unix seconds
  playedSeconds:   number;
  skills:          Record<string, number>;   // skill → total XP
  queue:           QueueEntry[];
  active:          ActiveAction | null;
  inventory:       Record<string, number>;
  gold:            number;
  buffs:           Buff[];
  companions:      Companion[];
  seasonIndex:     number;
  seasonStartedAt: number;
  completion:      CompletionData;
  log:             LogEntry[];
  ownedUtilities:  string[];
  queueLimit:      number;
}

export interface NavState {
  current:     string;
  history:     string[];
  skillDetail: string | null;
  helpTopic:   string | null;
  invFilter:   string | null;   // skill name, 'rare', or null for all
  actionDetail: { skill: string; action: string } | null;
  lootReveal:  Array<{ item: string; qty: number; tier: string }> | null;
  logFilter:   string | null;
  logN:        number;
}

export interface CommandResult {
  ok:       boolean;
  message:  string;
  redirect?: string;
}
