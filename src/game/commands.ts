// ── commands.ts ────────────────────────────────────────────────────────────
// This file contains the command parser.
// ───────────────────────────────────────────────────────────────────────────

// src/ui/commands.ts

import type { GameState, NavState, CommandResult } from '../data/types';
import { SKILL_NAMES, SKILL_LABELS, getSkillLevel, getSeason, addLog, WORLD_MILESTONES } from '../game/state';
import { findAction, matchAction } from '../data/skills';
import { startAction, openBoxFull } from '../game/engine';
import { getSellPrice, getItemLabel, getShopItem, SHOP_ITEMS } from '../data/items';

const SCREENS = ['home','skills','inventory','shop','log','season','stats'];

function trackMilestone(state: GameState, id: string): void {
  if (!state.completion.worldMilestones.includes(id)) {
    state.completion.worldMilestones.push(id);
    const def = WORLD_MILESTONES.find(m => m.id === id);
    if (def) addLog(state, `🏆 MILESTONE — ${def.label}`, 'general');
  }
}

function ok(message = '', redirect?: string): CommandResult {
  return { ok: true, message, redirect };
}
function err(message: string): CommandResult {
  return { ok: false, message };
}

// ── Navigation ──────────────────────────────────────────────────────────────
function cmdGo(state: GameState, args: string[], nav: NavState): CommandResult {
  if (!args[0]) return err(`Usage: go <screen>  options: ${SCREENS.join(', ')}`);
  const dest = args[0].toLowerCase();
  if (!SCREENS.includes(dest)) return err(`Unknown screen '${dest}'. Options: ${SCREENS.join(', ')}`);
  nav.history.push(nav.current);
  nav.current = dest;
  return ok('', dest);
}

function cmdBack(state: GameState, args: string[], nav: NavState): CommandResult {
  const prev = nav.history.pop() ?? 'home';
  nav.current = prev;
  // Reset transient filter/state so returning to a screen feels clean
  if (prev !== 'log')         nav.logFilter  = null;
  if (prev !== 'inventory')   nav.invFilter  = null;
  if (prev !== 'loot_reveal') nav.lootReveal = null;
  return ok('', prev);
}

function cmdHome(state: GameState, args: string[], nav: NavState): CommandResult {
  nav.history = [];
  nav.current = 'home';
  return ok('', 'home');
}

// ── Action control ──────────────────────────────────────────────────────────
function cmdDo(state: GameState, args: string[], nav: NavState): CommandResult {
  const keepQueue = args.includes('--keep');
  args = args.filter(a => a !== '--keep');

  if (args.length < 2) return err('Usage: do <skill> <action> [qty]  (qty 0 = infinite)');

  const skillName = args[0].toLowerCase();
  const actionRaw = args[1].toLowerCase();
  const qtyStr    = args[2];
  let   qty       = 1;

  if (qtyStr !== undefined) {
    qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty < 0) return err(`Invalid quantity '${qtyStr}'`);
  }

  if (!SKILL_NAMES.includes(skillName as any))
    return err(`Unknown skill '${skillName}'. Type 'skills' to see all.`);

  let action = findAction(skillName, actionRaw);
  if (!action) {
    const matches = matchAction(skillName, actionRaw);
    if (matches.length === 1) action = matches[0];
    else if (matches.length > 1)
      return err(`Ambiguous action '${actionRaw}'. Did you mean: ${matches.map(a=>a.name).join(', ')}?`);
    else return err(`Unknown action '${actionRaw}' for skill '${skillName}'.`);
  }

  // Check requirements
  const unmet = action.requires.filter(r => getSkillLevel(state, r.skill)[0] < r.level);
  if (unmet.length > 0) {
    const reqs = unmet.map(r => `${SKILL_LABELS[r.skill] ?? r.skill} ${r.level} (you have ${getSkillLevel(state, r.skill)[0]})`);
    return err('Requirements not met: ' + reqs.join(', '));
  }

  // Check season
  if (action.season && getSeason(state) !== action.season)
    return err(`'${action.label}' can only be done in ${action.season}. Current: ${getSeason(state)}.`);

  if (!keepQueue) state.queue = [];
  startAction(state, skillName, action.name, qty);

  const qtyStr2 = qty === 0 ? '∞' : String(qty);
  return ok(`Started: ${SKILL_LABELS[skillName]} › ${action.label} ×${qtyStr2}`);
}

function cmdQueue(state: GameState, args: string[], nav: NavState): CommandResult {
  if (args[0]?.toLowerCase() === 'add') args = args.slice(1);
  if (args.length < 2) return err('Usage: queue <skill> <action> [qty]');

  const skillName = args[0].toLowerCase();
  const actionRaw = args[1].toLowerCase();
  const qtyStr    = args[2];
  let   qty       = 1;

  if (qtyStr !== undefined) {
    qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty < 0) return err(`Invalid quantity '${qtyStr}'`);
  }

  if (!SKILL_NAMES.includes(skillName as any))
    return err(`Unknown skill '${skillName}'.`);

  let action = findAction(skillName, actionRaw);
  if (!action) {
    const matches = matchAction(skillName, actionRaw);
    if (matches.length === 1) action = matches[0];
    else if (matches.length > 1)
      return err('Ambiguous: ' + matches.map(a=>a.name).join(', '));
    else return err(`Unknown action '${actionRaw}' for '${skillName}'.`);
  }

  const qlimit = state.queueLimit ?? 10;
  if (state.queue.length >= qlimit)
    return err(`Queue full (${qlimit} slots). Buy 'Expanded Satchel' to increase.`);

  if (!state.active) {
    startAction(state, skillName, action.name, qty);
    return ok(`Started immediately: ${SKILL_LABELS[skillName]} › ${action.label}`);
  }

  state.queue.push({ skill: skillName, action: action.name, qty });
  const qtyStr2 = qty === 0 ? '∞' : String(qty);
  return ok(`Queued [${state.queue.length}/${qlimit}]: ${SKILL_LABELS[skillName]} › ${action.label} ×${qtyStr2}`);
}

function cmdStop(state: GameState, args: string[]): CommandResult {
  if (!state.active) return err('Nothing is currently running.');
  const label = state.active.action.replace(/_/g, ' ');
  state.active = null;
  if (args.includes('--all')) { state.queue = []; return ok(`Stopped '${label}' and cleared the queue.`); }
  return ok(`Stopped '${label}'.`);
}

function cmdClear(state: GameState, args: string[]): CommandResult {
  if (args.includes('--all')) state.active = null;
  state.queue = [];
  return ok(args.includes('--all') ? 'Queue cleared and action stopped.' : 'Queue cleared.');
}

// ── Queue management ────────────────────────────────────────────────────────
function cmdQ(state: GameState, args: string[], nav: NavState): CommandResult {
  if (!args[0]) { nav.history.push(nav.current); nav.current = 'home'; return ok('', 'home'); }

  const sub = args[0].toLowerCase();
  if (sub === 'remove' && args[1]) {
    const slot = parseInt(args[1], 10) - 1;
    if (isNaN(slot) || slot < 0 || slot >= state.queue.length)
      return err(`Invalid slot ${args[1]}. Queue has ${state.queue.length} entries.`);
    const [removed] = state.queue.splice(slot, 1);
    return ok(`Removed slot ${slot+1}: ${removed.action.replace(/_/g,' ')}`);
  }
  if (sub === 'move' && args[1] && args[2]) {
    const a = parseInt(args[1], 10) - 1;
    const b = parseInt(args[2], 10) - 1;
    if (a < 0 || a >= state.queue.length || b < 0 || b >= state.queue.length)
      return err(`Slots must be between 1 and ${state.queue.length}.`);
    [state.queue[a], state.queue[b]] = [state.queue[b], state.queue[a]];
    return ok(`Swapped slots ${a+1} and ${b+1}.`);
  }
  return err(`Unknown subcommand '${sub}'. Options: remove <n>, move <a> <b>`);
}

// ── Inventory ───────────────────────────────────────────────────────────────
function cmdInv(state: GameState, args: string[], nav: NavState): CommandResult {
  nav.history.push(nav.current);
  nav.current = 'inventory';
  // Parse filter: skill name, 'rare', '--sort price', '--sort quantity'
  const sortIdx = args.indexOf('--sort');
  nav.invFilter = null;
  if (sortIdx >= 0) {
    nav.invFilter = '--sort:' + (args[sortIdx + 1] ?? 'price');
  } else if (args[0]) {
    nav.invFilter = args[0].toLowerCase();
  }
  return ok('', 'inventory');
}

function cmdInspect(state: GameState, args: string[], nav: NavState): CommandResult {
  if (!args[0]) return err('Usage: inspect <item>');
  // Accept both underscored and spaced item names
  const item = args.join('_').toLowerCase().replace(/\s+/g, '_');
  const qty  = state.inventory[item] ?? 0;
  if (!qty) return err(`'${getItemLabel(item)}' not in inventory.`);
  nav.history.push(nav.current);
  nav.current    = 'inspect_item';
  nav.invFilter  = item;
  return ok('', 'inspect_item');
}

// ── View command ─────────────────────────────────────────────────────────────
function cmdView(state: GameState, args: string[], nav: NavState): CommandResult {
  if (!args[0]) return err("Usage: view action <skill> <action>  or  view item <name>");

  const sub = args[0].toLowerCase();

  if (sub === 'action' || sub === 'a') {
    if (args.length < 3) return err('Usage: view action <skill> <action>');
    const skillName = args[1].toLowerCase();
    const actionRaw = args[2].toLowerCase();

    if (!SKILL_NAMES.includes(skillName as any)) {
      const matches = SKILL_NAMES.filter(s => s.includes(skillName));
      if (matches.length === 1) {
        return cmdViewAction(state, nav, matches[0], actionRaw);
      }
      return err(`Unknown skill '${skillName}'.`);
    }
    return cmdViewAction(state, nav, skillName, actionRaw);
  }

  if (sub === 'item' || sub === 'i') {
    if (!args[1]) return err('Usage: view item <item_name>');
    const item = args.slice(1).join('_').toLowerCase();
    nav.history.push(nav.current);
    nav.current   = 'inspect_item';
    nav.invFilter = item;
    return ok('', 'inspect_item');
  }

  if (sub === 'skill' || sub === 's') {
    return cmdSkill(state, args.slice(1), nav);
  }

  if (sub === 'companion' || sub === 'c') {
    if (!args[1]) return err('Usage: view companion <name>  e.g. view companion rabbit');
    const query = args.slice(1).join('_').toLowerCase();
    const COMPANION_ITEMS = [
      'rabbit_companion','fox_companion','owl_companion','boar_companion','otter_companion',
      'bear_companion','moon_deer_companion','storm_eagle_companion','ancient_stag_companion',
    ];
    const match = COMPANION_ITEMS.find(id => id.includes(query) || query.includes(id.replace('_companion','')));
    if (!match) return err(`Unknown companion '${query}'. Try: rabbit, fox, owl, boar, otter, bear, moon_deer, storm_eagle, ancient_stag`);
    nav.history.push(nav.current);
    nav.current   = 'inspect_item';
    nav.invFilter = match;
    return ok('', 'inspect_item');
  }

  return err(`Unknown view target '${sub}'. Options: action, item, skill, companion`);
}

function cmdViewAction(state: GameState, nav: NavState, skillName: string, actionRaw: string): CommandResult {
  let action = findAction(skillName, actionRaw);
  if (!action) {
    const matches = matchAction(skillName, actionRaw);
    if (matches.length === 1)      action = matches[0];
    else if (matches.length > 1)   return err('Ambiguous: ' + matches.map(a=>a.name).join(', '));
    else                           return err(`Unknown action '${actionRaw}' in skill '${skillName}'.`);
  }
  nav.actionDetail = { skill: skillName, action: action.name };
  nav.history.push(nav.current);
  nav.current = 'action_detail';
  return ok('', 'action_detail');
}

// ── Shop ────────────────────────────────────────────────────────────────────

function cmdShop(state: GameState, args: string[], nav: NavState): CommandResult {
  nav.history.push(nav.current); nav.current = 'shop';
  return ok('', 'shop');
}

function applyUtilityEffect(state: GameState, effect: string): void {
  if (effect === 'queue_limit_20') state.queueLimit = Math.max(state.queueLimit, 20);
  if (effect === 'queue_limit_5')  state.queueLimit = (state.queueLimit ?? 10) + 5;
  // Duration reductions stored in ownedUtilities — engine checks them at action start
}

function cmdBuy(state: GameState, args: string[], nav: NavState): CommandResult {
  if (!args[0]) return err("Usage: buy <item> [qty]  —  type 'shop' to browse");

  // Resolve item id: allow spaces or underscores, partial match
  const raw = args.join('_').toLowerCase().replace(/-/g,'_');
  let qty = 1;

  // If last token is a number, treat it as quantity
  const parts = args.slice();
  const lastN = parseInt(parts[parts.length - 1], 10);
  if (!isNaN(lastN) && parts.length > 1) {
    qty = lastN;
    parts.pop();
  }
  const itemId = parts.join('_').toLowerCase().replace(/-/g,'_');

  // Exact match first, then partial
  let shopItem = getShopItem(itemId);
  if (!shopItem) {
    const matches = SHOP_ITEMS.filter(i =>
      i.id.includes(itemId) || i.label.toLowerCase().includes(itemId.replace(/_/g,' '))
    );
    if (matches.length === 1) shopItem = matches[0];
    else if (matches.length > 1) return err(`Ambiguous: ${matches.map(i=>i.label).join(', ')}`);
    else return err(`Unknown shop item '${itemId}'. Type 'shop' to browse.`);
  }

  // One-time check
  if (shopItem.oneTime && (state.ownedUtilities ?? []).includes(shopItem.id))
    return err(`You already own '${shopItem.label}'.`);

  // Lootboxes and boosts can only be bought 1 at a time for now
  if (shopItem.category !== 'utility') qty = Math.max(1, qty);

  const totalCost = shopItem.price * qty;
  if ((state.gold ?? 0) < totalCost)
    return err(`Not enough gold. Need ${totalCost.toLocaleString()}g, have ${(state.gold ?? 0).toLocaleString()}g.`);

  state.gold = (state.gold ?? 0) - totalCost;
  trackMilestone(state, 'shop_first');

  if (shopItem.category === 'utility') {
    if (!state.ownedUtilities) state.ownedUtilities = [];
    if (shopItem.oneTime) {
      state.ownedUtilities.push(shopItem.id);
    } else {
      // Stackable utility (e.g. expanded_satchel) — apply multiple times
      for (let i = 0; i < qty; i++) state.ownedUtilities.push(shopItem.id);
    }
    if (shopItem.effect) applyUtilityEffect(state, shopItem.effect);
    addLog(state, `Purchased ${shopItem.label} for ${totalCost.toLocaleString()}g`);
    // Check all_utility milestone
    const ALL_UTILITY_IDS = ['better_fishing_rod','herb_drying_rack','reinforced_cauldron','druids_clarity','field_journal'];
    const owned2 = state.ownedUtilities ?? [];
    if (ALL_UTILITY_IDS.every(id => owned2.includes(id))) trackMilestone(state, 'shop_all_utility');
    return ok(`Purchased: ${shopItem.label}  −${totalCost.toLocaleString()}g`);
  }

  if (shopItem.category === 'boost') {
    if (!shopItem.effect) return err('This item has no effect yet.');
    const [, amountStr, durationStr] = shopItem.effect.split('_').slice(-2);
    const duration = parseInt(durationStr, 10);
    const amount   = parseInt(amountStr, 10);
    const expiresAt = Date.now() / 1000 + duration;
    state.buffs.push({ name: shopItem.label, effect: shopItem.desc, expiresAt });
    addLog(state, `Applied ${shopItem.label} — ${shopItem.desc}`);
    return ok(`Applied: ${shopItem.label}  −${shopItem.price.toLocaleString()}g  (expires in ${Math.round(duration/60)}m)`);
  }

  if (shopItem.category === 'lootbox') {
    // openBoxWithMeta returns items with tier info for the reveal screen
    const { items, summary } = openBoxFull(state, shopItem.id);
    addLog(state, `Opened ${shopItem.label} — ${summary}`);
    // Track moonlit vault milestone
    if (shopItem.id === 'moonlit_vault') trackMilestone(state, 'shop_moonlit_vault');
    // Navigate to reveal screen
    nav.lootReveal = items;
    nav.history.push(nav.current);
    nav.current = 'loot_reveal';
    return ok('', 'loot_reveal');
  }

  return err('Unknown item type.');
}

function cmdSell(state: GameState, args: string[]): CommandResult {
  const sellAll = args.includes('--all');
  args = args.filter(a => !a.startsWith('--'));

  if (!args[0]) return err('Usage: sell <item> [qty]  or  sell <item> --all');

  // If last token is a number, it's the qty
  let qty = 1;
  const lastArg = args[args.length - 1];
  if (args.length > 1 && !isNaN(Number(lastArg))) {
    qty  = parseInt(lastArg, 10);
    args = args.slice(0, -1);
  }
  if (qty <= 0) return err('Quantity must be at least 1.');

  const item  = args.join('_').toLowerCase();
  const inInv = state.inventory[item] ?? 0;
  if (!inInv) return err(`You don't have any '${getItemLabel(item)}'.`);

  if (sellAll) qty = inInv;
  qty = Math.min(qty, inInv);

  const unitPrice = getSellPrice(item);
  const total     = qty * unitPrice;

  state.inventory[item] = inInv - qty;
  if (state.inventory[item] === 0) delete state.inventory[item];
  state.gold = (state.gold ?? 0) + total;

  const label = getItemLabel(item);
  addLog(state, `Sold ${qty.toLocaleString()}× ${label} for ${total.toLocaleString()}g (${unitPrice}g each)`);
  return ok(`Sold ${qty.toLocaleString()}× ${label}  +${total.toLocaleString()}g`);
}

// ── Skills info ─────────────────────────────────────────────────────────────
function cmdSkills(state: GameState, args: string[], nav: NavState): CommandResult {
  nav.history.push(nav.current); nav.current = 'skills';
  return ok('', 'skills');
}

function cmdSkill(state: GameState, args: string[], nav: NavState): CommandResult {
  if (!args[0]) return err('Usage: skill <skill_name>');
  let skillName = args[0].toLowerCase();
  if (!SKILL_NAMES.includes(skillName as any)) {
    const matches = SKILL_NAMES.filter(s => s.includes(skillName));
    if (matches.length === 1) skillName = matches[0];
    else if (matches.length > 1) return err('Ambiguous: ' + matches.join(', '));
    else return err(`Unknown skill '${skillName}'. Type 'skills'.`);
  }
  nav.skillDetail = skillName;
  nav.history.push(nav.current);
  nav.current = 'skill_detail';
  return ok('', 'skill_detail');
}

function cmdStats(state: GameState, args: string[], nav: NavState): CommandResult {
  nav.history.push(nav.current); nav.current = 'stats';
  return ok('', 'stats');
}

// ── Info screens ─────────────────────────────────────────────────────────────
function cmdHelp(state: GameState, args: string[], nav: NavState): CommandResult {
  nav.helpTopic = args[0]?.toLowerCase() ?? null;
  nav.history.push(nav.current); nav.current = 'help';
  return ok('', 'help');
}

// Filter map: user-facing keyword → log category value
const LOG_FILTER_MAP: Record<string, string> = {
  drops:   'general',    // all drops (general + rare_drop)
  rare:    'rare_drop',
  level:   'level_up',
  combat:  'combat',
};

// ── Debug command ────────────────────────────────────────────────────────────
function cmdDebug(state: GameState, args: string[], nav: NavState): CommandResult {
  if (!args[0]) return err('Usage: debug <subcommand>  options: season, addxp, addgold, additem');

  const sub = args[0].toLowerCase();

  if (sub === 'season') {
    // Advance to next season immediately
    state.seasonIndex     = (state.seasonIndex + 1) % 4;
    state.seasonStartedAt = Date.now() / 1000;
    const SEASON_NAMES = ['Spring','Summer','Autumn','Winter'];
    return ok(`Debug: advanced to ${SEASON_NAMES[state.seasonIndex % 4]}`);
  }

  if (sub === 'addxp') {
    // debug addxp <skill> <amount>
    const skill  = args[1]?.toLowerCase();
    const amount = parseInt(args[2] ?? '1000', 10);
    if (!skill || !SKILL_NAMES.includes(skill as any))
      return err(`Unknown skill '${skill}'. Options: ${SKILL_NAMES.join(', ')}`);
    state.skills[skill] = (state.skills[skill] ?? 0) + amount;
    return ok(`Debug: added ${amount.toLocaleString()} XP to ${SKILL_LABELS[skill]}`);
  }

  if (sub === 'addgold') {
    const amount = parseInt(args[1] ?? '1000', 10);
    state.gold = (state.gold ?? 0) + amount;
    return ok(`Debug: added ${amount.toLocaleString()}g`);
  }

  if (sub === 'additem') {
    // debug additem <item> [qty]
    const qty  = parseInt(args[args.length - 1] ?? '1', 10);
    const item = (isNaN(qty) ? args.slice(1) : args.slice(1, -1)).join('_').toLowerCase();
    if (!item) return err('Usage: debug additem <item> [qty]');
    const realQty = isNaN(qty) ? 1 : qty;
    state.inventory[item] = (state.inventory[item] ?? 0) + realQty;
    return ok(`Debug: added ${realQty}× ${item.replace(/_/g,' ')}`);
  }

  return err(`Unknown debug subcommand '${sub}'. Options: season, addxp, addgold, additem`);
}

// ── Completion command ────────────────────────────────────────────────────────
function cmdCompletion(state: GameState, args: string[], nav: NavState): CommandResult {
  const sub = args[0]?.toLowerCase() ?? '';
  nav.history.push(nav.current);
  nav.current = 'completion';
  // Store subview in helpTopic (reusing existing nav field for subpage routing)
  nav.helpTopic = sub || null;
  return ok('', 'completion');
}

function cmdLog(state: GameState, args: string[], nav: NavState): CommandResult {
  // Parse --n <count>
  const nIdx = args.indexOf('--n');
  nav.logN = 30;
  if (nIdx >= 0 && args[nIdx + 1]) {
    const parsed = parseInt(args[nIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) nav.logN = Math.min(parsed, 200);
    args = args.filter((_, i) => i !== nIdx && i !== nIdx + 1);
  }

  // Parse filter keyword
  nav.logFilter = null;
  const keyword = args[0]?.toLowerCase();
  if (keyword && LOG_FILTER_MAP[keyword]) {
    nav.logFilter = LOG_FILTER_MAP[keyword];
  } else if (keyword === 'drops') {
    // 'drops' shows both general and rare_drop entries
    nav.logFilter = 'drops'; // special-cased in renderer
  }

  nav.history.push(nav.current);
  nav.current = 'log';
  return ok('', 'log');
}

function cmdSeason(state: GameState, args: string[], nav: NavState): CommandResult {
  nav.history.push(nav.current); nav.current = 'season';
  return ok('', 'season');
}

// ── Dispatch ────────────────────────────────────────────────────────────────
type Handler = (state: GameState, args: string[], nav: NavState) => CommandResult;

const DISPATCH: Record<string, Handler> = {
  go:      cmdGo,
  back:    cmdBack,
  home:    cmdHome,
  do:      cmdDo,
  queue:   cmdQueue,
  stop:    (s,a)       => cmdStop(s,a),
  clear:   (s,a)       => cmdClear(s,a),
  q:       cmdQ,
  view:    cmdView,
  inv:     cmdInv,
  inspect: (s,a,n)     => cmdInspect(s,a,n),
  shop:    cmdShop,
  buy:     (s,a,n)       => cmdBuy(s,a,n),
  sell:    (s,a)       => cmdSell(s,a),
  skills:  cmdSkills,
  skill:   cmdSkill,
  stats:   cmdStats,
  help:    cmdHelp,
  debug:      cmdDebug,
  completion: cmdCompletion,
  log:     cmdLog,
  season:  cmdSeason,
};

export function handleCommand(
  raw: string,
  state: GameState,
  nav: NavState,
): CommandResult {
  const parts    = raw.trim().split(/\s+/);
  const cmdName  = parts[0].toLowerCase();
  const args     = parts.slice(1);

  const handler = DISPATCH[cmdName];
  if (!handler) {
    const close = Object.keys(DISPATCH).filter(k => k.includes(cmdName) || cmdName.includes(k));
    const hint  = close.length ? `  Did you mean: ${close.join(', ')}?` : "  Type 'help' for all commands.";
    return err(`Unknown command '${cmdName}'.${hint}`);
  }

  return handler(state, args, nav);
}
