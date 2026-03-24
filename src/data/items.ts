// ── items.ts ───────────────────────────────────────────────────────────────
// This files contains all the item metadata like sell prices or rarities
// ───────────────────────────────────────────────────────────────────────────

export interface ItemDef {
    label: string;
    sellPrice: number;   // gold per unit
    category: string;   // used for inv filtering
    rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'mythic';
}

export const ITEMS: Record<string, ItemDef> = {

    // ── Foraging ──────────────────────────────────────────────────────────────
    wildberries: { label: 'Wildberries', sellPrice: 2, category: 'foraging', rarity: 'common' },
    common_herbs: { label: 'Common Herbs', sellPrice: 3, category: 'foraging', rarity: 'common' },
    forest_mushrooms: { label: 'Forest Mushrooms', sellPrice: 5, category: 'foraging', rarity: 'common' },
    bark_scraps: { label: 'Bark Scraps', sellPrice: 1, category: 'foraging', rarity: 'common' },
    tree_resin: { label: 'Tree Resin', sellPrice: 8, category: 'foraging', rarity: 'common' },
    river_herbs: { label: 'River Herbs', sellPrice: 10, category: 'foraging', rarity: 'common' },
    cave_moss: { label: 'Cave Moss', sellPrice: 14, category: 'foraging', rarity: 'uncommon' },
    autumn_berries: { label: 'Autumn Berries', sellPrice: 9, category: 'foraging', rarity: 'common' },
    rare_seeds: { label: 'Rare Seeds', sellPrice: 40, category: 'foraging', rarity: 'uncommon' },
    ancient_bark: { label: 'Ancient Bark', sellPrice: 35, category: 'foraging', rarity: 'uncommon' },
    moonbloom_petals: { label: 'Moonbloom Petals', sellPrice: 90, category: 'foraging', rarity: 'rare' },
    pure_dewdrops: { label: 'Pure Dewdrops', sellPrice: 60, category: 'foraging', rarity: 'rare' },
    thornroot: { label: 'Thornroot', sellPrice: 55, category: 'foraging', rarity: 'uncommon' },
    glowcap_fungi: { label: 'Glowcap Fungi', sellPrice: 180, category: 'foraging', rarity: 'rare' },
    starfern_fronds: { label: 'Starfern Fronds', sellPrice: 300, category: 'foraging', rarity: 'rare' },
    heartroot: { label: 'Heartroot', sellPrice: 2000, category: 'foraging', rarity: 'very_rare' },

    // ── Woodcutting ───────────────────────────────────────────────────────────
    birch_logs: { label: 'Birch Logs', sellPrice: 1, category: 'woodcutting', rarity: 'common' },
    oak_logs: { label: 'Oak Logs', sellPrice: 3, category: 'woodcutting', rarity: 'common' },
    thick_bark: { label: 'Thick Bark', sellPrice: 2, category: 'woodcutting', rarity: 'common' },
    pine_logs: { label: 'Pine Logs', sellPrice: 5, category: 'woodcutting', rarity: 'common' },
    pine_resin: { label: 'Pine Resin', sellPrice: 8, category: 'woodcutting', rarity: 'common' },
    deadwood: { label: 'Deadwood', sellPrice: 2, category: 'woodcutting', rarity: 'common' },
    charcoal: { label: 'Charcoal', sellPrice: 6, category: 'woodcutting', rarity: 'common' },
    ash_logs: { label: 'Ash Logs', sellPrice: 12, category: 'woodcutting', rarity: 'common' },
    raw_sap: { label: 'Raw Sap', sellPrice: 10, category: 'woodcutting', rarity: 'common' },
    ironbark_logs: { label: 'Ironbark Logs', sellPrice: 28, category: 'woodcutting', rarity: 'uncommon' },
    witchwood_logs: { label: 'Witchwood Logs', sellPrice: 60, category: 'woodcutting', rarity: 'uncommon' },
    ancient_logs: { label: 'Ancient Logs', sellPrice: 80, category: 'woodcutting', rarity: 'rare' },
    moonwood_logs: { label: 'Moonwood Logs', sellPrice: 250, category: 'woodcutting', rarity: 'rare' },
    rootwood: { label: 'Rootwood', sellPrice: 1800, category: 'woodcutting', rarity: 'very_rare' },

    // ── Fishing ───────────────────────────────────────────────────────────────
    small_fish: { label: 'Small Fish', sellPrice: 2, category: 'fishing', rarity: 'common' },
    river_stones: { label: 'River Stones', sellPrice: 1, category: 'fishing', rarity: 'common' },
    common_fish: { label: 'Common Fish', sellPrice: 3, category: 'fishing', rarity: 'common' },
    pond_fish: { label: 'Pond Fish', sellPrice: 5, category: 'fishing', rarity: 'common' },
    reeds: { label: 'Reeds', sellPrice: 2, category: 'fishing', rarity: 'common' },
    crayfish: { label: 'Crayfish', sellPrice: 12, category: 'fishing', rarity: 'common' },
    large_fish: { label: 'Large Fish', sellPrice: 15, category: 'fishing', rarity: 'common' },
    icefish: { label: 'Icefish', sellPrice: 45, category: 'fishing', rarity: 'uncommon' },
    frost_pearls: { label: 'Frost Pearls', sellPrice: 120, category: 'fishing', rarity: 'rare' },
    moonfish: { label: 'Moonfish', sellPrice: 80, category: 'fishing', rarity: 'uncommon' },
    silverscale_fish: { label: 'Silverscale Fish', sellPrice: 110, category: 'fishing', rarity: 'uncommon' },
    river_relics: { label: 'River Relics', sellPrice: 200, category: 'fishing', rarity: 'rare' },
    odd_stones: { label: 'Odd Stones', sellPrice: 20, category: 'fishing', rarity: 'common' },
    deepfish: { label: 'Deepfish', sellPrice: 160, category: 'fishing', rarity: 'rare' },
    shimmereel: { label: 'Shimmereel', sellPrice: 400, category: 'fishing', rarity: 'rare' },
    spiritfish: { label: 'Spiritfish', sellPrice: 1500, category: 'fishing', rarity: 'very_rare' },

    // ── Stargazing ────────────────────────────────────────────────────────────
    stardust: { label: 'Stardust', sellPrice: 15, category: 'stargazing', rarity: 'common' },
    celestial_charts: { label: 'Celestial Charts', sellPrice: 40, category: 'stargazing', rarity: 'uncommon' },
    moon_phase_data: { label: 'Moon Phase Data', sellPrice: 35, category: 'stargazing', rarity: 'uncommon' },
    wandering_stardust: { label: 'Wandering Stardust', sellPrice: 55, category: 'stargazing', rarity: 'uncommon' },
    aurora_shards: { label: 'Aurora Shards', sellPrice: 140, category: 'stargazing', rarity: 'rare' },
    deep_sky_maps: { label: 'Deep Sky Maps', sellPrice: 90, category: 'stargazing', rarity: 'uncommon' },
    ley_resonance: { label: 'Ley Resonance', sellPrice: 250, category: 'stargazing', rarity: 'rare' },
    blood_moon_dust: { label: 'Blood Moon Dust', sellPrice: 500, category: 'stargazing', rarity: 'rare' },
    void_fragments: { label: 'Void Fragments', sellPrice: 800, category: 'stargazing', rarity: 'very_rare' },
    worldshard: { label: 'Worldshard', sellPrice: 5000, category: 'stargazing', rarity: 'legendary' },

    // ── Herbalism ─────────────────────────────────────────────────────────────
    dried_herbs: { label: 'Dried Herbs', sellPrice: 6, category: 'herbalism', rarity: 'common' },
    berry_pulp: { label: 'Berry Pulp', sellPrice: 4, category: 'herbalism', rarity: 'common' },
    healing_poultice: { label: 'Healing Poultice', sellPrice: 18, category: 'herbalism', rarity: 'common' },
    resin_oil: { label: 'Resin Oil', sellPrice: 22, category: 'herbalism', rarity: 'common' },
    dried_mushrooms: { label: 'Dried Mushrooms', sellPrice: 12, category: 'herbalism', rarity: 'common' },
    herb_bundle: { label: 'Herb Bundle', sellPrice: 30, category: 'herbalism', rarity: 'common' },
    flower_essence: { label: 'Flower Essence', sellPrice: 50, category: 'herbalism', rarity: 'uncommon' },
    moss_paste: { label: 'Moss Paste', sellPrice: 40, category: 'herbalism', rarity: 'common' },
    moonbloom_essence: { label: 'Moonbloom Essence', sellPrice: 200, category: 'herbalism', rarity: 'rare' },
    dried_thornroot: { label: 'Dried Thornroot', sellPrice: 80, category: 'herbalism', rarity: 'uncommon' },
    glowcap_spores: { label: 'Glowcap Spores', sellPrice: 350, category: 'herbalism', rarity: 'rare' },
    heartroot_oil: { label: 'Heartroot Oil', sellPrice: 2500, category: 'herbalism', rarity: 'very_rare' },
    dew_crystals: { label: 'Dew Crystals', sellPrice: 180, category: 'herbalism', rarity: 'rare' },
    starfern_extract: { label: 'Starfern Extract', sellPrice: 600, category: 'herbalism', rarity: 'rare' },

    // ── Cultivation ───────────────────────────────────────────────────────────
    grown_herbs: { label: 'Grown Herbs', sellPrice: 5, category: 'cultivation', rarity: 'common' },
    fresh_wildberries: { label: 'Fresh Wildberries', sellPrice: 3, category: 'cultivation', rarity: 'common' },
    raw_fibre: { label: 'Raw Fibre', sellPrice: 4, category: 'cultivation', rarity: 'common' },
    cultivated_mushrooms: { label: 'Cultivated Mushrooms', sellPrice: 8, category: 'cultivation', rarity: 'common' },
    root_vegetables: { label: 'Root Vegetables', sellPrice: 6, category: 'cultivation', rarity: 'common' },
    cultivated_river_herbs: { label: 'Cultivated River Herbs', sellPrice: 14, category: 'cultivation', rarity: 'common' },
    autumn_herbs: { label: 'Autumn Herbs', sellPrice: 20, category: 'cultivation', rarity: 'common' },
    flowers: { label: 'Flowers', sellPrice: 8, category: 'cultivation', rarity: 'common' },
    petals: { label: 'Petals', sellPrice: 6, category: 'cultivation', rarity: 'common' },
    moonbloom: { label: 'Moonbloom', sellPrice: 70, category: 'cultivation', rarity: 'uncommon' },
    spirit_herbs: { label: 'Spirit Herbs', sellPrice: 400, category: 'cultivation', rarity: 'rare' },
    rootbloom: { label: 'Rootbloom', sellPrice: 3000, category: 'cultivation', rarity: 'very_rare' },

    // ── Woodcarving ───────────────────────────────────────────────────────────
    birch_bowl: { label: 'Birch Bowl', sellPrice: 8, category: 'woodcarving', rarity: 'common' },
    carved_tool: { label: 'Carved Tool', sellPrice: 12, category: 'woodcarving', rarity: 'common' },
    oak_stave: { label: 'Oak Stave', sellPrice: 20, category: 'woodcarving', rarity: 'common' },
    fish_trap: { label: 'Fish Trap', sellPrice: 35, category: 'woodcarving', rarity: 'common' },
    wooden_totem: { label: 'Wooden Totem', sellPrice: 50, category: 'woodcarving', rarity: 'common' },
    rune_staff: { label: 'Rune-Staff', sellPrice: 120, category: 'woodcarving', rarity: 'uncommon' },
    ironbark_shield: { label: 'Ironbark Shield', sellPrice: 280, category: 'woodcarving', rarity: 'uncommon' },
    ritual_mask: { label: 'Ritual Mask', sellPrice: 350, category: 'woodcarving', rarity: 'uncommon' },
    ironbark_spear: { label: 'Ironbark Spear', sellPrice: 300, category: 'woodcarving', rarity: 'uncommon' },
    witchwood_staff: { label: 'Witchwood Staff', sellPrice: 600, category: 'woodcarving', rarity: 'rare' },
    moonwood_bow: { label: 'Moonwood Bow', sellPrice: 1200, category: 'woodcarving', rarity: 'rare' },
    world_stave: { label: 'World-Stave', sellPrice: 10000, category: 'woodcarving', rarity: 'legendary' },

    // ── Cooking ───────────────────────────────────────────────────────────────
    roasted_fish: { label: 'Roasted Fish', sellPrice: 5, category: 'cooking', rarity: 'common' },
    berry_jam: { label: 'Berry Jam', sellPrice: 10, category: 'cooking', rarity: 'common' },
    mushroom_stew: { label: 'Mushroom Stew', sellPrice: 18, category: 'cooking', rarity: 'common' },
    root_bread: { label: 'Root Bread', sellPrice: 14, category: 'cooking', rarity: 'common' },
    smoked_fish: { label: 'Smoked Fish', sellPrice: 30, category: 'cooking', rarity: 'common' },
    herb_broth: { label: 'Herb Broth', sellPrice: 25, category: 'cooking', rarity: 'common' },
    crayfish_feast: { label: 'Crayfish Feast', sellPrice: 80, category: 'cooking', rarity: 'uncommon' },
    moonberry_pie: { label: 'Moonberry Pie', sellPrice: 120, category: 'cooking', rarity: 'uncommon' },
    winter_stew: { label: 'Winter Stew', sellPrice: 100, category: 'cooking', rarity: 'uncommon' },
    silverscale_sashimi: { label: 'Silverscale Sashimi', sellPrice: 200, category: 'cooking', rarity: 'rare' },
    forest_feast: { label: 'Forest Feast', sellPrice: 500, category: 'cooking', rarity: 'rare' },
    great_meal: { label: 'Great Meal', sellPrice: 2000, category: 'cooking', rarity: 'very_rare' },

    // ── Brewing ───────────────────────────────────────────────────────────────
    chamomile_tea: { label: 'Chamomile Tea', sellPrice: 20, category: 'brewing', rarity: 'common' },
    healing_draught: { label: 'Healing Draught', sellPrice: 45, category: 'brewing', rarity: 'common' },
    berry_wine: { label: 'Berry Wine', sellPrice: 30, category: 'brewing', rarity: 'common' },
    clarity_potion: { label: 'Clarity Potion', sellPrice: 90, category: 'brewing', rarity: 'uncommon' },
    thornroot_tonic: { label: 'Thornroot Tonic', sellPrice: 160, category: 'brewing', rarity: 'uncommon' },
    forest_spirit: { label: 'Forest Spirit', sellPrice: 200, category: 'brewing', rarity: 'uncommon' },
    moon_tea: { label: 'Moon Tea', sellPrice: 150, category: 'brewing', rarity: 'uncommon' },
    swiftness_elixir: { label: 'Swiftness Elixir', sellPrice: 220, category: 'brewing', rarity: 'rare' },
    autumn_tonic: { label: 'Autumn Tonic', sellPrice: 250, category: 'brewing', rarity: 'rare' },
    storm_draught: { label: 'Storm Draught', sellPrice: 350, category: 'brewing', rarity: 'rare' },
    starbloom_elixir: { label: 'Starbloom Elixir', sellPrice: 700, category: 'brewing', rarity: 'rare' },
    blood_moon_brew: { label: 'Blood Moon Brew', sellPrice: 1200, category: 'brewing', rarity: 'very_rare' },
    eternal_draught: { label: 'Eternal Draught', sellPrice: 8000, category: 'brewing', rarity: 'legendary' },

    // ── Weaving ───────────────────────────────────────────────────────────────
    reed_basket: { label: 'Reed Basket', sellPrice: 10, category: 'weaving', rarity: 'common' },
    fibre_thread: { label: 'Fibre Thread', sellPrice: 6, category: 'weaving', rarity: 'common' },

    // ── Runecrafting ──────────────────────────────────────────────────────────
    basic_rune: { label: 'Basic Rune', sellPrice: 30, category: 'runecrafting', rarity: 'common' },
    refined_herb_essence: { label: 'Refined Herb Essence', sellPrice: 80, category: 'alchemy', rarity: 'uncommon' },

    // ── Combat (base drops) ───────────────────────────────────────────────────
    sprite_dust: { label: 'Sprite Dust', sellPrice: 25, category: 'combat', rarity: 'common' },

    // ── Weaving ───────────────────────────────────────────────────────────────
    plain_cloth: { label: 'Plain Cloth', sellPrice: 8, category: 'weaving', rarity: 'common' },
    fishing_net: { label: 'Fishing Net', sellPrice: 40, category: 'weaving', rarity: 'common' },
    travellers_wrap: { label: "Traveller's Wrap", sellPrice: 60, category: 'weaving', rarity: 'common' },
    herb_pouches: { label: 'Herb Pouches', sellPrice: 35, category: 'weaving', rarity: 'common' },
    moon_cloth: { label: 'Moon Cloth', sellPrice: 150, category: 'weaving', rarity: 'uncommon' },
    ritual_robes: { label: 'Ritual Robes', sellPrice: 280, category: 'weaving', rarity: 'uncommon' },
    ironbark_vest: { label: 'Ironbark-Woven Vest', sellPrice: 500, category: 'weaving', rarity: 'rare' },
    witchwood_cloak: { label: 'Witchwood Cloak', sellPrice: 900, category: 'weaving', rarity: 'rare' },
    rootweave: { label: 'Rootweave', sellPrice: 5000, category: 'weaving', rarity: 'legendary' },

    // ── Runecrafting ──────────────────────────────────────────────────────────
    growth_rune: { label: 'Growth Rune', sellPrice: 35, category: 'runecrafting', rarity: 'common' },
    water_rune: { label: 'Water Rune', sellPrice: 40, category: 'runecrafting', rarity: 'common' },
    fire_rune: { label: 'Fire Rune', sellPrice: 45, category: 'runecrafting', rarity: 'common' },
    enchanted_tool: { label: 'Enchanted Tool', sellPrice: 80, category: 'runecrafting', rarity: 'uncommon' },
    moon_rune: { label: 'Moon Rune', sellPrice: 90, category: 'runecrafting', rarity: 'uncommon' },
    rune_totem: { label: 'Rune Totem', sellPrice: 150, category: 'runecrafting', rarity: 'uncommon' },
    storm_rune: { label: 'Storm Rune', sellPrice: 180, category: 'runecrafting', rarity: 'rare' },
    enchanted_armour: { label: 'Enchanted Armour', sellPrice: 400, category: 'runecrafting', rarity: 'rare' },
    void_rune: { label: 'Void Rune', sellPrice: 600, category: 'runecrafting', rarity: 'rare' },
    world_rune: { label: 'World-Rune', sellPrice: 1500, category: 'runecrafting', rarity: 'very_rare' },
    first_rune: { label: 'First Rune', sellPrice: 8000, category: 'runecrafting', rarity: 'legendary' },

    // ── Beastmastery ──────────────────────────────────────────────────────────
    rabbit_companion: { label: 'Rabbit Companion', sellPrice: 50, category: 'beastmastery', rarity: 'common' },
    fox_companion: { label: 'Forest Fox Companion', sellPrice: 120, category: 'beastmastery', rarity: 'uncommon' },
    owl_companion: { label: 'Owl Companion', sellPrice: 150, category: 'beastmastery', rarity: 'uncommon' },
    boar_companion: { label: 'Boar Companion', sellPrice: 200, category: 'beastmastery', rarity: 'uncommon' },
    otter_companion: { label: 'River Otter Companion', sellPrice: 180, category: 'beastmastery', rarity: 'uncommon' },
    bear_companion: { label: 'Forest Bear Companion', sellPrice: 400, category: 'beastmastery', rarity: 'rare' },
    moon_deer_companion: { label: 'Moon Deer Companion', sellPrice: 600, category: 'beastmastery', rarity: 'rare' },
    storm_eagle_companion: { label: 'Storm Eagle Companion', sellPrice: 900, category: 'beastmastery', rarity: 'rare' },
    ancient_stag_companion: { label: 'Ancient Stag Companion', sellPrice: 3000, category: 'beastmastery', rarity: 'legendary' },

    // ── Alchemy ───────────────────────────────────────────────────────────────
    pure_stardust: { label: 'Pure Stardust', sellPrice: 80, category: 'alchemy', rarity: 'uncommon' },
    ironbark_resin: { label: 'Ironbark Resin', sellPrice: 120, category: 'alchemy', rarity: 'uncommon' },
    moon_crystal: { label: 'Moon Crystal', sellPrice: 200, category: 'alchemy', rarity: 'rare' },
    refined_rune_shards: { label: 'Refined Rune Shards', sellPrice: 150, category: 'alchemy', rarity: 'uncommon' },
    void_essence: { label: 'Void Essence', sellPrice: 500, category: 'alchemy', rarity: 'rare' },
    liquid_moonwood: { label: 'Liquid Moonwood', sellPrice: 700, category: 'alchemy', rarity: 'rare' },
    aurora_crystals: { label: 'Aurora Crystals', sellPrice: 400, category: 'alchemy', rarity: 'rare' },
    spirit_essence: { label: 'Spirit Essence', sellPrice: 800, category: 'alchemy', rarity: 'very_rare' },
    distilled_heartroot: { label: 'Distilled Heartroot', sellPrice: 2000, category: 'alchemy', rarity: 'very_rare' },
    philosophers_dust: { label: "Philosopher's Dust", sellPrice: 9999, category: 'alchemy', rarity: 'legendary' },

    // ── Combat ────────────────────────────────────────────────────────────────
    boar_hide: { label: 'Boar Hide', sellPrice: 20, category: 'combat', rarity: 'common' },
    boar_tusk: { label: 'Boar Tusk', sellPrice: 35, category: 'combat', rarity: 'common' },
    corrupted_hide: { label: 'Corrupted Hide', sellPrice: 40, category: 'combat', rarity: 'common' },
    antler_shards: { label: 'Antler Shards', sellPrice: 25, category: 'combat', rarity: 'common' },
    stone_core: { label: 'Stone Core', sellPrice: 55, category: 'combat', rarity: 'uncommon' },
    rune_dust: { label: 'Rune Dust', sellPrice: 30, category: 'combat', rarity: 'common' },
    wolf_pelt: { label: 'Wolf Pelt', sellPrice: 70, category: 'combat', rarity: 'uncommon' },
    wolf_fang: { label: 'Wolf Fang', sellPrice: 45, category: 'combat', rarity: 'uncommon' },
    wraith_essence: { label: 'Wraith Essence', sellPrice: 120, category: 'combat', rarity: 'uncommon' },
    dark_herbs: { label: 'Dark Herbs', sellPrice: 40, category: 'combat', rarity: 'common' },
    ironbark_shards: { label: 'Ironbark Shards', sellPrice: 80, category: 'combat', rarity: 'uncommon' },
    guardian_core: { label: 'Guardian Core', sellPrice: 200, category: 'combat', rarity: 'rare' },
    witchwood_essence: { label: 'Witchwood Essence', sellPrice: 160, category: 'combat', rarity: 'uncommon' },
    stalker_pelt: { label: 'Stalker Pelt', sellPrice: 180, category: 'combat', rarity: 'uncommon' },
    moon_shards: { label: 'Moon Shards', sellPrice: 120, category: 'combat', rarity: 'uncommon' },
    phantom_dust: { label: 'Phantom Dust', sellPrice: 250, category: 'combat', rarity: 'rare' },
    titan_core: { label: 'Titan Core', sellPrice: 400, category: 'combat', rarity: 'rare' },
    storm_fragments: { label: 'Storm Fragments', sellPrice: 100, category: 'combat', rarity: 'uncommon' },
    serpent_scales: { label: 'Serpent Scales', sellPrice: 200, category: 'combat', rarity: 'rare' },
    venom_gland: { label: 'Venom Gland', sellPrice: 350, category: 'combat', rarity: 'rare' },
    void_crystal: { label: 'Void Crystal', sellPrice: 800, category: 'combat', rarity: 'very_rare' },
    walker_relic: { label: 'Walker Relic', sellPrice: 600, category: 'combat', rarity: 'very_rare' },
    worldheart: { label: 'Worldheart', sellPrice: 15000, category: 'combat', rarity: 'legendary' },

    // ── Rare drop-only items (not from normal output) ─────────────────────────
    wanderers_compass: { label: "Wanderer's Compass", sellPrice: 2000, category: 'foraging', rarity: 'legendary' },
    living_root: { label: 'Living Root', sellPrice: 5000, category: 'foraging', rarity: 'mythic' },
    twisted_branch: { label: 'Twisted Branch', sellPrice: 1000, category: 'woodcutting', rarity: 'legendary' },
    heartwood_core: { label: 'Heartwood Core', sellPrice: 5000, category: 'woodcutting', rarity: 'mythic' },
    ancient_fishing_hook: { label: 'Ancient Fishing Hook', sellPrice: 2000, category: 'fishing', rarity: 'legendary' },
    pearl_of_the_deep: { label: 'Pearl of the Deep', sellPrice: 1500, category: 'fishing', rarity: 'legendary' },
    leviathan_scale: { label: 'Leviathan Scale', sellPrice: 8000, category: 'fishing', rarity: 'mythic' },
    navigators_eye: { label: "Navigator's Eye", sellPrice: 2500, category: 'stargazing', rarity: 'legendary' },
    world_constellation_piece: { label: 'World Constellation Piece', sellPrice: 8000, category: 'stargazing', rarity: 'mythic' },
    druids_awakening_piece: { label: "Druid's Awakening Piece", sellPrice: 8000, category: 'herbalism', rarity: 'mythic' },
    ancient_warriors_shard: { label: "Ancient Warrior's Shard", sellPrice: 2500, category: 'combat', rarity: 'legendary' },
    void_blade_fragment: { label: 'Void Blade Fragment', sellPrice: 8000, category: 'combat', rarity: 'mythic' },
};

// Fallback price for any item not in the list
export const FALLBACK_PRICE = 1;

export function getItemDef(name: string): ItemDef | null {
    return ITEMS[name] ?? null;
}

export function getSellPrice(name: string): number {
    return ITEMS[name]?.sellPrice ?? FALLBACK_PRICE;
}

export function getItemLabel(name: string): string {
    return ITEMS[name]?.label ?? name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getTotalSellValue(inventory: Record<string, number>): number {
    return Object.entries(inventory).reduce((sum, [name, qty]) => sum + getSellPrice(name) * qty, 0);
}

// ── Shop items ────────────────────────────────────────────────────────────
// These are the buyable items. price = gold cost.
export interface ShopItem {
    id: string;
    label: string;
    price: number;
    category: 'boost' | 'lootbox' | 'utility';
    desc: string;
    oneTime: boolean;   // utility items can only be bought once
    effect?: string;    // machine-readable effect key
}

export const SHOP_ITEMS: ShopItem[] = [ //TODO: add more items here
    // Boosts
    { id: 'wanderers_focus', label: "Wanderer's Focus", price: 500, category: 'boost', desc: '+10% XP all skills, 30 min', oneTime: false, effect: 'xp_all_10_1800' },
    { id: 'seasons_blessing', label: "Season's Blessing", price: 1200, category: 'boost', desc: 'Current season bonuses doubled, 1 hour', oneTime: false, effect: 'season_double_3600' },
    { id: 'swift_hands', label: 'Swift Hands', price: 800, category: 'boost', desc: 'All action speed +15%, 20 min', oneTime: false, effect: 'speed_15_1200' },
    { id: 'forests_favour', label: "Forest's Favour", price: 3500, category: 'boost', desc: 'Rare drop chance doubled, 1 hour', oneTime: false, effect: 'drop_double_3600' },
    // Lootboxes
    { id: 'wanderers_satchel', label: "Wanderer's Satchel", price: 600, category: 'lootbox', desc: 'Common mats, occasional uncommon', oneTime: false },
    { id: 'grove_chest', label: 'Grove Chest', price: 2500, category: 'lootbox', desc: 'Uncommon–rare mats + small rare chance', oneTime: false },
    { id: 'moonlit_vault', label: 'Moonlit Vault', price: 8000, category: 'lootbox', desc: 'Rare–very rare, chance at legendary', oneTime: false },
    // Utility (one-time)
    { id: 'better_fishing_rod', label: 'Better Fishing Rod', price: 1000, category: 'utility', desc: 'Fishing duration −10%', oneTime: true, effect: 'fishing_speed_10' },
    { id: 'herb_drying_rack', label: 'Herb Drying Rack', price: 1500, category: 'utility', desc: 'Herbalism duration −15%', oneTime: true, effect: 'herbalism_speed_15' },
    { id: 'reinforced_cauldron', label: 'Reinforced Cauldron', price: 2000, category: 'utility', desc: 'Brewing duration −15%', oneTime: true, effect: 'brewing_speed_15' },
    { id: 'druids_clarity', label: "Druid's Clarity", price: 2000, category: 'utility', desc: 'Queue limit → 20', oneTime: true, effect: 'queue_limit_20' },
    { id: 'expanded_satchel', label: 'Expanded Satchel', price: 3000, category: 'utility', desc: 'Queue limit +5', oneTime: false, effect: 'queue_limit_5' },
    { id: 'field_journal', label: 'Field Journal', price: 5000, category: 'utility', desc: 'Shows drop rates in skill view', oneTime: true, effect: 'field_journal' },
];

export function getShopItem(id: string): ShopItem | null {
    return SHOP_ITEMS.find(i => i.id === id) ?? null;
}