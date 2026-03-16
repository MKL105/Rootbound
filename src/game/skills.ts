// src/game/skills.ts

import type { SkillDef, SkillAction } from '../types';

export const SKILLS: Record<string, SkillDef> = {

  foraging: {
    label:'Foraging', tier:1,
    description:'Gather plants, herbs, fungi, and seeds from the forest.',
    actions:[
      {name:'gather_wildberries',  label:'Gather Wildberries',  duration:6,  xp:10,  requires:[], output:[{item:'wildberries',qtyMin:1,qtyMax:3}]},
      {name:'gather_common_herbs', label:'Gather Common Herbs', duration:8,  xp:14,  requires:[{skill:'foraging',level:1}], output:[{item:'common_herbs',qtyMin:1,qtyMax:2}]},
      {name:'search_forest_floor', label:'Search Forest Floor', duration:10, xp:20,  requires:[{skill:'foraging',level:5}], output:[{item:'forest_mushrooms',qtyMin:0,qtyMax:1},{item:'bark_scraps',qtyMin:1,qtyMax:2}]},
      {name:'gather_mushrooms',    label:'Gather Mushrooms',    duration:10, xp:24,  requires:[{skill:'foraging',level:8}], output:[{item:'forest_mushrooms',qtyMin:1,qtyMax:3}]},
      {name:'collect_resin',       label:'Collect Resin',       duration:12, xp:32,  requires:[{skill:'foraging',level:12}], output:[{item:'tree_resin',qtyMin:1,qtyMax:2}]},
      {name:'gather_river_herbs',  label:'Gather River Herbs',  duration:12, xp:36,  requires:[{skill:'foraging',level:15},{skill:'fishing',level:10}], output:[{item:'river_herbs',qtyMin:1,qtyMax:2}]},
      {name:'forage_cave_moss',    label:'Forage Cave Moss',    duration:14, xp:48,  requires:[{skill:'foraging',level:20}], output:[{item:'cave_moss',qtyMin:1,qtyMax:2}]},
      {name:'gather_autumn_berries',label:'Gather Autumn Berries',duration:10,xp:55, requires:[{skill:'foraging',level:25}], season:'autumn', output:[{item:'autumn_berries',qtyMin:1,qtyMax:3}]},
      {name:'search_ancient_grove',label:'Search Ancient Grove',duration:18, xp:80,  requires:[{skill:'foraging',level:30}], output:[{item:'rare_seeds',qtyMin:0,qtyMax:1},{item:'ancient_bark',qtyMin:1,qtyMax:2}]},
      {name:'gather_moonbloom',    label:'Gather Moonbloom',    duration:20, xp:100, requires:[{skill:'foraging',level:35}], season:'winter', output:[{item:'moonbloom_petals',qtyMin:1,qtyMax:2}]},
      {name:'collect_dewdrops',    label:'Collect Dewdrops',    duration:16, xp:95,  requires:[{skill:'foraging',level:40}], season:'spring', output:[{item:'pure_dewdrops',qtyMin:1,qtyMax:2}]},
      {name:'gather_thornroot',    label:'Gather Thornroot',    duration:18, xp:110, requires:[{skill:'foraging',level:45}], output:[{item:'thornroot',qtyMin:1,qtyMax:2}]},
      {name:'forage_glowcaps',     label:'Forage Glowcaps',     duration:22, xp:150, requires:[{skill:'foraging',level:55},{skill:'ritualism',level:20}], output:[{item:'glowcap_fungi',qtyMin:1,qtyMax:2}]},
      {name:'harvest_starfern',    label:'Harvest Starfern',    duration:25, xp:200, requires:[{skill:'foraging',level:65},{skill:'stargazing',level:40}], output:[{item:'starfern_fronds',qtyMin:1,qtyMax:2}]},
      {name:'seek_the_heartroot',  label:'Seek the Heartroot',  duration:45, xp:400, requires:[{skill:'foraging',level:80},{skill:'ritualism',level:50}], output:[{item:'heartroot',qtyMin:0,qtyMax:1}]},
    ],
  },

  woodcutting: {
    label:'Woodcutting', tier:1,
    description:'Fell trees and harvest timber from the forest.',
    actions:[
      {name:'chop_birch',         label:'Chop Birch',         duration:8,  xp:12,  requires:[], output:[{item:'birch_logs',qtyMin:1,qtyMax:3}]},
      {name:'chop_oak',           label:'Chop Oak',           duration:10, xp:18,  requires:[{skill:'woodcutting',level:5}], output:[{item:'oak_logs',qtyMin:1,qtyMax:3}]},
      {name:'collect_bark',       label:'Collect Bark',       duration:8,  xp:15,  requires:[{skill:'woodcutting',level:8}], output:[{item:'thick_bark',qtyMin:2,qtyMax:4}]},
      {name:'chop_pine',          label:'Chop Pine',          duration:12, xp:28,  requires:[{skill:'woodcutting',level:15}], output:[{item:'pine_logs',qtyMin:1,qtyMax:2},{item:'pine_resin',qtyMin:0,qtyMax:1}]},
      {name:'gather_deadwood',    label:'Gather Deadwood',    duration:10, xp:32,  requires:[{skill:'woodcutting',level:20}], output:[{item:'deadwood',qtyMin:1,qtyMax:3},{item:'charcoal',qtyMin:0,qtyMax:1}]},
      {name:'chop_ashwood',       label:'Chop Ashwood',       duration:14, xp:50,  requires:[{skill:'woodcutting',level:28}], output:[{item:'ash_logs',qtyMin:1,qtyMax:2}]},
      {name:'tap_for_sap',        label:'Tap for Sap',        duration:16, xp:55,  requires:[{skill:'woodcutting',level:30}], output:[{item:'raw_sap',qtyMin:1,qtyMax:2}]},
      {name:'chop_ironbark',      label:'Chop Ironbark',      duration:18, xp:80,  requires:[{skill:'woodcutting',level:40}], output:[{item:'ironbark_logs',qtyMin:1,qtyMax:2}]},
      {name:'harvest_witchwood',  label:'Harvest Witchwood',  duration:22, xp:110, requires:[{skill:'woodcutting',level:50}], season:'autumn', output:[{item:'witchwood_logs',qtyMin:1,qtyMax:2}]},
      {name:'fell_ancientwood',   label:'Fell Ancientwood',   duration:28, xp:150, requires:[{skill:'woodcutting',level:60}], output:[{item:'ancient_logs',qtyMin:1,qtyMax:2}]},
      {name:'chop_moonwood',      label:'Chop Moonwood',      duration:30, xp:200, requires:[{skill:'woodcutting',level:72},{skill:'stargazing',level:50}], output:[{item:'moonwood_logs',qtyMin:1,qtyMax:2}]},
      {name:'find_the_rootwood',  label:'Find the Rootwood',  duration:50, xp:400, requires:[{skill:'woodcutting',level:85},{skill:'ritualism',level:60}], output:[{item:'rootwood',qtyMin:0,qtyMax:1}]},
    ],
  },

  fishing: {
    label:'Fishing', tier:1,
    description:'Cast your line in streams, ponds, and hidden springs.',
    actions:[
      {name:'fish_shallow_stream',label:'Fish Shallow Stream', duration:10, xp:12,  requires:[], output:[{item:'small_fish',qtyMin:1,qtyMax:2}]},
      {name:'gather_river_stones',label:'Gather River Stones', duration:8,  xp:8,   requires:[], output:[{item:'river_stones',qtyMin:2,qtyMax:4}]},
      {name:'net_common_fish',    label:'Net Common Fish',     duration:8,  xp:16,  requires:[{skill:'fishing',level:10},{skill:'weaving',level:15}], output:[{item:'common_fish',qtyMin:2,qtyMax:4}]},
      {name:'fish_forest_pond',   label:'Fish Forest Pond',   duration:12, xp:24,  requires:[{skill:'fishing',level:15}], output:[{item:'pond_fish',qtyMin:1,qtyMax:2}]},
      {name:'catch_crayfish',     label:'Catch Crayfish',     duration:12, xp:36,  requires:[{skill:'fishing',level:20}], season:'spring', output:[{item:'crayfish',qtyMin:1,qtyMax:3}]},
      {name:'deep_river_fishing', label:'Deep River Fishing', duration:16, xp:50,  requires:[{skill:'fishing',level:28}], output:[{item:'large_fish',qtyMin:1,qtyMax:2}]},
      {name:'ice_fish',           label:'Ice Fish',           duration:20, xp:70,  requires:[{skill:'fishing',level:35}], season:'winter', output:[{item:'icefish',qtyMin:1,qtyMax:2},{item:'frost_pearls',qtyMin:0,qtyMax:1}]},
      {name:'fish_moonlit_lake',  label:'Fish Moonlit Lake',  duration:18, xp:80,  requires:[{skill:'fishing',level:40}], output:[{item:'moonfish',qtyMin:1,qtyMax:2}]},
      {name:'catch_silverscale',  label:'Catch Silverscale',  duration:22, xp:110, requires:[{skill:'fishing',level:50}], output:[{item:'silverscale_fish',qtyMin:1,qtyMax:2}]},
      {name:'trawl_for_relics',   label:'Trawl for Relics',   duration:25, xp:120, requires:[{skill:'fishing',level:55}], output:[{item:'river_relics',qtyMin:0,qtyMax:1},{item:'odd_stones',qtyMin:1,qtyMax:2}]},
      {name:'fish_the_deep_pool', label:'Fish the Deep Pool', duration:28, xp:150, requires:[{skill:'fishing',level:65}], output:[{item:'deepfish',qtyMin:1,qtyMax:2}]},
      {name:'catch_shimmereel',   label:'Catch Shimmereel',   duration:32, xp:200, requires:[{skill:'fishing',level:75},{skill:'runecrafting',level:45}], output:[{item:'shimmereel',qtyMin:1,qtyMax:1}]},
      {name:'fish_hidden_spring', label:'Fish Hidden Spring', duration:45, xp:380, requires:[{skill:'fishing',level:85},{skill:'ritualism',level:55}], output:[{item:'spiritfish',qtyMin:0,qtyMax:1}]},
    ],
  },

  stargazing: {
    label:'Stargazing', tier:1,
    description:'Study the night sky. Mostly passive — runs comfortably overnight.',
    actions:[
      {name:'observe_stars',           label:'Observe Stars',           duration:15, xp:18,  requires:[], output:[{item:'stardust',qtyMin:1,qtyMax:2}]},
      {name:'chart_constellations',    label:'Chart Constellations',    duration:20, xp:35,  requires:[{skill:'stargazing',level:10}], output:[{item:'celestial_charts',qtyMin:1,qtyMax:1}]},
      {name:'track_moon_phases',       label:'Track Moon Phases',       duration:18, xp:42,  requires:[{skill:'stargazing',level:20}], output:[{item:'moon_phase_data',qtyMin:1,qtyMax:1}]},
      {name:'observe_wandering_stars', label:'Observe Wandering Stars', duration:22, xp:55,  requires:[{skill:'stargazing',level:28}], output:[{item:'wandering_stardust',qtyMin:1,qtyMax:2}]},
      {name:'read_the_aurora',         label:'Read the Aurora',         duration:30, xp:80,  requires:[{skill:'stargazing',level:35}], season:'winter', output:[{item:'aurora_shards',qtyMin:1,qtyMax:2}]},
      {name:'chart_deep_sky',          label:'Chart Deep Sky',          duration:28, xp:90,  requires:[{skill:'stargazing',level:45}], output:[{item:'deep_sky_maps',qtyMin:1,qtyMax:1}]},
      {name:'attune_to_ley_lines',     label:'Attune to Ley Lines',     duration:35, xp:120, requires:[{skill:'stargazing',level:55},{skill:'runecrafting',level:30}], output:[{item:'ley_resonance',qtyMin:1,qtyMax:1}]},
      {name:'observe_blood_moon',      label:'Observe Blood Moon',      duration:40, xp:160, requires:[{skill:'stargazing',level:60}], output:[{item:'blood_moon_dust',qtyMin:1,qtyMax:2}]},
      {name:'commune_with_void',       label:'Commune with the Void',   duration:50, xp:220, requires:[{skill:'stargazing',level:75},{skill:'ritualism',level:50}], output:[{item:'void_fragments',qtyMin:1,qtyMax:2}]},
      {name:'read_world_constellation',label:'Read World Constellation',duration:60, xp:400, requires:[{skill:'stargazing',level:90},{skill:'ritualism',level:70}], output:[{item:'worldshard',qtyMin:1,qtyMax:1}]},
    ],
  },

  herbalism: {
    label:'Herbalism', tier:2,
    description:'Process raw herbs and plants into useful ingredients.',
    actions:[
      {name:'dry_common_herbs',      label:'Dry Common Herbs',      duration:8,  xp:16,  requires:[{skill:'herbalism',level:1},{skill:'foraging',level:5}], output:[{item:'dried_herbs',qtyMin:1,qtyMax:2}]},
      {name:'crush_wildberries',     label:'Crush Wildberries',     duration:6,  xp:10,  requires:[{skill:'herbalism',level:1}], output:[{item:'berry_pulp',qtyMin:1,qtyMax:2}]},
      {name:'brew_poultice',         label:'Brew Poultice',         duration:12, xp:28,  requires:[{skill:'herbalism',level:8}], output:[{item:'healing_poultice',qtyMin:1,qtyMax:1}]},
      {name:'extract_resin_oil',     label:'Extract Resin Oil',     duration:14, xp:38,  requires:[{skill:'herbalism',level:12},{skill:'foraging',level:12}], output:[{item:'resin_oil',qtyMin:1,qtyMax:1}]},
      {name:'dry_mushrooms',         label:'Dry Mushrooms',         duration:10, xp:32,  requires:[{skill:'herbalism',level:15},{skill:'foraging',level:8}], output:[{item:'dried_mushrooms',qtyMin:1,qtyMax:2}]},
      {name:'make_herb_bundle',      label:'Make Herb Bundle',      duration:12, xp:40,  requires:[{skill:'herbalism',level:20}], output:[{item:'herb_bundle',qtyMin:1,qtyMax:1}]},
      {name:'extract_flower_essence',label:'Extract Flower Essence',duration:16, xp:60,  requires:[{skill:'herbalism',level:25}], output:[{item:'flower_essence',qtyMin:1,qtyMax:1}]},
      {name:'prepare_moss_paste',    label:'Prepare Moss Paste',    duration:18, xp:75,  requires:[{skill:'herbalism',level:30},{skill:'foraging',level:20}], output:[{item:'moss_paste',qtyMin:1,qtyMax:1}]},
      {name:'distill_moonbloom',     label:'Distill Moonbloom',     duration:22, xp:110, requires:[{skill:'herbalism',level:40},{skill:'foraging',level:35}], output:[{item:'moonbloom_essence',qtyMin:1,qtyMax:1}]},
      {name:'dry_thornroot',         label:'Dry Thornroot',         duration:18, xp:100, requires:[{skill:'herbalism',level:42}], output:[{item:'dried_thornroot',qtyMin:1,qtyMax:2}]},
      {name:'extract_glowcap_spores',label:'Extract Glowcap Spores',duration:26, xp:160, requires:[{skill:'herbalism',level:55},{skill:'foraging',level:55}], output:[{item:'glowcap_spores',qtyMin:1,qtyMax:1}]},
      {name:'render_heartroot_oil',  label:'Render Heartroot Oil',  duration:35, xp:240, requires:[{skill:'herbalism',level:65},{skill:'foraging',level:80}], output:[{item:'heartroot_oil',qtyMin:1,qtyMax:1}]},
      {name:'crystallise_dewdrops',  label:'Crystallise Dewdrops',  duration:30, xp:200, requires:[{skill:'herbalism',level:70},{skill:'foraging',level:40}], output:[{item:'dew_crystals',qtyMin:1,qtyMax:2}]},
      {name:'refine_starfern_extract',label:'Refine Starfern Extract',duration:40,xp:280,requires:[{skill:'herbalism',level:80},{skill:'foraging',level:65}], output:[{item:'starfern_extract',qtyMin:1,qtyMax:1}]},
    ],
  },

  cultivation: {
    label:'Cultivation', tier:2,
    description:'Plant and tend crops in your garden.',
    actions:[
      {name:'plant_herb_seeds',    label:'Plant Herb Seeds',    duration:20, xp:20,  requires:[{skill:'cultivation',level:1},{skill:'foraging',level:5}], output:[{item:'grown_herbs',qtyMin:1,qtyMax:3}]},
      {name:'grow_wildberries',    label:'Grow Wildberries',    duration:18, xp:18,  requires:[{skill:'cultivation',level:5}], output:[{item:'fresh_wildberries',qtyMin:2,qtyMax:4}]},
      {name:'grow_fibre_reeds',    label:'Grow Fibre Reeds',    duration:22, xp:28,  requires:[{skill:'cultivation',level:10}], output:[{item:'raw_fibre',qtyMin:2,qtyMax:3}]},
      {name:'tend_mushroom_patch', label:'Tend Mushroom Patch', duration:20, xp:32,  requires:[{skill:'cultivation',level:15},{skill:'foraging',level:8}], output:[{item:'cultivated_mushrooms',qtyMin:2,qtyMax:4}]},
      {name:'grow_root_vegetables',label:'Grow Root Vegetables',duration:22, xp:36,  requires:[{skill:'cultivation',level:18}], output:[{item:'root_vegetables',qtyMin:2,qtyMax:3}]},
      {name:'cultivate_river_herbs',label:'Cultivate River Herbs',duration:24,xp:48, requires:[{skill:'cultivation',level:22},{skill:'fishing',level:15}], output:[{item:'cultivated_river_herbs',qtyMin:1,qtyMax:2}]},
      {name:'grow_autumn_herbs',   label:'Grow Autumn Herbs',   duration:25, xp:60,  requires:[{skill:'cultivation',level:28}], season:'autumn', output:[{item:'autumn_herbs',qtyMin:1,qtyMax:3}]},
      {name:'tend_flower_garden',  label:'Tend Flower Garden',  duration:24, xp:65,  requires:[{skill:'cultivation',level:32}], output:[{item:'flowers',qtyMin:2,qtyMax:4}]},
      {name:'grow_moonbloom',      label:'Grow Moonbloom',      duration:35, xp:100, requires:[{skill:'cultivation',level:40},{skill:'foraging',level:35}], output:[{item:'moonbloom',qtyMin:1,qtyMax:2}]},
      {name:'cultivate_thornroot', label:'Cultivate Thornroot', duration:30, xp:110, requires:[{skill:'cultivation',level:48}], output:[{item:'thornroot',qtyMin:1,qtyMax:2}]},
      {name:'grow_starfern',       label:'Grow Starfern',       duration:40, xp:150, requires:[{skill:'cultivation',level:58},{skill:'stargazing',level:35}], output:[{item:'starfern_fronds',qtyMin:1,qtyMax:2}]},
      {name:'tend_spirit_garden',  label:'Tend Spirit Garden',  duration:45, xp:200, requires:[{skill:'cultivation',level:70},{skill:'ritualism',level:40}], output:[{item:'spirit_herbs',qtyMin:1,qtyMax:2}]},
      {name:'grow_the_rootbloom',  label:'Grow the Rootbloom',  duration:60, xp:380, requires:[{skill:'cultivation',level:85},{skill:'ritualism',level:65}], output:[{item:'rootbloom',qtyMin:0,qtyMax:1}]},
    ],
  },

  woodcarving: {
    label:'Woodcarving', tier:2,
    description:'Shape timber into tools, weapons, and ritual objects.',
    actions:[
      {name:'carve_birch_bowl',    label:'Carve Birch Bowl',    duration:10, xp:18,  requires:[{skill:'woodcarving',level:1},{skill:'woodcutting',level:1}], output:[{item:'birch_bowl',qtyMin:1,qtyMax:1}]},
      {name:'whittle_a_tool',      label:'Whittle a Tool',      duration:10, xp:20,  requires:[{skill:'woodcarving',level:5}], output:[{item:'carved_tool',qtyMin:1,qtyMax:1}]},
      {name:'carve_oak_stave',     label:'Carve Oak Stave',     duration:14, xp:32,  requires:[{skill:'woodcarving',level:10},{skill:'woodcutting',level:5}], output:[{item:'oak_stave',qtyMin:1,qtyMax:1}]},
      {name:'craft_fishing_trap',  label:'Craft Fishing Trap',  duration:16, xp:45,  requires:[{skill:'woodcarving',level:15}], output:[{item:'fish_trap',qtyMin:1,qtyMax:1}]},
      {name:'carve_totem',         label:'Carve Totem',         duration:18, xp:55,  requires:[{skill:'woodcarving',level:20}], output:[{item:'wooden_totem',qtyMin:1,qtyMax:1}]},
      {name:'carve_ash_rune_staff',label:'Carve Ash Rune-Staff',duration:22, xp:80,  requires:[{skill:'woodcarving',level:28},{skill:'woodcutting',level:28}], output:[{item:'rune_staff',qtyMin:1,qtyMax:1}]},
      {name:'craft_ironbark_shield',label:'Craft Ironbark Shield',duration:28,xp:110,requires:[{skill:'woodcarving',level:38},{skill:'woodcutting',level:40}], output:[{item:'ironbark_shield',qtyMin:1,qtyMax:1}]},
      {name:'carve_ritual_mask',   label:'Carve Ritual Mask',   duration:30, xp:120, requires:[{skill:'woodcarving',level:45},{skill:'ritualism',level:20}], output:[{item:'ritual_mask',qtyMin:1,qtyMax:1}]},
      {name:'craft_ironbark_spear',label:'Craft Ironbark Spear',duration:30, xp:120, requires:[{skill:'woodcarving',level:50},{skill:'woodcutting',level:40}], output:[{item:'ironbark_spear',qtyMin:1,qtyMax:1}]},
      {name:'carve_witchwood_staff',label:'Carve Witchwood Staff',duration:35,xp:160,requires:[{skill:'woodcarving',level:60},{skill:'woodcutting',level:50}], output:[{item:'witchwood_staff',qtyMin:1,qtyMax:1}]},
      {name:'carve_moonwood_bow',  label:'Carve Moonwood Bow',  duration:40, xp:210, requires:[{skill:'woodcarving',level:72},{skill:'woodcutting',level:72}], output:[{item:'moonwood_bow',qtyMin:1,qtyMax:1}]},
      {name:'carve_the_world_stave',label:'Carve the World-Stave',duration:60,xp:420,requires:[{skill:'woodcarving',level:88},{skill:'woodcutting',level:85},{skill:'ritualism',level:70}], output:[{item:'world_stave',qtyMin:1,qtyMax:1}]},
    ],
  },

  cooking: {
    label:'Cooking', tier:2,
    description:'Prepare meals that grant temporary XP and speed bonuses.',
    actions:[
      {name:'roast_small_fish',    label:'Roast Small Fish',    duration:8,  xp:14,  requires:[{skill:'cooking',level:1},{skill:'fishing',level:1}], output:[{item:'roasted_fish',qtyMin:1,qtyMax:1}]},
      {name:'make_berry_jam',      label:'Make Berry Jam',      duration:10, xp:18,  requires:[{skill:'cooking',level:5},{skill:'foraging',level:5}], output:[{item:'berry_jam',qtyMin:1,qtyMax:1}]},
      {name:'cook_mushroom_stew',  label:'Cook Mushroom Stew',  duration:12, xp:28,  requires:[{skill:'cooking',level:10},{skill:'foraging',level:8}], output:[{item:'mushroom_stew',qtyMin:1,qtyMax:1}]},
      {name:'bake_root_bread',     label:'Bake Root Bread',     duration:14, xp:38,  requires:[{skill:'cooking',level:15},{skill:'cultivation',level:18}], output:[{item:'root_bread',qtyMin:1,qtyMax:2}]},
      {name:'smoke_large_fish',    label:'Smoke Large Fish',    duration:18, xp:55,  requires:[{skill:'cooking',level:20},{skill:'fishing',level:28}], output:[{item:'smoked_fish',qtyMin:1,qtyMax:2}]},
      {name:'brew_herb_broth',     label:'Brew Herb Broth',     duration:16, xp:50,  requires:[{skill:'cooking',level:25},{skill:'herbalism',level:20}], output:[{item:'herb_broth',qtyMin:1,qtyMax:1}]},
      {name:'cook_crayfish_feast', label:'Cook Crayfish Feast', duration:20, xp:80,  requires:[{skill:'cooking',level:32},{skill:'fishing',level:20}], season:'spring', output:[{item:'crayfish_feast',qtyMin:1,qtyMax:1}]},
      {name:'bake_moonberry_pie',  label:'Bake Moonberry Pie',  duration:25, xp:100, requires:[{skill:'cooking',level:40},{skill:'foraging',level:35}], output:[{item:'moonberry_pie',qtyMin:1,qtyMax:1}]},
      {name:'prepare_winter_stew', label:'Prepare Winter Stew', duration:28, xp:120, requires:[{skill:'cooking',level:48}], season:'winter', output:[{item:'winter_stew',qtyMin:1,qtyMax:1}]},
      {name:'cook_silverscale_sashimi',label:'Cook Silverscale Sashimi',duration:30,xp:150,requires:[{skill:'cooking',level:55},{skill:'fishing',level:50}],output:[{item:'silverscale_sashimi',qtyMin:1,qtyMax:1}]},
      {name:'feast_of_the_forest', label:'Feast of the Forest', duration:40, xp:220, requires:[{skill:'cooking',level:68},{skill:'cultivation',level:58}], output:[{item:'forest_feast',qtyMin:1,qtyMax:1}]},
      {name:'prepare_the_great_meal',label:'Prepare the Great Meal',duration:55,xp:360,requires:[{skill:'cooking',level:82},{skill:'cultivation',level:70},{skill:'fishing',level:65}],output:[{item:'great_meal',qtyMin:1,qtyMax:1}]},
    ],
  },

  brewing: {
    label:'Brewing', tier:3,
    description:'Brew potions, teas, and elixirs from processed ingredients.',
    actions:[
      {name:'brew_chamomile_tea',   label:'Brew Chamomile Tea',   duration:12, xp:22,  requires:[{skill:'brewing',level:1},{skill:'herbalism',level:1}], output:[{item:'chamomile_tea',qtyMin:1,qtyMax:1}]},
      {name:'brew_healing_draught', label:'Brew Healing Draught', duration:14, xp:35,  requires:[{skill:'brewing',level:8},{skill:'herbalism',level:8}], output:[{item:'healing_draught',qtyMin:1,qtyMax:1}]},
      {name:'ferment_berry_wine',   label:'Ferment Berry Wine',   duration:18, xp:45,  requires:[{skill:'brewing',level:12},{skill:'cooking',level:5}], output:[{item:'berry_wine',qtyMin:1,qtyMax:2}]},
      {name:'brew_clarity_potion',  label:'Brew Clarity Potion',  duration:20, xp:65,  requires:[{skill:'brewing',level:18},{skill:'herbalism',level:20}], output:[{item:'clarity_potion',qtyMin:1,qtyMax:1}]},
      {name:'brew_thornroot_tonic', label:'Brew Thornroot Tonic', duration:22, xp:85,  requires:[{skill:'brewing',level:25},{skill:'herbalism',level:42}], output:[{item:'thornroot_tonic',qtyMin:1,qtyMax:1}]},
      {name:'distill_forest_spirit',label:'Distill Forest Spirit',duration:28, xp:110, requires:[{skill:'brewing',level:30},{skill:'woodcutting',level:28}], output:[{item:'forest_spirit',qtyMin:1,qtyMax:1}]},
      {name:'brew_moon_tea',        label:'Brew Moon Tea',        duration:25, xp:100, requires:[{skill:'brewing',level:35},{skill:'herbalism',level:40}], output:[{item:'moon_tea',qtyMin:1,qtyMax:1}]},
      {name:'brew_swiftness_elixir',label:'Brew Swiftness Elixir',duration:28, xp:120, requires:[{skill:'brewing',level:40},{skill:'herbalism',level:25}], output:[{item:'swiftness_elixir',qtyMin:1,qtyMax:1}]},
      {name:'brew_autumn_tonic',    label:'Brew Autumn Tonic',    duration:30, xp:140, requires:[{skill:'brewing',level:45}], season:'autumn', output:[{item:'autumn_tonic',qtyMin:1,qtyMax:1}]},
      {name:'brew_storm_draught',   label:'Brew Storm Draught',   duration:32, xp:170, requires:[{skill:'brewing',level:52},{skill:'herbalism',level:55}], output:[{item:'storm_draught',qtyMin:1,qtyMax:1}]},
      {name:'brew_starbloom_elixir',label:'Brew Starbloom Elixir',duration:38, xp:220, requires:[{skill:'brewing',level:62},{skill:'herbalism',level:65},{skill:'stargazing',level:40}], output:[{item:'starbloom_elixir',qtyMin:1,qtyMax:1}]},
      {name:'brew_blood_moon_brew', label:'Brew Blood Moon Brew', duration:45, xp:280, requires:[{skill:'brewing',level:72}], output:[{item:'blood_moon_brew',qtyMin:1,qtyMax:1}]},
      {name:'brew_eternal_draught', label:'Brew Eternal Draught', duration:60, xp:450, requires:[{skill:'brewing',level:90},{skill:'alchemy',level:70}], output:[{item:'eternal_draught',qtyMin:1,qtyMax:1}]},
    ],
  },

  // ── Tier 3 ────────────────────────────────────────────────────────────────

  weaving: {
    label:'Weaving', tier:3,
    description:'Spin fibres into cloth, gear, and fishing nets.',
    actions:[
      {name:'weave_reed_basket',      label:'Weave Reed Basket',      duration:10, xp:18,  requires:[{skill:'weaving',level:1},{skill:'cultivation',level:10}], output:[{item:'reed_basket',qtyMin:1,qtyMax:1}]},
      {name:'spin_fibre_thread',      label:'Spin Fibre Thread',      duration:12, xp:22,  requires:[{skill:'weaving',level:5},{skill:'cultivation',level:10}], output:[{item:'fibre_thread',qtyMin:1,qtyMax:2}]},
      {name:'weave_simple_cloth',     label:'Weave Simple Cloth',     duration:14, xp:30,  requires:[{skill:'weaving',level:10}], output:[{item:'plain_cloth',qtyMin:1,qtyMax:2}]},
      {name:'craft_fishing_net',      label:'Craft Fishing Net',      duration:18, xp:45,  requires:[{skill:'weaving',level:15}], output:[{item:'fishing_net',qtyMin:1,qtyMax:1}]},
      {name:'weave_travellers_wrap',  label:"Weave Traveller's Wrap", duration:20, xp:55,  requires:[{skill:'weaving',level:22}], output:[{item:'travellers_wrap',qtyMin:1,qtyMax:1}]},
      {name:'craft_herb_pouches',     label:'Craft Herb Pouches',     duration:18, xp:60,  requires:[{skill:'weaving',level:28},{skill:'herbalism',level:20}], output:[{item:'herb_pouches',qtyMin:1,qtyMax:2}]},
      {name:'weave_moon_cloth',       label:'Weave Moon Cloth',       duration:26, xp:85,  requires:[{skill:'weaving',level:35},{skill:'stargazing',level:25}], season:'winter', output:[{item:'moon_cloth',qtyMin:1,qtyMax:1}]},
      {name:'weave_ritual_robes',     label:'Weave Ritual Robes',     duration:32, xp:120, requires:[{skill:'weaving',level:45},{skill:'runecrafting',level:25}], output:[{item:'ritual_robes',qtyMin:1,qtyMax:1}]},
      {name:'craft_ironbark_vest',    label:'Craft Ironbark-Woven Vest',duration:36,xp:160,requires:[{skill:'weaving',level:55},{skill:'woodcutting',level:40}], output:[{item:'ironbark_vest',qtyMin:1,qtyMax:1}]},
      {name:'weave_witchwood_cloak',  label:'Weave Witchwood Cloak',  duration:42, xp:210, requires:[{skill:'weaving',level:68},{skill:'woodcutting',level:50}], output:[{item:'witchwood_cloak',qtyMin:1,qtyMax:1}]},
      {name:'weave_the_rootweave',    label:'Weave the Rootweave',    duration:58, xp:380, requires:[{skill:'weaving',level:82},{skill:'runecrafting',level:60},{skill:'cultivation',level:85}], output:[{item:'rootweave',qtyMin:1,qtyMax:1}]},
    ],
  },

  runecrafting: {
    label:'Runecrafting', tier:3,
    description:'Inscribe runes onto carved items using stardust.',
    actions:[
      {name:'carve_basic_rune',       label:'Carve Basic Rune',       duration:14, xp:28,  requires:[{skill:'runecrafting',level:1},{skill:'woodcarving',level:5},{skill:'stargazing',level:1}], output:[{item:'basic_rune',qtyMin:1,qtyMax:1}]},
      {name:'inscribe_growth_rune',   label:'Inscribe Growth Rune',   duration:16, xp:38,  requires:[{skill:'runecrafting',level:8}], output:[{item:'growth_rune',qtyMin:1,qtyMax:1}]},
      {name:'inscribe_water_rune',    label:'Inscribe Water Rune',    duration:18, xp:50,  requires:[{skill:'runecrafting',level:12},{skill:'fishing',level:10}], output:[{item:'water_rune',qtyMin:1,qtyMax:1}]},
      {name:'inscribe_fire_rune',     label:'Inscribe Fire Rune',     duration:20, xp:65,  requires:[{skill:'runecrafting',level:18},{skill:'brewing',level:12}], output:[{item:'fire_rune',qtyMin:1,qtyMax:1}]},
      {name:'enchant_a_tool',         label:'Enchant a Tool',         duration:22, xp:80,  requires:[{skill:'runecrafting',level:22}], output:[{item:'enchanted_tool',qtyMin:1,qtyMax:1}]},
      {name:'inscribe_moon_rune',     label:'Inscribe Moon Rune',     duration:25, xp:100, requires:[{skill:'runecrafting',level:28},{skill:'stargazing',level:20}], output:[{item:'moon_rune',qtyMin:1,qtyMax:1}]},
      {name:'craft_rune_totem',       label:'Craft Rune Totem',       duration:28, xp:120, requires:[{skill:'runecrafting',level:35},{skill:'woodcarving',level:20}], output:[{item:'rune_totem',qtyMin:1,qtyMax:1}]},
      {name:'inscribe_storm_rune',    label:'Inscribe Storm Rune',    duration:30, xp:150, requires:[{skill:'runecrafting',level:42},{skill:'stargazing',level:35}], output:[{item:'storm_rune',qtyMin:1,qtyMax:1}]},
      {name:'enchant_armour',         label:'Enchant Armour',         duration:35, xp:190, requires:[{skill:'runecrafting',level:50},{skill:'weaving',level:45}], output:[{item:'enchanted_armour',qtyMin:1,qtyMax:1}]},
      {name:'inscribe_void_rune',     label:'Inscribe the Void Rune', duration:40, xp:240, requires:[{skill:'runecrafting',level:60},{skill:'stargazing',level:55}], output:[{item:'void_rune',qtyMin:1,qtyMax:1}]},
      {name:'carve_world_rune',       label:'Carve World-Rune',       duration:48, xp:310, requires:[{skill:'runecrafting',level:75},{skill:'woodcarving',level:72},{skill:'stargazing',level:60}], output:[{item:'world_rune',qtyMin:1,qtyMax:1}]},
      {name:'inscribe_the_first_rune',label:'Inscribe the First Rune',duration:65, xp:450, requires:[{skill:'runecrafting',level:90},{skill:'ritualism',level:75}], output:[{item:'first_rune',qtyMin:1,qtyMax:1}]},
    ],
  },

  // ── Tier 4 ────────────────────────────────────────────────────────────────

  beastmastery: {
    label:'Beastmastery', tier:4,
    description:'Tame and bond with forest creatures for passive bonuses and combat allies.',
    actions:[
      {name:'observe_forest_animals', label:'Observe Forest Animals', duration:12, xp:20,  requires:[{skill:'beastmastery',level:1},{skill:'foraging',level:10}], output:[]},
      {name:'leave_offering',         label:'Leave Offering',         duration:10, xp:18,  requires:[{skill:'beastmastery',level:5},{skill:'cultivation',level:10}], output:[]},
      {name:'tame_a_rabbit',          label:'Tame a Rabbit',          duration:20, xp:40,  requires:[{skill:'beastmastery',level:10}], output:[{item:'rabbit_companion',qtyMin:1,qtyMax:1}]},
      {name:'befriend_forest_fox',    label:'Befriend Forest Fox',    duration:28, xp:70,  requires:[{skill:'beastmastery',level:18},{skill:'foraging',level:20}], output:[{item:'fox_companion',qtyMin:1,qtyMax:1}]},
      {name:'bond_with_owl',          label:'Bond with Owl',          duration:30, xp:90,  requires:[{skill:'beastmastery',level:25},{skill:'stargazing',level:15}], output:[{item:'owl_companion',qtyMin:1,qtyMax:1}]},
      {name:'tame_wild_boar',         label:'Tame Wild Boar',         duration:35, xp:120, requires:[{skill:'beastmastery',level:35},{skill:'cooking',level:25}], output:[{item:'boar_companion',qtyMin:1,qtyMax:1}]},
      {name:'bond_with_river_otter',  label:'Bond with River Otter',  duration:32, xp:110, requires:[{skill:'beastmastery',level:40},{skill:'fishing',level:35}], output:[{item:'otter_companion',qtyMin:1,qtyMax:1}]},
      {name:'tame_forest_bear',       label:'Tame Forest Bear',       duration:45, xp:180, requires:[{skill:'beastmastery',level:52},{skill:'combat',level:20}], output:[{item:'bear_companion',qtyMin:1,qtyMax:1}]},
      {name:'bond_with_moon_deer',    label:'Bond with Moon Deer',    duration:50, xp:220, requires:[{skill:'beastmastery',level:60},{skill:'ritualism',level:35}], season:'winter', output:[{item:'moon_deer_companion',qtyMin:1,qtyMax:1}]},
      {name:'tame_storm_eagle',       label:'Tame Storm Eagle',       duration:55, xp:280, requires:[{skill:'beastmastery',level:72},{skill:'combat',level:40}], output:[{item:'storm_eagle_companion',qtyMin:1,qtyMax:1}]},
      {name:'bond_with_ancient_stag', label:'Bond with Ancient Stag', duration:70, xp:420, requires:[{skill:'beastmastery',level:88},{skill:'ritualism',level:65}], output:[{item:'ancient_stag_companion',qtyMin:1,qtyMax:1}]},
    ],
  },

  alchemy: {
    label:'Alchemy', tier:4,
    description:'Transmute materials into rarer and more powerful substances.',
    actions:[
      {name:'transmute_common_herbs', label:'Transmute Common Herbs', duration:20, xp:40,  requires:[{skill:'alchemy',level:1},{skill:'brewing',level:20},{skill:'runecrafting',level:15}], output:[{item:'refined_herb_essence',qtyMin:1,qtyMax:1}]},
      {name:'refine_stardust',        label:'Refine Stardust',        duration:22, xp:55,  requires:[{skill:'alchemy',level:8},{skill:'stargazing',level:25}], output:[{item:'pure_stardust',qtyMin:1,qtyMax:1}]},
      {name:'transmute_to_charcoal',  label:'Transmute Logs to Charcoal',duration:18,xp:45,requires:[{skill:'alchemy',level:12}], output:[{item:'charcoal',qtyMin:2,qtyMax:4}]},
      {name:'transmute_ironbark',     label:'Transmute Ironbark',     duration:26, xp:80,  requires:[{skill:'alchemy',level:18},{skill:'woodcutting',level:40}], output:[{item:'ironbark_resin',qtyMin:1,qtyMax:1}]},
      {name:'crystallise_moon_water', label:'Crystallise Moon Water', duration:30, xp:110, requires:[{skill:'alchemy',level:25},{skill:'brewing',level:35}], output:[{item:'moon_crystal',qtyMin:1,qtyMax:1}]},
      {name:'transmute_rune_shards',  label:'Transmute Rune Shards',  duration:32, xp:130, requires:[{skill:'alchemy',level:32},{skill:'runecrafting',level:35}], output:[{item:'refined_rune_shards',qtyMin:1,qtyMax:2}]},
      {name:'refine_void_fragments',  label:'Refine Void Fragments',  duration:38, xp:180, requires:[{skill:'alchemy',level:42},{skill:'stargazing',level:55}], output:[{item:'void_essence',qtyMin:1,qtyMax:1}]},
      {name:'transmute_rare_woods',   label:'Transmute Rare Woods',   duration:40, xp:210, requires:[{skill:'alchemy',level:50},{skill:'woodcutting',level:72}], output:[{item:'liquid_moonwood',qtyMin:1,qtyMax:1}]},
      {name:'crystallise_aurora',     label:'Crystallise Aurora Shards',duration:42,xp:240,requires:[{skill:'alchemy',level:58},{skill:'stargazing',level:35}], output:[{item:'aurora_crystals',qtyMin:1,qtyMax:1}]},
      {name:'transmute_spirit_herbs', label:'Transmute Spirit Herbs', duration:48, xp:290, requires:[{skill:'alchemy',level:68},{skill:'cultivation',level:70}], output:[{item:'spirit_essence',qtyMin:1,qtyMax:1}]},
      {name:'refine_heartroot_oil',   label:'Refine Heartroot Oil',   duration:55, xp:360, requires:[{skill:'alchemy',level:78},{skill:'herbalism',level:65}], output:[{item:'distilled_heartroot',qtyMin:1,qtyMax:1}]},
      {name:'transmute_worldshard',   label:'Transmute the Worldshard',duration:75,xp:500, requires:[{skill:'alchemy',level:92},{skill:'stargazing',level:90}], output:[{item:'philosophers_dust',qtyMin:1,qtyMax:1}]},
    ],
  },

  ritualism: {
    label:'Ritualism', tier:4,
    description:'Perform ancient rites to invoke powerful temporary blessings.',
    actions:[
      {name:'perform_blessing_rite',  label:'Perform Blessing Rite',  duration:30, xp:55,  requires:[{skill:'ritualism',level:1},{skill:'runecrafting',level:15},{skill:'brewing',level:18}], output:[]},
      {name:'invoke_growth_moon',     label:'Invoke the Growth Moon', duration:35, xp:75,  requires:[{skill:'ritualism',level:8},{skill:'stargazing',level:20}], output:[]},
      {name:'perform_river_rite',     label:'Perform the River Rite', duration:35, xp:80,  requires:[{skill:'ritualism',level:12},{skill:'fishing',level:25}], output:[]},
      {name:'perform_autumn_rite',    label:'Perform Autumn Rite',    duration:40, xp:100, requires:[{skill:'ritualism',level:18}], season:'autumn', output:[]},
      {name:'invoke_the_storm',       label:'Invoke the Storm',       duration:45, xp:120, requires:[{skill:'ritualism',level:25},{skill:'stargazing',level:35}], output:[]},
      {name:'commune_with_ancestors', label:'Commune with Ancestors', duration:50, xp:150, requires:[{skill:'ritualism',level:30},{skill:'beastmastery',level:25}], output:[]},
      {name:'perform_solstice_rite',  label:'Perform Solstice Rite',  duration:60, xp:200, requires:[{skill:'ritualism',level:38}], output:[]},
      {name:'invoke_moons_embrace',   label:"Invoke Moon's Embrace",  duration:55, xp:170, requires:[{skill:'ritualism',level:45},{skill:'stargazing',level:45}], season:'winter', output:[]},
      {name:'perform_blood_rite',     label:'Perform the Blood Rite', duration:60, xp:200, requires:[{skill:'ritualism',level:55},{skill:'combat',level:25}], output:[]},
      {name:'invoke_ancient_forest',  label:'Invoke the Ancient Forest',duration:65,xp:240,requires:[{skill:'ritualism',level:62},{skill:'beastmastery',level:52}], output:[]},
      {name:'perform_void_rite',      label:'Perform the Void Rite',  duration:70, xp:290, requires:[{skill:'ritualism',level:72},{skill:'stargazing',level:75}], output:[]},
      {name:'invoke_the_world_tree',  label:'Invoke the World Tree',  duration:80, xp:360, requires:[{skill:'ritualism',level:85},{skill:'woodcutting',level:85},{skill:'woodcarving',level:88}], output:[]},
      {name:'the_first_rite',         label:'The First Rite',         duration:120,xp:600, requires:[{skill:'ritualism',level:98}], output:[]},
    ],
  },

  combat: {
    label:'Combat', tier:4,
    description:'Fight corrupted beasts deep in the dark forest zones.',
    actions:[
      {name:'fight_forest_sprites',   label:'Fight Forest Sprites',   duration:20, xp:45,  requires:[{skill:'combat',level:1},{skill:'woodcarving',level:10}], output:[{item:'sprite_dust',qtyMin:1,qtyMax:2}]},
      {name:'hunt_wild_boar',         label:'Hunt Wild Boar',         duration:25, xp:65,  requires:[{skill:'combat',level:5},{skill:'woodcarving',level:15}], output:[{item:'boar_hide',qtyMin:1,qtyMax:1},{item:'boar_tusk',qtyMin:0,qtyMax:1}]},
      {name:'fight_corrupted_deer',   label:'Fight Corrupted Deer',   duration:28, xp:85,  requires:[{skill:'combat',level:12}], output:[{item:'corrupted_hide',qtyMin:1,qtyMax:1},{item:'antler_shards',qtyMin:1,qtyMax:2}]},
      {name:'battle_stone_golems',    label:'Battle Stone Golems',    duration:32, xp:110, requires:[{skill:'combat',level:18},{skill:'woodcarving',level:28}], output:[{item:'stone_core',qtyMin:1,qtyMax:1},{item:'rune_dust',qtyMin:1,qtyMax:2}]},
      {name:'hunt_thornback_wolf',    label:'Hunt Thornback Wolf',    duration:35, xp:140, requires:[{skill:'combat',level:25},{skill:'brewing',level:25}], output:[{item:'wolf_pelt',qtyMin:1,qtyMax:1},{item:'wolf_fang',qtyMin:0,qtyMax:2}]},
      {name:'fight_bog_wraith',       label:'Fight Bog Wraith',       duration:38, xp:170, requires:[{skill:'combat',level:30},{skill:'runecrafting',level:28}], output:[{item:'wraith_essence',qtyMin:1,qtyMax:1},{item:'dark_herbs',qtyMin:1,qtyMax:2}]},
      {name:'battle_ironbark_guardian',label:'Battle Ironbark Guardian',duration:42,xp:210,requires:[{skill:'combat',level:38},{skill:'woodcarving',level:38}], output:[{item:'ironbark_shards',qtyMin:1,qtyMax:2},{item:'guardian_core',qtyMin:0,qtyMax:1}]},
      {name:'hunt_witchwood_stalker', label:'Hunt Witchwood Stalker', duration:48, xp:260, requires:[{skill:'combat',level:45}], season:'autumn', output:[{item:'witchwood_essence',qtyMin:1,qtyMax:1},{item:'stalker_pelt',qtyMin:1,qtyMax:1}]},
      {name:'fight_moon_phantom',     label:'Fight Moon Phantom',     duration:52, xp:310, requires:[{skill:'combat',level:55},{skill:'ritualism',level:30}], output:[{item:'moon_shards',qtyMin:1,qtyMax:2},{item:'phantom_dust',qtyMin:1,qtyMax:1}]},
      {name:'battle_storm_titan',     label:'Battle the Storm Titan', duration:58, xp:380, requires:[{skill:'combat',level:65},{skill:'runecrafting',level:50}], output:[{item:'titan_core',qtyMin:1,qtyMax:1},{item:'storm_fragments',qtyMin:2,qtyMax:4}]},
      {name:'hunt_ancient_serpent',   label:'Hunt the Ancient Serpent',duration:65,xp:460, requires:[{skill:'combat',level:75},{skill:'beastmastery',level:55}], output:[{item:'serpent_scales',qtyMin:1,qtyMax:3},{item:'venom_gland',qtyMin:0,qtyMax:1}]},
      {name:'fight_void_walker',      label:'Fight the Void Walker',  duration:72, xp:550, requires:[{skill:'combat',level:85},{skill:'alchemy',level:60},{skill:'runecrafting',level:75}], output:[{item:'void_crystal',qtyMin:1,qtyMax:1},{item:'walker_relic',qtyMin:0,qtyMax:1}]},
      {name:'face_corrupted_world_tree',label:'Face the Corrupted World Tree',duration:90,xp:800,requires:[{skill:'combat',level:95},{skill:'ritualism',level:85}], output:[{item:'worldheart',qtyMin:1,qtyMax:1}]},
    ],
  },
};

export function findAction(skill: string, actionName: string) {
  const s = SKILLS[skill];
  if (!s) return null;
  return s.actions.find(a => a.name === actionName) ?? null;
}

export function matchAction(skill: string, partial: string) {
  const s = SKILLS[skill];
  if (!s) return [];
  return s.actions.filter(a => a.name.includes(partial) || a.label.toLowerCase().includes(partial.toLowerCase()));
}
