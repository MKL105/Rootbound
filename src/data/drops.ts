// ── drops.ts ───────────────────────────────────────────────────────────────
// This files contains all the drop tables and loot tables for skill actions
// and lootboxes.
// ───────────────────────────────────────────────────────────────────────────

export type DropTier = 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'mythic';

export interface DropEntry {
    item: string;
    tier: DropTier;
    chance: number;   // 0–1  (e.g. 0.05 = 5%)
    qty: number;   // always exactly this many when it drops
}

// Base chances per tier — can be modified by Forest's Favour buff
export const TIER_BASE_CHANCE: Record<DropTier, number> = {
    uncommon: 0.05,
    rare: 0.01,
    very_rare: 0.002,
    legendary: 0.0005,
    mythic: 0.0001,
};

export const TIER_LABELS: Record<DropTier, string> = {
    uncommon: 'Uncommon',
    rare: 'Rare',
    very_rare: 'Very Rare',
    legendary: 'Legendary',
    mythic: 'Mythic',
};

// ── Drop tables per skill ──────────────────────────────────────────────────
// Each entry has a chance that overrides the tier base if specified.
// If chance is omitted, the tier base is used.

export const SKILL_DROPS: Record<string, DropEntry[]> = {

    foraging: [
        { item: 'cave_moss', tier: 'uncommon', chance: 0.05, qty: 1 },
        { item: 'rare_seeds', tier: 'uncommon', chance: 0.04, qty: 2 },
        { item: 'ancient_bark', tier: 'rare', chance: 0.012, qty: 2 },
        { item: 'moonbloom_petals', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'pure_dewdrops', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'heartroot', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'starfern_fronds', tier: 'very_rare', chance: 0.0015, qty: 1 },
        { item: 'glowcap_fungi', tier: 'legendary', chance: 0.0005, qty: 1 },
        // Legendary set piece
        { item: 'wanderers_compass', tier: 'legendary', chance: 0.0005, qty: 1 },
        { item: 'living_root', tier: 'mythic', chance: 0.0001, qty: 1 },
    ],

    woodcutting: [
        { item: 'thick_bark', tier: 'uncommon', chance: 0.06, qty: 3 },
        { item: 'charcoal', tier: 'uncommon', chance: 0.05, qty: 2 },
        { item: 'pine_resin', tier: 'uncommon', chance: 0.04, qty: 1 },
        { item: 'ancient_bark', tier: 'rare', chance: 0.01, qty: 2 },
        { item: 'ancient_logs', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'witchwood_logs', tier: 'rare', chance: 0.007, qty: 1 },
        { item: 'moonwood_logs', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'rootwood', tier: 'very_rare', chance: 0.0015, qty: 1 },
        { item: 'twisted_branch', tier: 'legendary', chance: 0.0005, qty: 1 },
        { item: 'heartwood_core', tier: 'mythic', chance: 0.0001, qty: 1 },
    ],

    fishing: [
        { item: 'river_stones', tier: 'uncommon', chance: 0.06, qty: 3 },
        { item: 'reeds', tier: 'uncommon', chance: 0.05, qty: 2 },
        { item: 'frost_pearls', tier: 'rare', chance: 0.012, qty: 1 },
        { item: 'river_relics', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'moonfish', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'shimmereel', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'spiritfish', tier: 'very_rare', chance: 0.0015, qty: 1 },
        { item: 'ancient_fishing_hook', tier: 'legendary', chance: 0.0005, qty: 1 },
        { item: 'pearl_of_the_deep', tier: 'legendary', chance: 0.0004, qty: 1 },
        // Legendary set piece
        { item: 'leviathan_scale', tier: 'mythic', chance: 0.0001, qty: 1 },
    ],

    stargazing: [
        { item: 'celestial_charts', tier: 'uncommon', chance: 0.06, qty: 1 },
        { item: 'wandering_stardust', tier: 'uncommon', chance: 0.05, qty: 2 },
        { item: 'aurora_shards', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'ley_resonance', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'blood_moon_dust', tier: 'rare', chance: 0.007, qty: 1 },
        { item: 'void_fragments', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'deep_sky_maps', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'navigators_eye', tier: 'legendary', chance: 0.0005, qty: 1 },
        // Legendary set piece
        { item: 'world_constellation_piece', tier: 'mythic', chance: 0.0001, qty: 1 },
    ],

    herbalism: [
        { item: 'dried_herbs', tier: 'uncommon', chance: 0.07, qty: 2 },
        { item: 'flower_essence', tier: 'uncommon', chance: 0.04, qty: 1 },
        { item: 'moss_paste', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'moonbloom_essence', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'glowcap_spores', tier: 'rare', chance: 0.007, qty: 1 },
        { item: 'dew_crystals', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'starfern_extract', tier: 'very_rare', chance: 0.0015, qty: 1 },
        { item: 'heartroot_oil', tier: 'legendary', chance: 0.0005, qty: 1 },
        // Legendary set piece
        { item: 'druids_awakening_piece', tier: 'mythic', chance: 0.0001, qty: 1 },
    ],

    cultivation: [
        { item: 'autumn_herbs', tier: 'uncommon', chance: 0.06, qty: 2 },
        { item: 'flowers', tier: 'uncommon', chance: 0.06, qty: 2 },
        { item: 'moonbloom', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'spirit_herbs', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'thornroot', tier: 'rare', chance: 0.009, qty: 2 },
        { item: 'rootbloom', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'starfern_fronds', tier: 'very_rare', chance: 0.0015, qty: 1 },
        // Legendary set piece
        { item: 'druids_awakening_piece', tier: 'mythic', chance: 0.0001, qty: 1 },
    ],

    woodcarving: [
        { item: 'carved_tool', tier: 'uncommon', chance: 0.05, qty: 1 },
        { item: 'wooden_totem', tier: 'uncommon', chance: 0.04, qty: 1 },
        { item: 'rune_staff', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'ritual_mask', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'ironbark_shield', tier: 'rare', chance: 0.007, qty: 1 },
        { item: 'witchwood_staff', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'moonwood_bow', tier: 'very_rare', chance: 0.0015, qty: 1 },
        { item: 'world_stave', tier: 'legendary', chance: 0.0003, qty: 1 },
    ],

    cooking: [
        { item: 'berry_jam', tier: 'uncommon', chance: 0.06, qty: 1 },
        { item: 'herb_broth', tier: 'uncommon', chance: 0.05, qty: 1 },
        { item: 'mushroom_stew', tier: 'uncommon', chance: 0.05, qty: 1 },
        { item: 'crayfish_feast', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'moonberry_pie', tier: 'rare', chance: 0.009, qty: 1 },
        { item: 'silverscale_sashimi', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'forest_feast', tier: 'very_rare', chance: 0.0015, qty: 1 },
        { item: 'great_meal', tier: 'legendary', chance: 0.0004, qty: 1 },
    ],

    brewing: [
        { item: 'clarity_potion', tier: 'uncommon', chance: 0.05, qty: 1 },
        { item: 'forest_spirit', tier: 'uncommon', chance: 0.04, qty: 1 },
        { item: 'moon_tea', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'swiftness_elixir', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'autumn_tonic', tier: 'rare', chance: 0.008, qty: 1 },
        { item: 'starbloom_elixir', tier: 'very_rare', chance: 0.002, qty: 1 },
        { item: 'blood_moon_brew', tier: 'very_rare', chance: 0.0015, qty: 1 },
        { item: 'eternal_draught', tier: 'legendary', chance: 0.0004, qty: 1 },
    ],

    weaving: [
        { item: 'fibre_thread', tier: 'uncommon', chance: 0.07, qty: 2 },
        { item: 'reed_basket', tier: 'uncommon', chance: 0.05, qty: 1 },
    ],

    runecrafting: [
        { item: 'basic_rune', tier: 'uncommon', chance: 0.06, qty: 2 },
    ],

    beastmastery: [],
    alchemy: [],

    ritualism: [
        { item: 'stardust', tier: 'uncommon', chance: 0.07, qty: 3 },
        { item: 'void_fragments', tier: 'rare', chance: 0.01, qty: 1 },
    ],

    combat: [
        { item: 'sprite_dust', tier: 'uncommon', chance: 0.07, qty: 2 },
        { item: 'river_relics', tier: 'rare', chance: 0.01, qty: 1 },
        { item: 'ancient_warriors_shard', tier: 'legendary', chance: 0.0005, qty: 1 },
        // Legendary set piece
        { item: 'void_blade_fragment', tier: 'mythic', chance: 0.0001, qty: 1 },
    ],
};

// ── Rare drop IDs for completion tracking ──────────────────────────────────
// These are the 40 "trackable" drops from the GDD.
export const TRACKABLE_DROPS = new Set([ //TODO: add all items here
    'ancient_bark', 'moonbloom_petals', 'pure_dewdrops', 'heartroot', 'glowcap_fungi',
    'wanderers_compass', 'living_root',
    'ancient_logs', 'witchwood_logs', 'moonwood_logs', 'rootwood', 'twisted_branch', 'heartwood_core',
    'frost_pearls', 'river_relics', 'shimmereel', 'spiritfish', 'ancient_fishing_hook',
    'pearl_of_the_deep', 'leviathan_scale',
    'aurora_shards', 'void_fragments', 'ley_resonance', 'navigators_eye', 'world_constellation_piece',
    'moonbloom_essence', 'glowcap_spores', 'dew_crystals', 'starfern_extract', 'heartroot_oil',
    'druids_awakening_piece',
    'rootbloom', 'spirit_herbs',
    'witchwood_staff', 'moonwood_bow', 'world_stave',
    'forest_feast', 'great_meal',
    'eternal_draught', 'blood_moon_brew',
    'ancient_warriors_shard', 'void_blade_fragment',
]);

// Items that should be added to item_collection on first discover
export const RARE_TIERS: DropTier[] = ['rare', 'very_rare', 'legendary', 'mythic'];

// ── Roll function ──────────────────────────────────────────────────────────
export interface DropResult {
    item: string;
    qty: number;
    tier: DropTier;
}

/**
 * Roll for bonus drops for a given skill action.
 * dropMultiplier > 1 when Forest's Favour buff is active.
 */
export function rollDrops(skill: string, dropMultiplier = 1): DropResult[] {
    const table = SKILL_DROPS[skill] ?? [];
    const results: DropResult[] = [];

    for (const entry of table) {
        const effectiveChance = Math.min(entry.chance * dropMultiplier, 1);
        if (Math.random() < effectiveChance) {
            results.push({ item: entry.item, qty: entry.qty, tier: entry.tier });
        }
    }
    return results;
}

// ── Lootbox tables ─────────────────────────────────────────────────────────
export interface LootboxPool {
    item: string;
    weight: number;   // relative weight — higher = more likely
}

const COMMON_POOL: LootboxPool[] = [
    { item: 'wildberries', weight: 20 },
    { item: 'common_herbs', weight: 20 },
    { item: 'birch_logs', weight: 18 },
    { item: 'small_fish', weight: 18 },
    { item: 'stardust', weight: 10 },
    { item: 'thick_bark', weight: 12 },
    { item: 'river_stones', weight: 15 },
    { item: 'dried_herbs', weight: 12 },
    { item: 'berry_pulp', weight: 10 },
];

const UNCOMMON_POOL: LootboxPool[] = [
    { item: 'cave_moss', weight: 15 },
    { item: 'rare_seeds', weight: 12 },
    { item: 'ancient_bark', weight: 10 },
    { item: 'celestial_charts', weight: 10 },
    { item: 'flower_essence', weight: 12 },
    { item: 'resin_oil', weight: 12 },
    { item: 'charcoal', weight: 14 },
    { item: 'icefish', weight: 8 },
    { item: 'moonfish', weight: 8 },
];

const RARE_POOL: LootboxPool[] = [
    { item: 'moonbloom_petals', weight: 10 },
    { item: 'aurora_shards', weight: 10 },
    { item: 'frost_pearls', weight: 8 },
    { item: 'river_relics', weight: 7 },
    { item: 'moonbloom_essence', weight: 8 },
    { item: 'dew_crystals', weight: 7 },
    { item: 'ancient_logs', weight: 8 },
    { item: 'witchwood_logs', weight: 7 },
    { item: 'ley_resonance', weight: 5 },
    { item: 'blood_moon_dust', weight: 5 },
];

const VERY_RARE_POOL: LootboxPool[] = [
    { item: 'heartroot', weight: 8 },
    { item: 'rootwood', weight: 7 },
    { item: 'spiritfish', weight: 7 },
    { item: 'void_fragments', weight: 6 },
    { item: 'moonwood_logs', weight: 7 },
    { item: 'starfern_fronds', weight: 6 },
    { item: 'heartroot_oil', weight: 5 },
    { item: 'shimmereel', weight: 6 },
];

const LEGENDARY_POOL: LootboxPool[] = [
    { item: 'worldshard', weight: 3 },
    { item: 'world_stave', weight: 3 },
    { item: 'eternal_draught', weight: 4 },
    { item: 'great_meal', weight: 4 },
    { item: 'moonwood_bow', weight: 3 },
    { item: 'blood_moon_brew', weight: 5 },
];

function pickFromPool(pool: LootboxPool[]): string {
    const total = pool.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * total;
    for (const entry of pool) {
        roll -= entry.weight;
        if (roll <= 0) return entry.item;
    }
    return pool[pool.length - 1].item;
}

export interface LootboxResult {
    items: Array<{ item: string; qty: number; tier: DropTier }>;
}

export function openLootbox(id: string): LootboxResult { //TODO: lots of magic numbers
    const results: LootboxResult['items'] = [];

    if (id === 'wanderers_satchel') {
        // 3–4 common items, 30% chance of one uncommon
        const numCommon = 3 + (Math.random() < 0.5 ? 1 : 0); 
        for (let i = 0; i < numCommon; i++) {
            results.push({ item: pickFromPool(COMMON_POOL), qty: Math.ceil(Math.random() * 5) + 2, tier: 'uncommon' });
        }
        if (Math.random() < 0.30) {
            results.push({ item: pickFromPool(UNCOMMON_POOL), qty: 1, tier: 'uncommon' });
        }
    }

    if (id === 'grove_chest') {
        // 1–2 uncommon, 1 rare, 15% chance of very_rare
        const numUncommon = 1 + (Math.random() < 0.5 ? 1 : 0);
        for (let i = 0; i < numUncommon; i++) {
            results.push({ item: pickFromPool(UNCOMMON_POOL), qty: Math.ceil(Math.random() * 3) + 1, tier: 'uncommon' });
        }
        results.push({ item: pickFromPool(RARE_POOL), qty: 1, tier: 'rare' });
        if (Math.random() < 0.15) {
            results.push({ item: pickFromPool(VERY_RARE_POOL), qty: 1, tier: 'very_rare' });
        }
    }

    if (id === 'moonlit_vault') {
        // 1 rare guaranteed, 1 very_rare, 20% legendary
        results.push({ item: pickFromPool(RARE_POOL), qty: Math.ceil(Math.random() * 2) + 1, tier: 'rare' });
        results.push({ item: pickFromPool(VERY_RARE_POOL), qty: 1, tier: 'very_rare' });
        if (Math.random() < 0.20) {
            results.push({ item: pickFromPool(LEGENDARY_POOL), qty: 1, tier: 'legendary' });
        }
    }

    return { items: results };
}