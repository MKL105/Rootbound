// ── state.ts ───────────────────────────────────────────────────────────────
// This files contains the game state and acts as single source of truth.
// This also means that seasons, completion logic and saving and loading logic
// is handled here.
// ───────────────────────────────────────────────────────────────────────────

import type { DropTier } from "../data/drops";
import type { GameState, LogCategory } from "../data/types";

// ── Log ────────────────────────────────────────────────────────────────────
export function addLog(state: GameState, text: string, category: LogCategory = 'general'): void {
  state.log.unshift({ ts: Date.now()/1000, text, category });
  if (state.log.length > 200) state.log = state.log.slice(0,200);
}

// ── Default state ───────────────────────────────────────────────────────────
export function defaultState(): GameState {
  return {
    version:1, createdAt:Date.now()/1000, playedSeconds:0,
    skills: Object.fromEntries(SKILL_NAMES.map(n=>[n,0])),
    queue:[], active:null, inventory:{}, gold:0, buffs:[], companions:[],
    seasonIndex:0, seasonStartedAt:Date.now()/1000,
    completion:{actionMastery:[],itemCollection:[],rareDrops:[],combatKills:{},worldMilestones:[]},
    log:[], ownedUtilities:[], queueLimit:10,
  };
}

// ── Persistence ─────────────────────────────────────────────────────────────
const SAVE_KEY = 'rootbound_v1';
export function saveGame(state: GameState): void {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}
export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch {}
  return defaultState();
}

// ── Skills ─────────────────────────────────────────────────────────────────

export const SKILL_NAMES = [
  'foraging', 'woodcutting', 'fishing', 'stargazing',
  'herbalism', 'cultivation', 'woodcarving', 'cooking',
  'brewing', 'weaving', 'runecrafting', 'beastmastery',
  'alchemy', 'ritualism', 'combat',
] as const;

export type SkillName = typeof SKILL_NAMES[number];

export const SKILL_LABELS: Record<string, string> = {
  foraging: 'Foraging', woodcutting: 'Woodcutting', fishing: 'Fishing',
  stargazing: 'Stargazing', herbalism: 'Herbalism', cultivation: 'Cultivation',
  woodcarving: 'Woodcarving', cooking: 'Cooking', brewing: 'Brewing',
  weaving: 'Weaving', runecrafting: 'Runecrafting', beastmastery: 'Beastmastery',
  alchemy: 'Alchemy', ritualism: 'Ritualism', combat: 'Combat',
};

// ── Seasons ────────────────────────────────────────────────────────────────
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = typeof SEASONS[number];

export const SEASON_EMOJIS: Record<Season, string> = {
  spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️',
};
export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter',
};
export const SEASON_DURATION = 60 * 60 * 24 * 3; // 3 real days

export const SEASON_BONUSES: Record<Season, Record<string, number>> = {
  spring: { fishing: +15, cultivation: +10, stargazing: -10 },
  summer: { foraging: +20, cooking: +10 },
  autumn: { woodcutting: +15, brewing: +15, fishing: -10 },
  winter: { stargazing: +25, ritualism: +10, cultivation: -20 },
};

export const SEASON_EXCLUSIVES: Record<Season, string[]> = {
  spring: ['catch_crayfish (Fishing 20)', 'collect_dewdrops (Foraging 40)', 'cook_crayfish_feast (Cooking 32)'],
  summer: ['collect_dewdrops (Foraging 40)', 'fast herb growth (Cultivation)'],
  autumn: ['gather_autumn_berries (Foraging 25)', 'harvest_witchwood (Woodcutting 50)', 'gather_thornroot (Foraging 45)', 'brew_autumn_tonic (Brewing 45)'],
  winter: ['ice_fish (Fishing 35)', 'read_the_aurora (Stargazing 35)', 'gather_moonbloom (Foraging 35)', 'chop_moonwood (Woodcutting 72)', 'prepare_winter_stew (Cooking 48)'],
};

// ── Season helpers ──────────────────────────────────────────────────────────
export function getSeason(state: GameState): Season {
  return SEASONS[state.seasonIndex % SEASONS.length];
}

export function seasonTimeRemaining(state: GameState): number {
  const elapsed = Date.now() / 1000 - state.seasonStartedAt; //TODO: magic numbers
  return Math.max(0, SEASON_DURATION - elapsed);
}

export function tickSeasons(state: GameState): void {
  if (seasonTimeRemaining(state) <= 0) {
    state.seasonIndex = (state.seasonIndex + 1) % SEASONS.length;
    state.seasonStartedAt = Date.now() / 1000; //TODO: magic numbers
  }
}

// ── XP formula ──────────────────────────────────────────────────────────────
export function xpForLevel(n: number): number {
  return Math.floor(80 * n * Math.pow(1.09, n)); //TODO: magic numbers
}

export function levelFromXp(xp: number): [number, number, number] { //TODO: what does it do?
  let level = 0, cumulative = 0;
  while (level < 100) { //TODO: magic numbers
    const needed = xpForLevel(level + 1);
    if (cumulative + needed > xp) return [level, xp - cumulative, needed];
    cumulative += needed;
    level++;
  }
  return [100, 0, 0]; //TODO: magic numbers
}

export function getSkillLevel(state: GameState, skill: string): [number, number, number] { //TODO: what does it do?
  return levelFromXp(state.skills[skill] ?? 0);
}

// ── Completion ──────────────────────────────────────────────────────────────
export const COMPLETION_WEIGHTS = {
  skillLevels: 0.40, actionMastery: 0.20, itemCollection: 0.15,
  rareDrops: 0.10, combat: 0.10, worldMilestones: 0.05,
};

export const COMPLETION_TOTALS = {
  skillLevels: 1500, actionMastery: 172, itemCollection: 120,
  rareDrops: 40, combat: 26, worldMilestones: 20,
};

export const COMPLETION_TITLES: [number, string][] = [
  [0, 'Seedling'], [10, 'Apprentice Druid'], [25, 'Grove Keeper'],
  [50, 'Forest Warden'], [75, 'Elder Druid'], [90, 'Archdruid'], [100, 'The Awakened'],
];

export function getCompletionPct(state: GameState): number {
  const c = state.completion;
  const sp = SKILL_NAMES.reduce((a, s) => a + getSkillLevel(state, s)[0], 0);
  const score =
    (sp / COMPLETION_TOTALS.skillLevels) * COMPLETION_WEIGHTS.skillLevels +
    (c.actionMastery.length / COMPLETION_TOTALS.actionMastery) * COMPLETION_WEIGHTS.actionMastery +
    (c.itemCollection.length / COMPLETION_TOTALS.itemCollection) * COMPLETION_WEIGHTS.itemCollection +
    (c.rareDrops.length / COMPLETION_TOTALS.rareDrops) * COMPLETION_WEIGHTS.rareDrops +
    (Object.values(c.combatKills).reduce((a, v) => a + Math.min(v, 2), 0) / COMPLETION_TOTALS.combat) * COMPLETION_WEIGHTS.combat +
    (c.worldMilestones.length / COMPLETION_TOTALS.worldMilestones) * COMPLETION_WEIGHTS.worldMilestones;
  return Math.round(score * 1000) / 10;
}

export function getCompletionBreakdown(state: GameState) {
  const c = state.completion;
  const sp = SKILL_NAMES.reduce((a, s) => a + getSkillLevel(state, s)[0], 0);
  return {
    skillLevels: [sp, COMPLETION_TOTALS.skillLevels],
    actionMastery: [c.actionMastery.length, COMPLETION_TOTALS.actionMastery],
    itemCollection: [c.itemCollection.length, COMPLETION_TOTALS.itemCollection],
    rareDrops: [c.rareDrops.length, COMPLETION_TOTALS.rareDrops],
    combat: [Object.values(c.combatKills).reduce((a, v) => a + Math.min(v, 2), 0), COMPLETION_TOTALS.combat],
    worldMilestones: [c.worldMilestones.length, COMPLETION_TOTALS.worldMilestones],
  } as Record<string, [number, number]>;
}

export function completionTitle(pct: number): string {
  let t = COMPLETION_TITLES[0][1];
  for (const [th, n] of COMPLETION_TITLES) if (pct >= th) t = n;
  return t;
}

// ── Legendary set definitions ───────────────────────────────────────────────
export const LEGENDARY_SETS: Record<string, { label: string; pieces: string[]; reward: string; milestoneId: string }> = {
  druids_awakening: {
    label: "Druid's Awakening",
    pieces: ['druids_awakening_piece'], // all 5 tracked as same item ID (qty-based)
    reward: 'All seasonal bonuses apply simultaneously, permanently.',
    milestoneId: 'set1_complete',
  },
  leviathans_pact: {
    label: "Leviathan's Pact",
    pieces: ['leviathan_scale', 'pearl_of_the_deep', 'ancient_fishing_hook', 'world_constellation_piece', 'navigators_eye'],
    reward: 'All companions generate double passive resources.',
    milestoneId: 'set2_complete',
  },
};

// ── Trackable rare drops (for completion screen display) ────────────────────
export interface TrackableDropDef {
  id: string;
  label: string;
  skill: string;
  tier: DropTier;
}

export const TRACKABLE_DROP_LIST: TrackableDropDef[] = [
  // Foraging
  { id: 'ancient_bark', label: 'Ancient Bark', skill: 'foraging', tier: 'rare' },
  { id: 'moonbloom_petals', label: 'Moonbloom Petals', skill: 'foraging', tier: 'rare' },
  { id: 'pure_dewdrops', label: 'Pure Dewdrops', skill: 'foraging', tier: 'rare' },
  { id: 'heartroot', label: 'Heartroot', skill: 'foraging', tier: 'very_rare' },
  { id: 'glowcap_fungi', label: 'Glowcap Fungi', skill: 'foraging', tier: 'legendary' },
  { id: 'wanderers_compass', label: "Wanderer's Compass", skill: 'foraging', tier: 'legendary' },
  { id: 'living_root', label: 'Living Root', skill: 'foraging', tier: 'mythic' },
  // Woodcutting
  { id: 'ancient_logs', label: 'Ancient Logs', skill: 'woodcutting', tier: 'rare' },
  { id: 'witchwood_logs', label: 'Witchwood Logs', skill: 'woodcutting', tier: 'rare' },
  { id: 'moonwood_logs', label: 'Moonwood Logs', skill: 'woodcutting', tier: 'very_rare' },
  { id: 'rootwood', label: 'Rootwood', skill: 'woodcutting', tier: 'very_rare' },
  { id: 'twisted_branch', label: 'Twisted Branch', skill: 'woodcutting', tier: 'legendary' },
  { id: 'heartwood_core', label: 'Heartwood Core', skill: 'woodcutting', tier: 'mythic' },
  // Fishing
  { id: 'frost_pearls', label: 'Frost Pearls', skill: 'fishing', tier: 'rare' },
  { id: 'river_relics', label: 'River Relics', skill: 'fishing', tier: 'rare' },
  { id: 'shimmereel', label: 'Shimmereel', skill: 'fishing', tier: 'very_rare' },
  { id: 'spiritfish', label: 'Spiritfish', skill: 'fishing', tier: 'very_rare' },
  { id: 'ancient_fishing_hook', label: 'Ancient Fishing Hook', skill: 'fishing', tier: 'legendary' },
  { id: 'pearl_of_the_deep', label: 'Pearl of the Deep', skill: 'fishing', tier: 'legendary' },
  { id: 'leviathan_scale', label: 'Leviathan Scale', skill: 'fishing', tier: 'mythic' },
  // Stargazing
  { id: 'aurora_shards', label: 'Aurora Shards', skill: 'stargazing', tier: 'rare' },
  { id: 'void_fragments', label: 'Void Fragments', skill: 'stargazing', tier: 'very_rare' },
  { id: 'ley_resonance', label: 'Ley Resonance', skill: 'stargazing', tier: 'rare' },
  { id: 'navigators_eye', label: "Navigator's Eye", skill: 'stargazing', tier: 'legendary' },
  { id: 'world_constellation_piece', label: 'World Constellation Piece', skill: 'stargazing', tier: 'mythic' },
  // Herbalism
  { id: 'moonbloom_essence', label: 'Moonbloom Essence', skill: 'herbalism', tier: 'rare' },
  { id: 'glowcap_spores', label: 'Glowcap Spores', skill: 'herbalism', tier: 'rare' },
  { id: 'dew_crystals', label: 'Dew Crystals', skill: 'herbalism', tier: 'rare' },
  { id: 'starfern_extract', label: 'Starfern Extract', skill: 'herbalism', tier: 'rare' },
  { id: 'heartroot_oil', label: 'Heartroot Oil', skill: 'herbalism', tier: 'legendary' },
  { id: 'druids_awakening_piece', label: "Druid's Awakening Piece", skill: 'herbalism', tier: 'mythic' },
  // Cultivation
  { id: 'rootbloom', label: 'Rootbloom', skill: 'cultivation', tier: 'very_rare' },
  { id: 'spirit_herbs', label: 'Spirit Herbs', skill: 'cultivation', tier: 'rare' },
  // Woodcarving
  { id: 'witchwood_staff', label: 'Witchwood Staff', skill: 'woodcarving', tier: 'very_rare' },
  { id: 'moonwood_bow', label: 'Moonwood Bow', skill: 'woodcarving', tier: 'very_rare' },
  { id: 'world_stave', label: 'World-Stave', skill: 'woodcarving', tier: 'legendary' },
  // Cooking / Brewing
  { id: 'forest_feast', label: 'Forest Feast', skill: 'cooking', tier: 'very_rare' },
  { id: 'great_meal', label: 'Great Meal', skill: 'cooking', tier: 'legendary' },
  { id: 'eternal_draught', label: 'Eternal Draught', skill: 'brewing', tier: 'legendary' },
  { id: 'blood_moon_brew', label: 'Blood Moon Brew', skill: 'brewing', tier: 'very_rare' },
  // Combat
  { id: 'ancient_warriors_shard', label: "Ancient Warrior's Shard", skill: 'combat', tier: 'legendary' },
  { id: 'void_blade_fragment', label: 'Void Blade Fragment', skill: 'combat', tier: 'mythic' },
];

// ── World milestone definitions ─────────────────────────────────────────────
export interface MilestoneDef {
  id: string;
  label: string;
  desc: string;
  category: 'season' | 'event' | 'shop' | 'legendary' | 'endgame';
}

export const WORLD_MILESTONES: MilestoneDef[] = [
  { id: 'season_spring', label: 'Spring Experienced', desc: 'Play through one full Spring season', category: 'season' },
  { id: 'season_summer', label: 'Summer Experienced', desc: 'Play through one full Summer season', category: 'season' },
  { id: 'season_autumn', label: 'Autumn Experienced', desc: 'Play through one full Autumn season', category: 'season' },
  { id: 'season_winter', label: 'Winter Experienced', desc: 'Play through one full Winter season', category: 'season' },
  { id: 'event_blood_moon', label: 'Blood Moon Witnessed', desc: 'Complete observe_blood_moon during a Blood Moon event', category: 'event' },
  { id: 'event_solstice', label: 'Solstice Rite Performed', desc: 'Complete perform_solstice_rite', category: 'event' },
  { id: 'shop_first', label: 'First Shop Purchase', desc: 'Buy any item from the Verdant Exchange', category: 'shop' },
  { id: 'shop_all_utility', label: 'All Utility Purchased', desc: 'Own every permanent utility upgrade', category: 'shop' },
  { id: 'shop_moonlit_vault', label: "Moonlit Vault Opened", desc: 'Open a Moonlit Vault lootbox', category: 'shop' },
  { id: 'set1_piece', label: "Druid's Awakening — Piece", desc: "Obtain any piece of the Druid's Awakening legendary set", category: 'legendary' },
  { id: 'set1_complete', label: "Druid's Awakening — Complete", desc: "Complete the full Druid's Awakening set (5 pieces)", category: 'legendary' },
  { id: 'set2_piece', label: "Leviathan's Pact — Piece", desc: "Obtain any piece of the Leviathan's Pact legendary set", category: 'legendary' },
  { id: 'set2_complete', label: "Leviathan's Pact — Complete", desc: "Complete the full Leviathan's Pact set (5 pieces)", category: 'legendary' },
  { id: 'both_sets', label: 'Both Sets Completed', desc: 'Complete both legendary sets simultaneously', category: 'legendary' },
  { id: 'companion_first', label: 'First Companion Bonded', desc: 'Complete any Beastmastery companion bonding action', category: 'endgame' },
  { id: 'companion_all', label: 'All Companions Bonded', desc: 'Bond with all 11 Beastmastery companions', category: 'endgame' },
  { id: 'first_rite', label: 'The First Rite Performed', desc: 'Complete the_first_rite (Ritualism 98)', category: 'endgame' },
  { id: 'the_awakening', label: 'The Awakening Triggered', desc: 'Reach the endgame unlock state via the First Rite', category: 'endgame' },
  { id: 'face_world_tree', label: 'World Tree Faced', desc: 'Complete face_corrupted_world_tree (Combat 95)', category: 'endgame' },
  { id: 'true_completion', label: 'True Completion', desc: 'Reach 100% in all other completion categories', category: 'endgame' },
];