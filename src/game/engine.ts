// ── engine.ts ──────────────────────────────────────────────────────────────
// This files is responsible for the game ticks, queueing and dequeueing
// logic, XP awards and item drops.
// ───────────────────────────────────────────────────────────────────────────

import type { ActiveAction, GameState } from "../data/types";
import { addLog, getSeason, levelFromXp, SEASONS, SEASON_BONUSES, SKILL_LABELS, tickSeasons, WORLD_MILESTONES } from "./state";
import { findAction } from "../data/skills";
import { type DropTier, openLootbox, RARE_TIERS, rollDrops, TRACKABLE_DROPS } from "../data/drops";

// ── BUFFS ──────────────────────────────────────────────────────────────────
interface BuffEffect {
  allXpPct?:   number;           // % bonus to all skill XP
  skillXpPct?: Record<string, number>; // % bonus to specific skills
  gatherXpPct?: number;          // % bonus to tier-1 gathering skills
  speedPct?:   number;           // % reduction in action duration (positive = faster)
  dropMult?:   number;           // multiplier on drop chances
}

// Keyed by buff name (must match what's pushed into state.buffs)
const BUFF_EFFECTS: Record<string, BuffEffect> = { //TODO: magic numbers?
  // Shop boosts
  "Wanderer's Focus":  { allXpPct: 10 },
  "Swift Hands":       { speedPct: 15 },
  "Forest's Favour":   { dropMult: 2 },
  // Season's Blessing is handled separately (doubles SEASON_BONUSES values)

  // Ritual buffs
  'Blessing Rite':     { allXpPct: 2 },
  'Growth Moon':       { skillXpPct: { cultivation: 10 } },
  'River Rite':        { skillXpPct: { fishing: 10 } },
  'Autumn Rite':       { skillXpPct: { foraging: 15 } },
  'Storm Invocation':  { skillXpPct: { runecrafting: 12 } },
  'Ancestor Commune':  { allXpPct: 5 },
  'Solstice Rite':     { allXpPct: 15 },
  "Moon's Embrace":    { skillXpPct: { brewing: 15 } },
  'Blood Rite':        { skillXpPct: { combat: 20 } },
  'Ancient Forest':    { gatherXpPct: 8 },
  'Void Rite':         { skillXpPct: { alchemy: 20 } },
  'World Tree':        { allXpPct: 15 },
  'The Awakening':     { allXpPct: 25 },
};

const GATHER_SKILLS = new Set(['foraging','woodcutting','fishing','stargazing']);

// ── Buff readers ───────────────────────────────────────────────────────────
function activeBuff(state: GameState, name: string): boolean {
    const now = Date.now() / 1000; //TODO: magic numbers
    return state.buffs.some(b => b.name === name && b.expiresAt > now);
}

/** Total XP multiplier for a given skill, reading all active buffs + season. */
export function getXpMultiplier(state: GameState, skill: string): number {
    const now = Date.now() / 1000; //TODO: magic numbers
    let bonus = 0; // percentage points to add to 100%

    for (const b of state.buffs) {
        if (b.expiresAt <= now) continue;
        const fx = BUFF_EFFECTS[b.name];
        if (!fx) continue;
        if (fx.allXpPct) bonus += fx.allXpPct;
        if (fx.skillXpPct?.[skill]) bonus += fx.skillXpPct[skill];
        if (fx.gatherXpPct && GATHER_SKILLS.has(skill)) bonus += fx.gatherXpPct;
    }

    // Season bonus — from SEASON_BONUSES (values are % points)
    const season = getSeason(state);
    const seasonMods = SEASON_BONUSES[season] ?? {};
    const rawSeasonPct = seasonMods[skill] ?? 0;
    // Season's Blessing doubles the season modifier
    const seasonMult = activeBuff(state, "Season's Blessing") ? 2 : 1;
    bonus += rawSeasonPct * seasonMult;

    return 1 + Math.max(bonus, 0) / 100; // never go below 1×
}

/** Speed multiplier: returns a value < 1 meaning "duration is this fraction of base". */
export function getSpeedMultiplier(state: GameState): number {
    const now = Date.now() / 1000; //TODO: magic numbers
    let reduction = 0; // percentage points off duration

    for (const b of state.buffs) {
        if (b.expiresAt <= now) continue;
        const fx = BUFF_EFFECTS[b.name];
        if (fx?.speedPct) reduction += fx.speedPct;
    }

    return Math.max(0.1, 1 - reduction / 100);
}

/** Drop multiplier from Forest's Favour. */
function getDropMultiplier(state: GameState): number {
    const now = Date.now() / 1000; //TODO: magic numbers
    let mult = 1;
    for (const b of state.buffs) {
        if (b.expiresAt <= now) continue;
        const fx = BUFF_EFFECTS[b.name];
        if (fx?.dropMult) mult = Math.max(mult, fx.dropMult);
    }
    return mult;
}

// ── HELPERS ────────────────────────────────────────────────────────────────
/** Current visual progress 0–1 for the active action. */
export function actionProgress(state: GameState): number {
    const a = state.active;
    if (!a || a.duration <= 0) return 0;
    return Math.min((Date.now() / 1000 - a.startedAt) / a.duration, 1); //TODO: magic numbers
}

/** Returns a human-readable summary of all active buff bonuses for a skill. */
export function getActiveXpBonusSummary(state: GameState, skill: string): string {
    const mult = getXpMultiplier(state, skill);
    if (mult <= 1) return '';
    return `+${Math.round((mult - 1) * 100)}% XP`;
}

export function startAction(
  state: GameState,
  skill: string,
  actionName: string,
  qty: number,
): void {
  const action = findAction(skill, actionName);
  if (!action) return;

  let duration = action.duration;

  // Utility duration reductions (permanent shop items)
  const owned = state.ownedUtilities ?? [];
  const UTILITY_REDUCTIONS: Record<string, { skill: string; pct: number }> = {
    better_fishing_rod: { skill: 'fishing', pct: 0.10 },
    herb_drying_rack: { skill: 'herbalism', pct: 0.15 },
    reinforced_cauldron: { skill: 'brewing', pct: 0.15 },
  };
  for (const [id, { skill: s, pct }] of Object.entries(UTILITY_REDUCTIONS)) {
    if (s === skill && owned.includes(id)) duration *= (1 - pct);
  }

  // Swift Hands buff (and any future speed buffs)
  duration *= getSpeedMultiplier(state);
  duration = Math.max(1, duration);

  state.active = {
    skill, action: actionName,
    qtyTotal: qty, qtyDone: 0,
    startedAt: Date.now() / 1000,
    duration,
    xpPer: action.xp,
    output: action.output,
  };
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Companion passive generation ───────────────────────────────────────────
// Each companion_item in inventory passively generates resources every interval.

interface CompanionDef {
  interval: number;             // seconds between resource ticks
  output: Array<{ item: string; chance: number; qty: number }>;
}

const COMPANION_DEFS: Record<string, CompanionDef> = {
  rabbit_companion: { interval: 60, output: [{ item: 'wildberries', chance: 0.8, qty: 2 }, { item: 'common_herbs', chance: 0.5, qty: 1 }] },
  fox_companion: { interval: 90, output: [{ item: 'rare_seeds', chance: 0.4, qty: 1 }, { item: 'river_herbs', chance: 0.5, qty: 1 }] },
  owl_companion: { interval: 120, output: [{ item: 'stardust', chance: 0.7, qty: 2 }, { item: 'celestial_charts', chance: 0.15, qty: 1 }] },
  boar_companion: { interval: 90, output: [{ item: 'boar_hide', chance: 0.5, qty: 1 }, { item: 'charcoal', chance: 0.4, qty: 1 }] },
  otter_companion: { interval: 75, output: [{ item: 'small_fish', chance: 0.8, qty: 2 }, { item: 'river_stones', chance: 0.5, qty: 2 }] },
  bear_companion: { interval: 120, output: [{ item: 'ironbark_shards', chance: 0.5, qty: 1 }, { item: 'thick_bark', chance: 0.6, qty: 2 }] },
  moon_deer_companion: { interval: 150, output: [{ item: 'moonbloom_petals', chance: 0.3, qty: 1 }, { item: 'moon_phase_data', chance: 0.4, qty: 1 }] },
  storm_eagle_companion: { interval: 180, output: [{ item: 'deep_sky_maps', chance: 0.4, qty: 1 }, { item: 'aurora_shards', chance: 0.2, qty: 1 }] },
  ancient_stag_companion: { interval: 300, output: [{ item: 'spirit_herbs', chance: 0.5, qty: 1 }, { item: 'heartroot', chance: 0.02, qty: 1 }] },
};

function tickCompanions(state: GameState, now: number): void {
  const lastTick = (state as any).companionLastTick as number ?? now;
  const elapsed = now - lastTick;
  if (elapsed < 1) return;

  let anyOutput = false;
  for (const [companionItem, def] of Object.entries(COMPANION_DEFS)) {
    if (!(state.inventory[companionItem] > 0)) continue;

    // How many full intervals have passed since last tick?
    const ticks = Math.floor(elapsed / def.interval);
    if (ticks < 1) continue;

    for (let t = 0; t < ticks; t++) {
      for (const o of def.output) {
        if (Math.random() < o.chance) {
          state.inventory[o.item] = (state.inventory[o.item] ?? 0) + o.qty;
          trackItem(state, o.item);
          anyOutput = true;
        }
      }
    }
  }

  (state as any).companionLastTick = now;

  if (anyOutput) {
    // Don't spam log — just note periodically
    const mins = Math.floor(elapsed / 60);
    if (mins > 0) addLog(state, `🐾 Companions gathered resources while you were away`);
  }
}

// ── Completion trackers ────────────────────────────────────────────────────

function trackItem(state: GameState, item: string): void {
  if (!state.completion.itemCollection.includes(item))
    state.completion.itemCollection.push(item);
}

function trackRareDrop(state: GameState, item: string): void {
  if (TRACKABLE_DROPS.has(item) && !state.completion.rareDrops.includes(item))
    state.completion.rareDrops.push(item);
}

function trackMilestone(state: GameState, id: string): void {
  if (!state.completion.worldMilestones.includes(id)) {
    state.completion.worldMilestones.push(id);
    const def = WORLD_MILESTONES.find(m => m.id === id);
    if (def) addLog(state, `🏆 MILESTONE — ${def.label}`, 'general');
  }
}

function checkLegendarySets(state: GameState): void {
  // Druid's Awakening — tracked by quantity of druids_awakening_piece (need 5)
  const da = state.inventory['druids_awakening_piece'] ?? 0;
  if (da >= 1) trackMilestone(state, 'set1_piece');
  if (da >= 5) {
    trackMilestone(state, 'set1_complete');
    // Apply reward flag
    if (!(state as any).reward_druids_awakening) {
      (state as any).reward_druids_awakening = true;
      addLog(state, "✦ SET COMPLETE — Druid's Awakening! All seasonal bonuses now apply simultaneously.", 'rare_drop');
    }
  }

  // Leviathan's Pact — needs all 5 specific items
  const lp_pieces = ['leviathan_scale', 'pearl_of_the_deep', 'ancient_fishing_hook', 'world_constellation_piece', 'navigators_eye'];
  const lp_have = lp_pieces.filter(p => (state.inventory[p] ?? 0) > 0).length;
  if (lp_have >= 1) trackMilestone(state, 'set2_piece');
  if (lp_have >= 5) {
    trackMilestone(state, 'set2_complete');
    if (!(state as any).reward_leviathans_pact) {
      (state as any).reward_leviathans_pact = true;
      addLog(state, "✦ SET COMPLETE — Leviathan's Pact! Companions now generate double resources.", 'rare_drop');
    }
  }

  // Both sets
  if (da >= 5 && lp_have >= 5) trackMilestone(state, 'both_sets');
}

function checkActionMastery(state: GameState, skill: string, actionName: string): void {
  const key = `${skill}.${actionName}`;
  if (!state.completion.actionMastery.includes(key))
    state.completion.actionMastery.push(key);
}

function checkCompanionMilestones(state: GameState): void {
  const COMPANIONS = ['rabbit_companion', 'fox_companion', 'owl_companion', 'boar_companion',
    'otter_companion', 'bear_companion', 'moon_deer_companion', 'storm_eagle_companion', 'ancient_stag_companion'];
  const have = COMPANIONS.filter(c => (state.inventory[c] ?? 0) > 0).length;
  if (have >= 1) trackMilestone(state, 'companion_first');
  if (have >= 9) trackMilestone(state, 'companion_all');
}

// ── Tier display ───────────────────────────────────────────────────────────
const TIER_LABEL: Record<DropTier, string> = {
  uncommon: 'UNCOMMON DROP',
  rare: 'RARE DROP',
  very_rare: 'VERY RARE DROP',
  legendary: 'LEGENDARY DROP',
  mythic: 'MYTHIC DROP',
};

// ── completeAction ─────────────────────────────────────────────────────────
function completeAction(state: GameState, active: ActiveAction): void {
  const now = Date.now() / 1000;
  const { skill, output, action: actionName } = active;

  // XP — full multiplier stack
  const xpMult = getXpMultiplier(state, skill);
  const xpActual = Math.round(active.xpPer * xpMult);

  const oldXp = state.skills[skill] ?? 0;
  const oldLvl = levelFromXp(oldXp)[0];
  state.skills[skill] = oldXp + xpActual;
  const newLvl = levelFromXp(state.skills[skill])[0];

  // Base output
  for (const o of output) {
    const qty = randInt(o.qtyMin, o.qtyMax);
    if (qty > 0) {
      state.inventory[o.item] = (state.inventory[o.item] ?? 0) + qty;
      trackItem(state, o.item);
    }
  }

  // Bonus drops
  const dropMult = getDropMultiplier(state);
  for (const drop of rollDrops(skill, dropMult)) {
    state.inventory[drop.item] = (state.inventory[drop.item] ?? 0) + drop.qty;
    trackItem(state, drop.item);
    trackRareDrop(state, drop.item);
    if (RARE_TIERS.includes(drop.tier)) {
      const label = drop.item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      addLog(state, `✦ ${TIER_LABEL[drop.tier]} — ${label} ×${drop.qty}`, 'rare_drop');
    }
  }

  // Action mastery — first time completing this action
  checkActionMastery(state, skill, actionName);

  // Combat kill tracking
  if (skill === 'combat') {
    const kills = state.completion.combatKills;
    kills[actionName] = (kills[actionName] ?? 0) + 1;
  }

  // Companion milestones (check after every beastmastery action)
  if (skill === 'beastmastery') checkCompanionMilestones(state);

  // Legendary set detection (check after every drop-producing action)
  checkLegendarySets(state);

  // Endgame action milestones
  if (skill === 'ritualism' && actionName === 'the_first_rite') {
    trackMilestone(state, 'first_rite');
    trackMilestone(state, 'the_awakening');
  }
  if (skill === 'combat' && actionName === 'face_corrupted_world_tree') {
    trackMilestone(state, 'face_world_tree');
  }
  if (skill === 'ritualism' && actionName === 'perform_solstice_rite') {
    trackMilestone(state, 'event_solstice');
  }
  if (skill === 'stargazing' && actionName === 'observe_blood_moon') {
    trackMilestone(state, 'event_blood_moon');
  }

  // Ritualism — apply buff on completion
  if (skill === 'ritualism') {
    const RITUAL_BUFFS: Record<string, { name: string; effect: string; duration: number }> = {
      perform_blessing_rite: { name: 'Blessing Rite', effect: '+2% all XP', duration: 300 },
      invoke_growth_moon: { name: 'Growth Moon', effect: 'Cultivation +10% XP', duration: 600 },
      perform_river_rite: { name: 'River Rite', effect: 'Fishing +10% XP', duration: 600 },
      perform_autumn_rite: { name: 'Autumn Rite', effect: 'Foraging +15% XP', duration: 900 },
      invoke_the_storm: { name: 'Storm Invocation', effect: 'Runecrafting +12% XP', duration: 720 },
      commune_with_ancestors: { name: 'Ancestor Commune', effect: '+5% all XP', duration: 480 },
      perform_solstice_rite: { name: 'Solstice Rite', effect: '+15% all XP', duration: 1800 },
      invoke_moons_embrace: { name: "Moon's Embrace", effect: 'Brewing +15% XP', duration: 900 },
      perform_blood_rite: { name: 'Blood Rite', effect: 'Combat +20% XP', duration: 600 },
      invoke_ancient_forest: { name: 'Ancient Forest', effect: 'All gather XP +8%', duration: 720 },
      perform_void_rite: { name: 'Void Rite', effect: 'Alchemy +20% XP', duration: 600 },
      invoke_the_world_tree: { name: 'World Tree', effect: '+15% all XP', duration: 900 },
      the_first_rite: { name: 'The Awakening', effect: 'All XP +25%', duration: 3600 },
    };
    const rb = RITUAL_BUFFS[actionName];
    if (rb) {
      state.buffs = state.buffs.filter(b => b.name !== rb.name);
      state.buffs.push({ name: rb.name, effect: rb.effect, expiresAt: now + rb.duration });
      addLog(state, `✦ Ritual complete — ${rb.name} active (${rb.effect}, ${Math.round(rb.duration / 60)}m)`);
    }
  }

  // Level-up log
  if (newLvl > oldLvl) {
    addLog(state, `⬆ LEVEL UP! ${SKILL_LABELS[skill] ?? skill} reached level ${newLvl}`, 'level_up');
  }

  // General action log — throttle to avoid flooding
  const shouldLog = active.qtyDone % 5 === 0 || active.qtyTotal <= 5;
  if (shouldLog) {
    const label = actionName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const bonusPct = Math.round((xpMult - 1) * 100);
    const xpNote = bonusPct > 0 ? ` (+${bonusPct}% bonus)` : '';
    addLog(state, `${SKILL_LABELS[skill] ?? skill} › ${label}  +${xpActual} XP${xpNote}`);
  }
}

// ── Lootbox opening ────────────────────────────────────────────────────────
export function openBoxFull(
  state: GameState,
  boxId: string,
): { items: Array<{ item: string; qty: number; tier: string }>; summary: string } {
  const result = openLootbox(boxId);
  const summaryParts: string[] = [];

  for (const drop of result.items) {
    state.inventory[drop.item] = (state.inventory[drop.item] ?? 0) + drop.qty;
    trackItem(state, drop.item);
    trackRareDrop(state, drop.item);
    const label = drop.item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    summaryParts.push(`${label} ×${drop.qty}`);
    if (RARE_TIERS.includes(drop.tier)) {
      addLog(state, `✦ ${TIER_LABEL[drop.tier]} (lootbox) — ${label} ×${drop.qty}`, 'rare_drop');
    }
  }

  // Check legendary set completion after lootbox
  checkLegendarySets(state);

  return {
    items: result.items.map(d => ({ item: d.item, qty: d.qty, tier: d.tier })),
    summary: summaryParts.join(', ') || 'nothing of note',
  };
}

// ── Queue ──────────────────────────────────────────────────────────────────
function dequeueNext(state: GameState): void {
  if (state.queue.length === 0) { state.active = null; return; }
  const next = state.queue.shift()!;
  startAction(state, next.skill, next.action, next.qty);
}

// ── Main tick ──────────────────────────────────────────────────────────────
export function tick(state: GameState): boolean {
  const now = Date.now() / 1000;

  // Expire old buffs
  state.buffs = state.buffs.filter(b => b.expiresAt > now);

  // Companion passive generation
  tickCompanions(state, now);

  // Track which seasons have been experienced before ticking
  const prevSeason = SEASONS[state.seasonIndex % SEASONS.length];
  tickSeasons(state);
  const newSeason = SEASONS[state.seasonIndex % SEASONS.length];
  if (newSeason !== prevSeason) {
    // A season just ended — mark the completed season
    trackMilestone(state, `season_${prevSeason}`);
    // Check true completion
    const allSeasons = ['season_spring', 'season_summer', 'season_autumn', 'season_winter'];
    if (allSeasons.every(s => state.completion.worldMilestones.includes(s))) {
      // Don't need a separate milestone for this, but could add one
    }
  }

  const active = state.active;
  if (!active) {
    if (state.queue.length > 0) dequeueNext(state);
    return false;
  }

  if (now - active.startedAt < active.duration) return false;

  completeAction(state, active);

  const done = active.qtyDone + 1;
  const total = active.qtyTotal;

  if (total === 0 || done < total) {
    active.qtyDone = done;
    active.startedAt = now;
  } else {
    state.active = null;
    dequeueNext(state);
  }

  return true;
}
