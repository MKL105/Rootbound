// src/ui/render.ts
// All screen renderers. Each returns an HTML string that goes into .terminal-screen.
// Uses <span class="c-*"> for colour and plain spaces for alignment (monospace guaranteed).

import type { GameState, NavState } from '../types';
import {
  SKILL_NAMES, SKILL_LABELS, levelFromXp, WORLD_MILESTONES, TRACKABLE_DROP_LIST, LEGENDARY_SETS, SEASON_EMOJIS, SEASON_LABELS,
  SEASON_BONUSES, SEASON_EXCLUSIVES, COMPLETION_WEIGHTS, COMPLETION_TOTALS,
  getSeason, getSkillLevel, seasonTimeRemaining,
  fmtDuration, fmtPlaytime, fmtTime,
  getCompletionPct, getCompletionBreakdown, completionTitle,
} from '../game/state';
import { SKILLS } from '../game/skills';
import { actionProgress, getActiveXpBonusSummary } from '../game/engine';
import { getItemLabel, getSellPrice, getTotalSellValue, SHOP_ITEMS } from '../game/items';
import { SKILL_DROPS, TIER_LABELS, TIER_BASE_CHANCE } from '../game/drops';
import { ITEMS, getItemDef } from '../game/items';

// ── Constants ──────────────────────────────────────────────────────────────
const W = 100;

// ── Colour helpers ─────────────────────────────────────────────────────────
const c = {
  moss:      (t: string) => `<span class="c-moss">${t}</span>`,
  forest:    (t: string) => `<span class="c-forest">${t}</span>`,
  gold:      (t: string) => `<span class="c-gold">${t}</span>`,
  bark:      (t: string) => `<span class="c-bark">${t}</span>`,
  dim:       (t: string) => `<span class="c-dim">${t}</span>`,
  white:     (t: string) => `<span class="c-white">${t}</span>`,
  rare:      (t: string) => `<span class="c-rare">${t}</span>`,
  veryrare:  (t: string) => `<span class="c-veryrare">${t}</span>`,
  mythic:    (t: string) => `<span class="c-mythic">${t}</span>`,
  legendary: (t: string) => `<span class="c-legendary">${t}</span>`,
  red:       (t: string) => `<span class="c-red">${t}</span>`,
  bold:      (t: string) => `<span class="bold">${t}</span>`,
  b:         (t: string) => `<span class="bold">${t}</span>`,
};

// Strips HTML tags to get visible character count
function vis(html: string): number {
  return html.replace(/<[^>]*>/g, '').length;
}

// Pad right based on visible length (works with coloured HTML)
function pr(html: string, width: number, char = ' '): string {
  const extra = width - vis(html);
  return extra > 0 ? html + char.repeat(extra) : html;
}

// Pad left
function pl(html: string, width: number, char = ' '): string {
  const extra = width - vis(html);
  return extra > 0 ? char.repeat(extra) + html : html;
}

function rule(char = '═'): string {
  return c.forest(char.repeat(W));
}
function thinRule(): string {
  return c.dim('─'.repeat(W));
}

function progressBar(pct: number, width = 20): string {
  const filled = Math.round(Math.min(pct, 1) * width);
  const col    = pct >= 1 ? c.gold : c.moss;
  return `[${col('█'.repeat(filled))}${c.dim('░'.repeat(width - filled))}]`;
}

// ── Shared header ──────────────────────────────────────────────────────────
function headerBar(state: GameState, screenName: string): string {
  const season = getSeason(state);
  const emoji  = SEASON_EMOJIS[season];
  const sLabel = SEASON_LABELS[season];
  const now    = new Date();
  const time   = now.toTimeString().slice(0, 5);
  const day    = Math.floor((now.getTime()/1000 - state.createdAt) / 86400) + 1;

  const left  = ` ${c.b(c.moss('ROOTBOUND'))}  ${c.dim('›')}  ${c.white(screenName)}`;
  const right = `${emoji} ${c.moss(sLabel)}  ${c.dim(`Day ${day}  ${time}`)} `;
  const pad   = W - vis(left) - vis(right);

  return [
    rule(),
    left + ' '.repeat(Math.max(1, pad)) + right,
    rule(),
  ].join('\n');
}

// ── HOME SCREEN ────────────────────────────────────────────────────────────
export function renderHome(state: GameState): string {
  const lines: string[] = [];
  lines.push(headerBar(state, 'HOME'));
  lines.push('');

  // Two columns: active action (left=42) | queue (right)
  const LW = 42;
  const leftLines:  string[] = [];
  const rightLines: string[] = [];

  // Left: active action
  const active = state.active;
  leftLines.push(` ${c.dim('Active Action')}`);
  leftLines.push(` ${c.dim('─'.repeat(38))}`);
  if (active) {
    const sk = SKILL_LABELS[active.skill] ?? active.skill;
    const ac = active.action.replace(/_/g, ' ').replace(/\b\w/g, x => x.toUpperCase());
    leftLines.push(` ${c.forest(sk)} ${c.dim('›')} ${c.white(ac)}`);
    const pct  = actionProgress(state);
    const rem  = Math.max(0, active.duration - (Date.now()/1000 - active.startedAt));
    leftLines.push(` ${progressBar(pct, 22)}  ${c.dim(Math.round(pct*100)+'%')}  ${c.dim(fmtDuration(rem)+' left')}`);
    if (active.qtyTotal !== 1) {
      const tot = active.qtyTotal === 0 ? '∞' : String(active.qtyTotal);
      leftLines.push(` ${c.dim(`Rep ${active.qtyDone + 1} of ${tot}`)}`);
    }
    leftLines.push(` ${c.dim(`+${active.xpPer} XP per action`)}`);
  } else {
    leftLines.push(` ${c.dim('Idle — no action running')}`);
    leftLines.push(` ${c.dim('Use: do <skill> <action> [qty]')}`);
    leftLines.push('');
    leftLines.push('');
  }

  // Right: queue
  const qlimit = state.queueLimit ?? 10;
  rightLines.push(` ${c.dim('Queue')}  ${c.dim(`[${state.queue.length}/${qlimit}]`)}`);
  rightLines.push(` ${c.dim('─'.repeat(36))}`);
  if (state.queue.length > 0) {
    for (let i = 0; i < Math.min(state.queue.length, 6); i++) {
      const e   = state.queue[i];
      const sk  = SKILL_LABELS[e.skill] ?? e.skill;
      const ac  = e.action.replace(/_/g, ' ').replace(/\b\w/g, x => x.toUpperCase());
      const qty = e.qty === 0 ? '∞' : `×${e.qty}`;
      rightLines.push(` ${c.dim(`${i+1}.`)} ${c.forest(sk)} ${c.dim('›')} ${c.dim(ac)} ${c.gold(qty)}`);
    }
    if (state.queue.length > 6) rightLines.push(` ${c.dim(`  … and ${state.queue.length - 6} more`)}`);
  } else {
    rightLines.push(` ${c.dim('Queue is empty')}`);
    rightLines.push(` ${c.dim('queue <skill> <action> [qty]')}`);
  }

  // Merge two columns
  const rows = Math.max(leftLines.length, rightLines.length);
  for (let i = 0; i < rows; i++) {
    const l = leftLines[i]  ?? '';
    const r = rightLines[i] ?? '';
    lines.push(pr(l, LW) + r);
  }

  // Buffs
  lines.push('');
  lines.push(` ${c.dim('Buffs Active')}`);
  lines.push(` ${thinRule()}`);
  const activeBufls = state.buffs.filter(b => b.expiresAt > Date.now()/1000);
  if (activeBufls.length > 0) {
    for (const b of activeBufls.slice(0, 3)) {
      const rem = b.expiresAt - Date.now()/1000;
      lines.push(`  ${c.gold('✦')} ${pr(c.white(b.name), 24)} ${pr(c.moss(b.effect), 20)} ${c.dim(fmtDuration(rem)+' remaining')}`);
    }
  } else {
    lines.push(`  ${c.dim('No active buffs')}`);
  }

  // Recent events
  lines.push('');
  lines.push(` ${c.dim('Recent Events')}`);
  lines.push(` ${thinRule()}`);
  if (state.log.length > 0) {
    for (const entry of state.log.slice(0, 5)) {
      const t   = fmtTime(entry.ts);
      const col = entry.category === 'rare_drop' ? c.rare :
                  entry.category === 'level_up'  ? c.gold : c.dim;
      lines.push(`  ${c.dim(`[${t}]`)} ${col(entry.text)}`);
    }
  } else {
    lines.push(`  ${c.dim('No events yet — start an action!')}`);
  }

  // Status bar
  const pct    = getCompletionPct(state);
  const ctitle = completionTitle(pct);
  const filled = Math.round(pct / 100 * 18);
  const cbar   = `[${c.moss('█'.repeat(filled))}${c.dim('░'.repeat(18 - filled))}]`;

  lines.push('');
  lines.push(` ${thinRule()}`);
  const lstat = ` ${c.dim('Gold:')} ${c.gold((state.gold ?? 0).toLocaleString()+'g')}   ${c.dim('Played:')} ${c.dim(fmtPlaytime(state.playedSeconds))}`;
  const rstat = `${c.dim('Completion:')} ${cbar} ${c.moss(pct.toFixed(1)+'%')}  ${c.dim(ctitle)} `;
  const statPad = W - vis(lstat) - vis(rstat);
  lines.push(lstat + ' '.repeat(Math.max(1, statPad)) + rstat);

  return lines.join('\n');
}

// ── SKILLS OVERVIEW ────────────────────────────────────────────────────────
export function renderSkills(state: GameState): string {
  const lines: string[] = [];
  lines.push(headerBar(state, 'SKILLS'));
  lines.push('');
  lines.push(`  ${c.dim('15 skills  ·  max level 100  ·  XP = 80 × N × 1.09ᴺ')}`);
  lines.push('');

  const season  = getSeason(state);
  const bonuses = SEASON_BONUSES[season] ?? {};

  // Header row
  const hdr =
    pr(`  ${c.b(c.forest('Skill'))}`,        22) +
    pr(c.b(c.forest('Lvl')),                  6) +
    pr(c.b(c.forest('Progress')),            28) +
    pr(c.b(c.forest('XP to next')),          16) +
    c.b(c.forest('Season'));
  lines.push(hdr);
  lines.push(`  ${thinRule()}`);

  for (const skill of SKILL_NAMES) {
    const [level, xpIn, xpNeeded] = getSkillLevel(state, skill);
    const label = SKILL_LABELS[skill];
    const pct   = xpNeeded > 0 ? xpIn / xpNeeded : 1;
    const bar   = progressBar(pct, 14);
    const lvlColor = level >= 100 ? c.gold : level >= 50 ? c.moss : c.white;
    const xpStr = level < 100 ? `${xpIn.toLocaleString()}/${xpNeeded.toLocaleString()}` : c.gold('MAX');
    const mod   = bonuses[skill] ?? 0;
    const modStr = mod > 0 ? c.moss(`+${mod}%`) : mod < 0 ? c.red(`${mod}%`) : c.dim(' — ');

    const xpBonus = getActiveXpBonusSummary(state, skill);
    const bonusTag = xpBonus ? `  ${c.gold(xpBonus)}` : '';
    lines.push(
      pr(`  ${c.white(label)}`, 22) +
      pr(lvlColor(String(level)), 6) +
      pr(`${bar}  `, 28) +
      pr(c.dim(xpStr), 16) +
      pr(modStr, 8) +
      bonusTag
    );
  }

  lines.push('');
  lines.push(`  ${c.dim("skill <name>  —  view full detail and sub-actions")}`);
  return lines.join('\n');
}

// ── SKILL DETAIL ───────────────────────────────────────────────────────────
export function renderSkillDetail(state: GameState, skillName: string): string {
  const lines: string[] = [];
  const skillDef = SKILLS[skillName];

  if (!skillDef) {
    lines.push(headerBar(state, 'SKILL'));
    lines.push('');
    lines.push(`  ${c.red(`Unknown skill: '${skillName}'`)}`);
    lines.push(`  ${c.dim('Available: ' + SKILL_NAMES.join(', '))}`);
    return lines.join('\n');
  }

  lines.push(headerBar(state, skillDef.label.toUpperCase()));
  const [level, xpIn, xpNeeded] = getSkillLevel(state, skillName);
  const totalXp = state.skills[skillName] ?? 0;

  lines.push('');
  const lvlCol = level >= 100 ? c.gold : c.moss;
  lines.push(`  ${c.b(lvlCol(`Level ${level}`))}  ${c.dim(`${xpIn.toLocaleString()} / ${xpNeeded.toLocaleString()} XP  (total: ${totalXp.toLocaleString()})`)}`);
  lines.push(`  ${progressBar(xpNeeded > 0 ? xpIn/xpNeeded : 1, 40)}`);
  lines.push('');
  lines.push(`  ${c.dim(skillDef.description)}`);
  lines.push('');

  // Sub-actions table — fixed column widths, all measured on plain text
  const CN = 5;   // marker + number
  const CA = 30;  // action name
  const CR = 28;  // requires
  const CD = 6;   // duration
  const CX = 5;   // xp

  const hdr =
    pr(`  ${c.b(c.forest('#'))}`, CN + 2) +
    pr(c.b(c.forest('Action')), CA) +
    pr(c.b(c.forest('Requires')), CR) +
    pl(c.b(c.forest('Dur')), CD) +
    pl(c.b(c.forest('XP')), CX);
  lines.push(`  ${c.b(c.forest('Sub-Actions'))}`);
  lines.push(hdr);
  lines.push(`  ${thinRule()}`);

  for (let i = 0; i < skillDef.actions.length; i++) {
    const a = skillDef.actions[i];
    const unlocked = a.requires.every(r => getSkillLevel(state, r.skill)[0] >= r.level);
    const marker   = unlocked ? c.moss('✓') : c.dim('✗');
    const nameCol  = unlocked ? c.white : c.dim;
    const reqStr   = a.requires.length === 0 ? '—' :
      a.requires.map(r => `${SKILL_LABELS[r.skill] ?? r.skill} ${r.level}`).join(', ');
    const seasonTag = a.season ? `  ${c.dim('[' + a.season + ']')}` : '';

    lines.push(
      pr(`  ${marker} ${c.dim(String(i+1))}`, CN + 2) +
      pr(nameCol(a.label), CA) +
      pr(c.dim(reqStr), CR) +
      pl(c.dim(a.duration + 's'), CD) +
      pl(c.moss(String(a.xp)), CX) +
      seasonTag
    );
  }

  // Drop table — only show if player owns Field Journal
  const hasJournal = (state.ownedUtilities ?? []).includes('field_journal');
  const skillDrops = SKILL_DROPS[skillName] ?? [];

  if (hasJournal && skillDrops.length > 0) {
    lines.push('');
    lines.push(`  ${c.b(c.forest('Bonus Drop Table'))}  ${c.dim('(Field Journal)')}`);
    lines.push(`  ${thinRule()}`);
    const DD = 14;
    const DI = 34;
    lines.push(pr(`  ${c.b(c.forest('Tier'))}`, DD) + pr(c.b(c.forest('Item')), DI) + c.b(c.forest('Chance')));
    for (const drop of skillDrops) {
      const tierLabel = TIER_LABELS[drop.tier];
      const tierCol   = drop.tier === 'mythic'    ? c.mythic    :
                        drop.tier === 'legendary' ? c.legendary :
                        drop.tier === 'very_rare' ? c.veryrare  :
                        drop.tier === 'rare'      ? c.rare      : c.moss;
      const itemLabel = getItemLabel(drop.item);
      const pctStr    = drop.chance >= 0.01
        ? (drop.chance * 100).toFixed(1) + '%'
        : (drop.chance * 100).toFixed(3) + '%';
      lines.push(pr(tierCol(tierLabel), DD) + pr(c.white(itemLabel), DI) + c.dim(pctStr));
    }
  } else if (!hasJournal && skillDrops.length > 0) {
    lines.push('');
    lines.push(`  ${c.dim(`${skillDrops.length} possible bonus drops — buy Field Journal from shop to reveal chances`)}`);
  }

  lines.push('');
  lines.push(`  ${c.dim(`do ${skillName} <action> [qty]`)}`);
  return lines.join('\n');
}

// ── INVENTORY ──────────────────────────────────────────────────────────────
export function renderInventory(state: GameState, filter: string | null = null): string {
  const lines: string[] = [];

  // Resolve filter
  let filterLabel = '';
  let sortBy: 'price' | 'quantity' | null = null;
  let skillFilter: string | null = null;
  let rarityFilter = false;

  if (filter?.startsWith('--sort:')) {
    sortBy = filter.replace('--sort:', '') as 'price' | 'quantity';
    filterLabel = `sorted by ${sortBy}`;
  } else if (filter === 'rare') {
    rarityFilter = true;
    filterLabel = 'rare+';
  } else if (filter && SKILL_NAMES.includes(filter as any)) {
    skillFilter = filter;
    filterLabel = filter;
  }

  const title = filterLabel ? `INVENTORY  [${filterLabel}]` : 'INVENTORY';
  lines.push(headerBar(state, title));
  lines.push('');

  const inv = state.inventory;
  let keys  = Object.keys(inv).filter(k => inv[k] > 0);

  // Apply filters
  if (skillFilter) {
    keys = keys.filter(k => (getItemDef(k)?.category ?? '') === skillFilter);
  }
  if (rarityFilter) {
    const RARE_SET = new Set(['rare','very_rare','legendary','mythic']);
    keys = keys.filter(k => RARE_SET.has(getItemDef(k)?.rarity ?? ''));
  }

  // Sorting
  if (sortBy === 'price') {
    keys.sort((a, b) => getSellPrice(b) - getSellPrice(a));
  } else if (sortBy === 'quantity') {
    keys.sort((a, b) => inv[b] - inv[a]);
  } else {
    keys.sort();
  }

  if (keys.length === 0) {
    lines.push(`  ${c.dim(filter ? `No items matching filter '${filter}'.` : 'Your inventory is empty.')}`);
    lines.push(`  ${c.dim('Start foraging, woodcutting, or fishing to gather resources.')}`);
  } else {
    const totalValue = keys.reduce((s, k) => s + getSellPrice(k) * inv[k], 0);
    lines.push(`  ${c.dim(`${keys.length} item types  ·  est. sell value:`)} ${c.gold(totalValue.toLocaleString() + 'g')}`);
    lines.push('');
    lines.push(`  ${thinRule()}`);

    const RARITY_ICON: Record<string, string> = {
      common:'', uncommon:'', rare:'🔵', very_rare:'🟣', legendary:'🟠', mythic:'💀'
    };

    const LW = 44;
    const half  = Math.ceil(keys.length / 2);
    const left  = keys.slice(0, half);
    const right = keys.slice(half);
    const rows  = Math.max(left.length, right.length);

    for (let i = 0; i < rows; i++) {
      const fmtItem = (k: string | undefined) => {
        if (!k) return '';
        const def      = getItemDef(k);
        const label    = getItemLabel(k);
        const qty      = `×${inv[k].toLocaleString()}`;
        const price    = getSellPrice(k);
        const icon     = RARITY_ICON[def?.rarity ?? ''] ?? '';
        const iconPad  = icon ? icon + ' ' : '  ';
        return pr(`  ${iconPad}${pr(c.white(label), 23)}  ${pr(c.gold(qty), 8)}`, LW) + c.dim(price + 'g');
      };
      lines.push(pr(fmtItem(left[i]), LW + 14) + fmtItem(right[i]));
    }
  }

  lines.push('');
  lines.push(`  ${thinRule()}`);
  lines.push(`  ${c.dim('inv [skill]  ·  inv rare  ·  inv --sort price  ·  sell <item> [qty]')}`);
  return lines.join('\n');
}

// ── SHOP ───────────────────────────────────────────────────────────────────
export function renderShop(state: GameState): string {
  const lines: string[] = [];
  lines.push(headerBar(state, 'THE VERDANT EXCHANGE'));
  lines.push('');
  lines.push(`  ${c.dim('Gold available:')} ${c.gold((state.gold ?? 0).toLocaleString() + 'g')}`);
  lines.push('');

  const owned = state.ownedUtilities ?? [];
  const gold  = state.gold ?? 0;

  const categories: Array<{title:string, desc:string, cat:string}> = [
    { title:'🌀 Boosts',    desc:'Temporary bonuses',     cat:'boost'   },
    { title:'📦 Lootboxes', desc:'Chance at rare items',  cat:'lootbox' },
    { title:'🔧 Utility',   desc:'Permanent upgrades',    cat:'utility' },
  ];

  for (const { title, desc, cat } of categories) {
    const items = SHOP_ITEMS.filter(i => i.category === cat);
    lines.push(`  ${c.b(c.forest(title))}  ${c.dim(desc)}`);
    lines.push(`  ${thinRule()}`);
    for (const item of items) {
      const isOwned    = item.oneTime && owned.includes(item.id);
      const canAfford  = gold >= item.price;
      const nameCol    = isOwned ? c.dim : c.white;
      const costCol    = isOwned ? c.dim : canAfford ? c.gold : c.red;
      const ownedTag   = isOwned ? `  ${c.dim('[owned]')}` : '';
      const costStr    = item.price.toLocaleString() + 'g';
      lines.push(`  ${pr(nameCol(item.label), 28)}  ${pr(costCol(costStr), 10)}  ${c.dim(item.desc)}${ownedTag}`);
    }
    lines.push('');
  }

  lines.push(`  ${c.dim("buy <item>  ·  sell <item> [qty]  ·  sell <item> --all")}`);
  return lines.join('\n');
}

// ── EVENT LOG ──────────────────────────────────────────────────────────────
export function renderLog(state: GameState, filterCat?: string, n = 30): string {
  const lines: string[] = [];
  lines.push(headerBar(state, 'EVENT LOG'));
  lines.push('');

  let logs = state.log;
  if (filterCat === 'drops') {
    // 'drops' keyword: show all drop-related events (rare_drop + general action completions)
    logs = logs.filter(e => e.category === 'rare_drop' || e.category === 'general');
  } else if (filterCat) {
    logs = logs.filter(e => e.category === filterCat);
  }
  logs = logs.slice(0, n);

  if (logs.length === 0) {
    lines.push(`  ${c.dim('No events recorded yet.')}`);
  } else {
    const FILTER_LABELS: Record<string, string> = {
      rare_drop:'rare drops', level_up:'level ups', combat:'combat', drops:'drops', general:'general',
    };
    const filterLabel = filterCat ? FILTER_LABELS[filterCat] ?? filterCat : '';
    const filterNote  = filterLabel ? `  (filter: ${filterLabel})` : '';
    lines.push(`  ${c.dim(`Showing ${logs.length} events${filterNote}`)}`);
    lines.push('');
    for (const e of logs) {
      const t   = fmtTime(e.ts);
      const col = e.category === 'rare_drop' ? c.rare :
                  e.category === 'level_up'  ? c.gold :
                  e.category === 'combat'    ? c.red  : c.dim;
      lines.push(`  ${c.dim(`[${t}]`)}  ${col(e.text)}`);
    }
  }

  lines.push('');
  lines.push(`  ${c.dim('log [drops|rare|level|combat]  ·  log --n <count>')}`);
  return lines.join('\n');
}

// ── SEASON ─────────────────────────────────────────────────────────────────
export function renderSeason(state: GameState): string {
  const lines: string[] = [];
  lines.push(headerBar(state, 'SEASON'));
  lines.push('');

  const season  = getSeason(state);
  const emoji   = SEASON_EMOJIS[season];
  const sLabel  = SEASON_LABELS[season];
  const bonuses = SEASON_BONUSES[season] ?? {};
  const remaining = seasonTimeRemaining(state);
  const pct = 1 - remaining / (60 * 60 * 24 * 3);

  lines.push(`  ${c.b(c.moss(`${emoji}  ${sLabel}`))}`);
  lines.push('');
  lines.push(`  Progress  ${progressBar(pct, 30)}  ${c.dim(fmtDuration(remaining) + ' remaining')}`);
  lines.push('');

  const seasons = ['spring','summer','autumn','winter'] as const;
  const nextSeason = seasons[(state.seasonIndex + 1) % 4];
  lines.push(`  ${c.dim('Next season:')}  ${SEASON_EMOJIS[nextSeason]} ${c.white(SEASON_LABELS[nextSeason])}`);
  lines.push('');

  lines.push(`  ${c.b(c.forest('Active Effects'))}`);
  lines.push(`  ${thinRule()}`);
  const bonusEntries = Object.entries(bonuses);
  if (bonusEntries.length > 0) {
    for (const [skill, mod] of bonusEntries) {
      const skillLabel = SKILL_LABELS[skill] ?? skill;
      const modCol = mod > 0 ? c.moss : c.red;
      lines.push(`  ${pr(c.white(skillLabel), 22)} ${modCol((mod > 0 ? '+' : '') + mod + '%')}`);
    }
  } else {
    lines.push(`  ${c.dim('No modifiers this season')}`);
  }

  lines.push('');
  lines.push(`  ${c.b(c.forest('Season-Exclusive Content'))}`);
  lines.push(`  ${thinRule()}`);
  for (const item of SEASON_EXCLUSIVES[season] ?? []) {
    lines.push(`  ${c.gold('✦')}  ${c.white(item)}`);
  }

  return lines.join('\n');
}

// ── STATS ──────────────────────────────────────────────────────────────────
export function renderStats(state: GameState): string {
  const lines: string[] = [];
  lines.push(headerBar(state, 'STATS'));
  lines.push('');

  const pct    = getCompletionPct(state);
  const ctitle = completionTitle(pct);
  const season = getSeason(state);

  lines.push(`  ${c.dim('Title')}     ${c.b(c.moss(ctitle))}`);
  lines.push(`  ${c.dim('Gold')}      ${c.gold((state.gold ?? 0).toLocaleString() + 'g')}`);
  lines.push(`  ${c.dim('Playtime')}  ${c.white(fmtPlaytime(state.playedSeconds))}`);
  lines.push(`  ${c.dim('Season')}    ${SEASON_EMOJIS[season]} ${c.white(SEASON_LABELS[season])}  ${c.dim(fmtDuration(seasonTimeRemaining(state)) + ' remaining')}`);
  lines.push('');

  // Completion breakdown
  lines.push(`  ${c.b(c.forest('Completion Tracker'))}`);
  lines.push(`  ${thinRule()}`);

  const BD: Record<string, string> = {
    skillLevels:    'Skill Levels',
    actionMastery:  'Action Mastery',
    itemCollection: 'Item Collection',
    rareDrops:      'Rare Drops',
    combat:         'Combat',
    worldMilestones:'World Milestones',
  };
  const BW: Record<string, string> = {
    skillLevels:'40%', actionMastery:'20%', itemCollection:'15%',
    rareDrops:'10%', combat:'10%', worldMilestones:' 5%',
  };

  const breakdown = getCompletionBreakdown(state);
  for (const [cat, [cur, tot]] of Object.entries(breakdown)) {
    const cpct  = tot > 0 ? cur / tot : 0;
    const bar   = progressBar(cpct, 18);
    const pctStr = (cpct * 100).toFixed(1) + '%';
    lines.push(
      pr(`  ${c.white(BD[cat])}`, 22) +
      `${bar}  ` +
      pr(c.dim(`${cur}/${tot}`), 14) +
      pr(c.moss(pctStr), 8) +
      c.dim('wt ' + BW[cat])
    );
  }
  lines.push('');
  const totalFill = Math.round(pct / 100 * 26);
  const totalBar  = `[${c.moss('█'.repeat(totalFill))}${c.dim('░'.repeat(26 - totalFill))}]`;
  lines.push(`  ${pr(c.b(c.white('TOTAL')), 22)}${totalBar}  ${c.b(c.moss(pct.toFixed(1) + '%'))}  ${c.gold(ctitle)}`);

  // Buffs
  lines.push('');
  lines.push(`  ${c.b(c.forest('Active Buffs'))}`);
  lines.push(`  ${thinRule()}`);
  const activeBufls = state.buffs.filter(b => b.expiresAt > Date.now()/1000);
  if (activeBufls.length > 0) {
    for (const b of activeBufls) {
      const rem = b.expiresAt - Date.now()/1000;
      lines.push(`  ${c.gold('✦')}  ${pr(c.white(b.name), 26)} ${pr(c.moss(b.effect), 22)} ${c.dim(fmtDuration(rem))}`);
    }
  } else {
    lines.push(`  ${c.dim('No active buffs')}`);
  }

  // Companions — derived from inventory (companion items)
  lines.push('');
  lines.push(`  ${c.b(c.forest('Companions'))}`);
  lines.push(`  ${thinRule()}`);

  const COMPANION_INFO: Record<string, { label: string; bonus: string }> = {
    rabbit_companion:      { label:'Rabbit',       bonus:'Passively gathers Wildberries & Herbs' },
    fox_companion:         { label:'Forest Fox',   bonus:'Passively finds Rare Seeds & River Herbs' },
    owl_companion:         { label:'Owl',          bonus:'Passively collects Stardust' },
    boar_companion:        { label:'Wild Boar',    bonus:'Passively drops hides & Charcoal' },
    otter_companion:       { label:'River Otter',  bonus:'Passively catches Fish & River Stones' },
    bear_companion:        { label:'Forest Bear',  bonus:'Passively brings Ironbark Shards' },
    moon_deer_companion:   { label:'Moon Deer',    bonus:'Passively collects Moonbloom & Moon data' },
    storm_eagle_companion: { label:'Storm Eagle',  bonus:'Passively brings Sky Maps & Aurora Shards' },
    ancient_stag_companion:{ label:'Ancient Stag', bonus:'Passively finds Spirit Herbs (rare: Heartroot)' },
  };

  const activeCompanions = Object.entries(COMPANION_INFO).filter(([id]) => (state.inventory[id] ?? 0) > 0);
  if (activeCompanions.length > 0) {
    for (const [, info] of activeCompanions) {
      lines.push(`  ${c.moss('🐾')} ${pr(c.white(info.label), 20)} ${c.dim(info.bonus)}`);
    }
  } else {
    lines.push(`  ${c.dim('No companions yet — level Beastmastery to tame animals')}`);
  }

  lines.push('');
  lines.push(`  ${c.dim('completion  ·  completion actions  ·  completion drops  ·  completion milestones')}`);
  return lines.join('\n');
}

// ── HELP ───────────────────────────────────────────────────────────────────
const ALL_COMMANDS = [
  ['go <dest>',               'Navigate to a screen (help go for full list)'],
  ['back',                    'Return to previous screen'],
  ['home',                    'Jump to main HUD from anywhere'],
  ['do <skill> <action> [qty]','Start action immediately (--keep to preserve queue)'],
  ['queue <skill> <action> [qty]','Add to queue. Starts immediately if idle'],
  ['stop [--all]',            'Stop current action (--all also clears queue)'],
  ['clear [--all]',           'Clear queue (--all also stops current)'],
  ['q [remove <n>|move <a> <b>]','View / manage the queue'],
  ['inv [skill|rare]',        'Inventory, optionally filtered'],
  ['inspect <item>',          'Detailed item info'],
  ['shop [boosts|lootboxes|utility]','Open The Verdant Exchange'],
  ['buy <item> [qty]',        'Purchase from shop'],
  ['sell <item> [qty|--all]', 'Sell items for gold (no confirmation)'],
  ['skills',                  'All 15 skills with level overview'],
  ['skill <name>',            'Full detail: sub-actions, requirements, XP'],
  ['stats',                   'Character overview, completion tracker, buffs'],
  ['log [filter]',            'Event log (drops | rare | level | combat)'],
  ['season',                  'Current season, bonuses, exclusive content'],
  ['completion [view]',       'Detailed tracker: actions, drops, combat, milestones, sets'],
  ['debug <sub>',             'Dev tools: season, addxp, addgold, additem'],
  ['help [command]',          'This screen, or help for a specific command'],
];

interface HelpPage {
  usage:    string;
  desc:     string;
  args:     Array<[string, string]>;
  examples: string[];
}

const HELP_PAGES: Record<string, HelpPage> = {
  go: {
    usage: 'go <screen>',
    desc:  'Navigate to a different screen.',
    args:  [['screen', 'home · skills · inventory · shop · log · season · stats']],
    examples: ['go home', 'go shop', 'go skills'],
  },
  do: {
    usage: 'do <skill> <action> [qty] [--keep]',
    desc:  'Start an action immediately. Clears the queue unless --keep is used.',
    args:  [
      ['skill',  'skill name e.g. foraging, brewing, combat'],
      ['action', 'sub-action name e.g. gather_wildberries, brew_chamomile_tea'],
      ['qty',    'repetitions. 0 = infinite. Default: 1'],
      ['--keep', 'preserve the existing queue when starting'],
    ],
    examples: ['do foraging gather_wildberries', 'do foraging gather_wildberries 20', 'do brewing brew_chamomile_tea 0', 'do foraging gather_moonbloom --keep'],
  },
  queue: {
    usage: 'queue <skill> <action> [qty]',
    desc:  'Add an action to the end of the queue. Starts immediately if the queue is empty.',
    args:  [
      ['skill',  'skill name'],
      ['action', 'sub-action name'],
      ['qty',    'repetitions. 0 = infinite. Default: 1'],
    ],
    examples: ['queue brewing brew_chamomile_tea 5', 'queue woodcutting chop_birch 0'],
  },
  stop: {
    usage: 'stop [--all]',
    desc:  'Stop the currently running action. Partial progress is lost.',
    args:  [['--all', 'also clear the entire queue']],
    examples: ['stop', 'stop --all'],
  },
  clear: {
    usage: 'clear [--all]',
    desc:  'Clear all queued actions without stopping the current one.',
    args:  [['--all', 'also stop the currently running action']],
    examples: ['clear', 'clear --all'],
  },
  q: {
    usage: 'q [remove <n> | move <a> <b>]',
    desc:  'View and manage the action queue.',
    args:  [
      ['(none)',      'show the queue'],
      ['remove <n>',  'remove the entry at slot n'],
      ['move <a> <b>','swap slots a and b'],
    ],
    examples: ['q', 'q remove 3', 'q move 1 4'],
  },
  view: {
    usage: 'view <target> [args]',
    desc:  'Inspect an action, item, or skill in detail.',
    args:  [
      ['action <skill> <action>', 'full info on a sub-action: duration, XP, output, requirements'],
      ['item <name>',             'item detail: sell price, rarity, which actions produce it'],
      ['skill <name>',            'shortcut for the skill detail screen'],
    ],
    examples: ['view action foraging gather_moonbloom', 'view action brewing brew_clarity_potion', 'view item moonbloom_petals', 'view skill combat'],
  },
  inv: {
    usage: 'inv [filter] [--sort price|quantity]',
    desc:  'Show your inventory, optionally filtered and sorted.',
    args:  [
      ['(none)',        'all items, sorted alphabetically'],
      ['<skill>',       'only items from that skill category'],
      ['rare',          'only uncommon rarity and above'],
      ['--sort price',  'sort by sell value descending'],
      ['--sort quantity','sort by quantity descending'],
    ],
    examples: ['inv', 'inv foraging', 'inv rare', 'inv --sort price', 'inv brewing --sort quantity'],
  },
  inspect: {
    usage: 'inspect <item>',
    desc:  'Show full detail on an item: sell price, rarity, which actions produce it.',
    args:  [['item', 'item name (spaces or underscores both work)']],
    examples: ['inspect moonbloom_petals', 'inspect ancient bark'],
  },
  sell: {
    usage: 'sell <item> [qty] [--all]',
    desc:  'Sell items from your inventory for gold. No confirmation prompt — sells immediately.',
    args:  [
      ['item',  'item name (spaces or underscores both work)'],
      ['qty',   'how many to sell. Default: 1'],
      ['--all', 'sell your entire stack'],
    ],
    examples: ['sell wildberries 50', 'sell moonbloom_petals --all', 'sell birch_logs 200'],
  },
  buy: {
    usage: 'buy <item> [qty]',
    desc:  "Purchase from The Verdant Exchange. Type 'shop' to browse.",
    args:  [
      ['item', 'shop item name e.g. wanderers_focus, grove_chest, expanded_satchel'],
      ['qty',  'quantity (boosts and lootboxes only, default 1)'],
    ],
    examples: ['buy wanderers_focus', 'buy grove_chest 3', 'buy field_journal'],
  },
  skill: {
    usage: 'skill <name>',
    desc:  'Full detail page for a skill: level, XP progress, all sub-actions with requirements.',
    args:  [['name', 'skill name e.g. foraging, combat, ritualism']],
    examples: ['skill foraging', 'skill combat', 'skill brew'],
  },
  log: {
    usage: 'log [filter] [--n <count>]',
    desc:  'Show the event log.',
    args:  [
      ['(none)',    'last 30 events'],
      ['drops',     'item drops only'],
      ['rare',      'rare tier drops and above'],
      ['level',     'level-up events only'],
      ['combat',    'combat events only'],
      ['--n <num>', 'show N events (max 200)'],
    ],
    examples: ['log', 'log rare', 'log level', 'log --n 100'],
  },
  season: {
    usage: 'season',
    desc:  'Current season info: time remaining, active bonuses, exclusive content, next season.',
    args:  [],
    examples: ['season'],
  },
  completion: {
    usage: 'completion [view]',
    desc:  'Detailed completion tracker. Without a subview shows the overview.',
    args:  [
      ['(none)',      'overview with category bars and legendary set progress'],
      ['actions',     'per-skill action mastery — which actions you have and haven\'t done'],
      ['drops',       'all 41 trackable rare drops, grouped by skill'],
      ['combat',      'per-enemy kill counts and completion points'],
      ['milestones',  'all 20 world milestones with ✓/○ status and descriptions'],
      ['sets',        'legendary set piece checklist and rewards'],
    ],
    examples: ['completion', 'completion actions', 'completion drops', 'completion combat', 'completion milestones', 'completion sets'],
  },
  debug: {
    usage: 'debug <subcommand>',
    desc:  'Development tools. Useful for testing seasonal content and late-game areas.',
    args:  [
      ['season',            'advance to the next season immediately'],
      ['addxp <skill> <n>', 'add N XP to a skill'],
      ['addgold <n>',       'add N gold'],
      ['additem <item> [n]','add N of an item to inventory'],
    ],
    examples: ['debug season', 'debug addxp foraging 5000', 'debug addgold 10000', 'debug additem moonbloom_petals 10'],
  },
  stats: {
    usage: 'stats',
    desc:  'Character overview: completion tracker, active buffs, companions, gold, playtime.',
    args:  [],
    examples: ['stats'],
  },
};

export function renderHelp(state: GameState, topic?: string | null): string {
  const lines: string[] = [];

  if (topic && HELP_PAGES[topic]) {
    const page = HELP_PAGES[topic];
    lines.push(headerBar(state, `HELP — ${topic.toUpperCase()}`));
    lines.push('');
    lines.push(`  ${c.b(c.moss(page.usage))}`);
    lines.push('');
    lines.push(`  ${c.white(page.desc)}`);

    if (page.args.length > 0) {
      lines.push('');
      lines.push(`  ${c.b(c.forest('Arguments'))}`);
      lines.push(`  ${thinRule()}`);
      for (const [arg, desc] of page.args) {
        lines.push(`  ${pr(c.gold(arg), 28)}  ${c.dim(desc)}`);
      }
    }

    if (page.examples.length > 0) {
      lines.push('');
      lines.push(`  ${c.b(c.forest('Examples'))}`);
      lines.push(`  ${thinRule()}`);
      for (const ex of page.examples) {
        lines.push(`  ${c.moss('❯')}  ${c.white(ex)}`);
      }
    }

    lines.push('');
    lines.push(`  ${c.dim("back  — return  ·  help  — full command list")}`);
  } else {
    lines.push(headerBar(state, 'HELP'));
    lines.push('');
    if (topic) {
      lines.push(`  ${c.dim(`No help page for '${topic}'.`)}`);
      lines.push('');
    }
    lines.push(`  ${c.b(c.forest('All Commands'))}`);
    lines.push(`  ${thinRule()}`);
    for (const [cmd, desc] of ALL_COMMANDS) {
      const hasPage = !!HELP_PAGES[cmd.split(' ')[0]];
      const indicator = hasPage ? c.dim('?') : ' ';
      lines.push(`  ${indicator} ${pr(c.gold(cmd), 34)}  ${c.dim(desc)}`);
    }
    lines.push('');
    lines.push(`  ${c.dim('help <command>  — detailed help  ·  ? = has detail page')}`);
  }

  return lines.join('\n');
}

// ── PLACEHOLDER ────────────────────────────────────────────────────────────
export function renderPlaceholder(state: GameState, name: string): string {
  const lines: string[] = [];
  lines.push(headerBar(state, name.toUpperCase()));
  lines.push('');
  lines.push(`  ${c.moss(`[ ${name} ]`)}`);
  lines.push('');
  lines.push(`  ${c.dim('This screen is under construction.')}`);
  lines.push('');
  return lines.join('\n');
}


// ── ACTION DETAIL ──────────────────────────────────────────────────────────
export function renderActionDetail(state: GameState, skillName: string, actionName: string): string {
  const lines: string[] = [];
  const skillDef = SKILLS[skillName];
  const action   = skillDef?.actions.find(a => a.name === actionName);

  if (!skillDef || !action) {
    lines.push(headerBar(state, 'ACTION DETAIL'));
    lines.push('');
    lines.push(`  ${c.red(`Unknown action '${actionName}' in skill '${skillName}'.`)}`);
    return lines.join('\n');
  }

  const unlocked = action.requires.every(r => getSkillLevel(state, r.skill)[0] >= r.level);
  lines.push(headerBar(state, `${skillDef.label.toUpperCase()} — ${action.label.toUpperCase()}`));
  lines.push('');

  // Status + duration
  const statusCol = unlocked ? c.moss : c.red;
  const statusStr = unlocked ? '✓ Unlocked' : '✗ Locked';
  lines.push(`  ${statusCol(statusStr)}    ${c.dim('Duration:')} ${c.white(action.duration + 's')}    ${c.dim('XP per action:')} ${c.moss(String(action.xp))}`);
  if (action.season) lines.push(`  ${c.dim('Season restriction:')} ${c.gold(action.season.charAt(0).toUpperCase() + action.season.slice(1) + ' only')}`);
  lines.push('');

  // Requirements
  lines.push(`  ${c.b(c.forest('Requirements'))}`);
  lines.push(`  ${thinRule()}`);
  if (action.requires.length === 0) {
    lines.push(`  ${c.dim('None — available from the start')}`);
  } else {
    for (const req of action.requires) {
      const have = getSkillLevel(state, req.skill)[0];
      const met  = have >= req.level;
      const col  = met ? c.moss : c.red;
      lines.push(`  ${col(met ? '✓' : '✗')} ${pr(c.white(SKILL_LABELS[req.skill] ?? req.skill), 18)} ${col(`Level ${req.level}`)}  ${c.dim(`(you have ${have})`)}`);
    }
  }

  // Output
  lines.push('');
  lines.push(`  ${c.b(c.forest('Guaranteed Output'))}`);
  lines.push(`  ${thinRule()}`);
  if (action.output.length === 0) {
    lines.push(`  ${c.dim('No item output — XP only')}`);
  } else {
    for (const o of action.output) {
      const label = getItemLabel(o.item);
      const price = getSellPrice(o.item);
      const qty   = o.qtyMin === o.qtyMax ? `×${o.qtyMin}` : `×${o.qtyMin}–${o.qtyMax}`;
      lines.push(`  ${pr(c.white(label), 28)} ${pr(c.gold(qty), 8)} ${c.dim(price + 'g ea')}`);
    }
  }

  // Bonus drops
  const drops = SKILL_DROPS[skillName] ?? [];
  if (drops.length > 0) {
    lines.push('');
    lines.push(`  ${c.b(c.forest('Possible Bonus Drops'))}  ${c.dim('(chance per action completion)')}`);
    lines.push(`  ${thinRule()}`);
    const hasJournal = (state.ownedUtilities ?? []).includes('field_journal');
    for (const drop of drops) {
      const label = getItemLabel(drop.item);
      const tierCol = drop.tier === 'mythic' ? c.mythic : drop.tier === 'legendary' ? c.legendary :
                      drop.tier === 'very_rare' ? c.veryrare : drop.tier === 'rare' ? c.rare : c.moss;
      const pctStr = hasJournal
        ? (drop.chance >= 0.01 ? (drop.chance*100).toFixed(1)+'%' : (drop.chance*100).toFixed(3)+'%')
        : '???';
      lines.push(`  ${pr(tierCol(TIER_LABELS[drop.tier]), 16)} ${pr(c.white(label), 28)} ${c.dim(pctStr)}`);
    }
    if (!hasJournal) {
      lines.push('');
      lines.push(`  ${c.dim('Buy the Field Journal from the shop to reveal exact drop chances.')}`);
    }
  }

  lines.push('');
  lines.push(`  ${c.dim(`do ${skillName} ${action.name} [qty]  ·  back`)}`);
  return lines.join('\n');
}

// ── ITEM INSPECT ────────────────────────────────────────────────────────────
export function renderInspectItem(state: GameState, itemName: string): string {
  const lines: string[] = [];
  const def = getItemDef(itemName);
  const qty = state.inventory[itemName] ?? 0;
  const label = getItemLabel(itemName);

  lines.push(headerBar(state, `ITEM — ${label.toUpperCase()}`));
  lines.push('');

  if (!def && qty === 0) {
    lines.push(`  ${c.red(`Unknown item '${itemName}'.`)}`);
    return lines.join('\n');
  }

  const RARITY_COL: Record<string, (t:string)=>string> = {
    common: c.dim, uncommon: c.moss, rare: c.rare,
    very_rare: c.veryrare, legendary: c.legendary, mythic: c.mythic,
  };
  const rarity    = def?.rarity ?? 'common';
  const rarityCol = RARITY_COL[rarity] ?? c.dim;
  const price     = getSellPrice(itemName);

  lines.push(`  ${c.b(c.white(label))}`);
  lines.push('');
  lines.push(`  ${c.dim('Rarity:')}    ${rarityCol(rarity.replace('_',' ').replace(/\b\w/g,x=>x.toUpperCase()))}`);
  lines.push(`  ${c.dim('Category:')}  ${c.white(def?.category ?? '—')}`);
  lines.push(`  ${c.dim('Sell price:')}${c.gold(' ' + price.toLocaleString() + 'g each')}`);
  lines.push(`  ${c.dim('In inventory:')}${qty > 0 ? c.white(' ' + qty.toLocaleString()) : c.dim(' 0')}`);
  if (qty > 0) {
    lines.push(`  ${c.dim('Stack value:')} ${c.gold((qty * price).toLocaleString() + 'g')}`);
  }

  // Which actions produce this item
  const sources: Array<{ skill: string; action: string; label: string }> = [];
  for (const [skillName, skillDef] of Object.entries(SKILLS)) {
    for (const a of skillDef.actions) {
      if (a.output.some(o => o.item === itemName)) {
        sources.push({ skill: skillName, action: a.name, label: a.label });
      }
    }
  }

  // Also check drop tables
  const dropSources: Array<{ skill: string; tier: string; chance: number }> = [];
  for (const [skillName, drops] of Object.entries(SKILL_DROPS)) {
    for (const d of drops) {
      if (d.item === itemName) dropSources.push({ skill: skillName, tier: d.tier, chance: d.chance });
    }
  }

  if (sources.length > 0) {
    lines.push('');
    lines.push(`  ${c.b(c.forest('Produced by'))}`);
    lines.push(`  ${thinRule()}`);
    for (const s of sources) {
      const sk  = SKILL_LABELS[s.skill] ?? s.skill;
      lines.push(`  ${c.white(s.label)}  ${c.dim('(' + sk + ')')}`);
    }
  }

  if (dropSources.length > 0) {
    const hasJournal = (state.ownedUtilities ?? []).includes('field_journal');
    lines.push('');
    lines.push(`  ${c.b(c.forest('Bonus drop from'))}`);
    lines.push(`  ${thinRule()}`);
    for (const d of dropSources) {
      const sk = SKILL_LABELS[d.skill] ?? d.skill;
      const tierCol = d.tier === 'mythic' ? c.mythic : d.tier === 'legendary' ? c.legendary :
                      d.tier === 'very_rare' ? c.veryrare : d.tier === 'rare' ? c.rare : c.moss;
      const pct = hasJournal
        ? ' (' + (d.chance >= 0.01 ? (d.chance*100).toFixed(1) : (d.chance*100).toFixed(3)) + '%)'
        : '';
      lines.push(`  ${pr(tierCol(TIER_LABELS[d.tier as any] ?? d.tier), 18)} ${c.white(sk)}${c.dim(pct)}`);
    }
  }

  if (qty > 0) {
    lines.push('');
    lines.push(`  ${c.dim(`sell ${itemName} [qty]  ·  sell ${itemName} --all`)}`);
  }

  return lines.join('\n');
}



// ── COMPLETION DETAIL SCREEN ────────────────────────────────────────────────
export function renderCompletion(state: GameState, sub: string | null): string {
  const lines: string[] = [];

  // Sub-views: null=overview, 'actions', 'drops', 'combat', 'milestones', 'sets'
  const SUBS = ['actions','drops','combat','milestones','sets'];
  const view = sub && SUBS.includes(sub) ? sub : null;

  if (!view) {
    // ── Overview ──────────────────────────────────────────────────────────────
    lines.push(headerBar(state, 'COMPLETION'));
    lines.push('');

    const pct    = getCompletionPct(state);
    const ctitle = completionTitle(pct);
    const fill   = Math.round(pct / 100 * 40);
    const bar    = `[${c.moss('█'.repeat(fill))}${c.dim('░'.repeat(40 - fill))}]`;
    lines.push(`  ${bar}  ${c.b(c.moss(pct.toFixed(1) + '%'))}  ${c.gold(ctitle)}`);
    lines.push('');

    const BD: Record<string,string> = {
      skillLevels:'Skill Levels', actionMastery:'Action Mastery',
      itemCollection:'Item Collection', rareDrops:'Rare Drops',
      combat:'Combat', worldMilestones:'World Milestones',
    };
    const BW: Record<string,string> = {
      skillLevels:'40%', actionMastery:'20%', itemCollection:'15%',
      rareDrops:'10%', combat:'10%', worldMilestones:' 5%',
    };
    const HINT: Record<string,string> = {
      skillLevels:   'level any skill to progress',
      actionMastery: 'completion actions — see details',
      itemCollection:'discover new items via drops or crafting',
      rareDrops:     'completion drops — see details',
      combat:        'completion combat — see details',
      worldMilestones:'completion milestones — see details',
    };

    const breakdown = getCompletionBreakdown(state);
    lines.push(`  ${c.b(c.forest('Category Breakdown'))}`);
    lines.push(`  ${thinRule()}`);
    for (const [cat, [cur, tot]] of Object.entries(breakdown)) {
      const cpct  = tot > 0 ? cur / tot : 0;
      const bar2  = progressBar(cpct, 20);
      const pctStr = (cpct * 100).toFixed(1) + '%';
      lines.push(
        pr(`  ${c.white(BD[cat])}`, 20) +
        `${bar2}  ` +
        pr(c.dim(`${cur}/${tot}`), 12) +
        pr(c.moss(pctStr), 8) +
        c.dim(BW[cat] + ' · ' + HINT[cat])
      );
    }

    lines.push('');
    lines.push(`  ${c.b(c.forest('Legendary Sets'))}`);
    lines.push(`  ${thinRule()}`);
    for (const [, set] of Object.entries(LEGENDARY_SETS)) {
      const have = set.pieces.reduce((n, p) => n + Math.min(state.inventory[p] ?? 0, 1), 0);
      // Special case: druids_awakening uses qty 5 of one item
      const total = set.pieces.length === 1 ? 5 : set.pieces.length;
      const actual = set.pieces.length === 1 ? Math.min(state.inventory[set.pieces[0]] ?? 0, 5) : have;
      const done   = actual >= total;
      const bar3   = progressBar(actual / total, 10);
      const col    = done ? c.gold : c.white;
      lines.push(`  ${done ? c.gold('★') : c.dim('○')} ${pr(col(set.label), 28)} ${bar3}  ${c.dim(`${actual}/${total} pieces`)}`);
      if (done) lines.push(`    ${c.moss('Reward:')} ${c.dim(set.reward)}`);
    }

    lines.push('');
    lines.push(`  ${c.dim('completion actions  ·  drops  ·  combat  ·  milestones  ·  sets')}`);
    return lines.join('\n');
  }

  if (view === 'actions') {
    // ── Action Mastery ────────────────────────────────────────────────────────
    lines.push(headerBar(state, 'COMPLETION — ACTION MASTERY'));
    lines.push('');
    const mastered = new Set(state.completion.actionMastery);
    let totalDone = 0, totalAll = 0;

    // Iterate SKILLS directly (imported at top of file)
    for (const skillName of SKILL_NAMES) {
      const skillDef = SKILLS[skillName];
      if (!skillDef || skillDef.actions.length === 0) continue;
      const done = skillDef.actions.filter(a => mastered.has(`${skillName}.${a.name}`)).length;
      const all  = skillDef.actions.length;
      totalDone += done; totalAll += all;
      const allDone = done === all;
      const bar2 = progressBar(done / all, 12);
      const col  = allDone ? c.gold : done > 0 ? c.moss : c.dim;
      lines.push(
        pr(`  ${allDone ? c.gold('★') : c.dim('○')} ${col(skillDef.label)}`, 22) +
        `${bar2}  ` +
        pr(c.dim(`${done}/${all}`), 8)
      );
      // Show unmastered actions if partially done
      if (done > 0 && done < all) {
        const unmastered = skillDef.actions.filter(a => !mastered.has(`${skillName}.${a.name}`));
        for (const a of unmastered.slice(0, 3)) {
          lines.push(`    ${c.dim('○')} ${c.dim(a.label)}`);
        }
        if (unmastered.length > 3) lines.push(`    ${c.dim(`  … and ${unmastered.length - 3} more`)}`);
      } else if (done === 0) {
        lines.push(`    ${c.dim('Not started')}`);
      }
    }
    lines.push('');
    const totalPct = totalAll > 0 ? (totalDone / totalAll * 100).toFixed(1) : '0.0';
    lines.push(`  ${c.b(c.white('Total:'))} ${c.moss(totalDone + '/' + totalAll)} ${c.dim('(' + totalPct + '%)')}`);
    return lines.join('\n');
  }

  if (view === 'drops') {
    // ── Rare Drops ────────────────────────────────────────────────────────────
    lines.push(headerBar(state, 'COMPLETION — RARE DROPS'));
    lines.push('');
    const found   = new Set(state.completion.rareDrops);
    const bySkill: Record<string, typeof TRACKABLE_DROP_LIST> = {};
    for (const d of TRACKABLE_DROP_LIST) {
      if (!bySkill[d.skill]) bySkill[d.skill] = [];
      bySkill[d.skill].push(d);
    }
    let totalFound = 0;
    for (const skillName of SKILL_NAMES) {
      const drops = bySkill[skillName];
      if (!drops || drops.length === 0) continue;
      const doneDrops = drops.filter(d => found.has(d.id));
      totalFound += doneDrops.length;
      lines.push(`  ${c.b(c.forest(SKILL_LABELS[skillName]))}  ${c.dim(doneDrops.length + '/' + drops.length)}`);
      for (const d of drops) {
        const got = found.has(d.id);
        const TIER_COLS: Record<string,(t:string)=>string> = {
          rare:c.rare, very_rare:c.veryrare, legendary:c.legendary, mythic:c.mythic
        };
        const tierCol = TIER_COLS[d.tier] ?? c.moss;
        const icon    = got ? c.gold('✓') : c.dim('○');
        const nameCol = got ? c.white : c.dim;
        lines.push(`  ${icon}  ${pr(nameCol(d.label), 32)} ${tierCol(d.tier.replace('_',' '))}`);
      }
      lines.push('');
    }
    lines.push(`  ${c.b(c.white('Total:'))} ${c.moss(totalFound + '/' + TRACKABLE_DROP_LIST.length)}`);
    return lines.join('\n');
  }

  if (view === 'combat') {
    // ── Combat ────────────────────────────────────────────────────────────────
    lines.push(headerBar(state, 'COMPLETION — COMBAT'));
    lines.push('');
    const kills = state.completion.combatKills ?? {};
    const combatSkill = SKILLS['combat'];
    if (!combatSkill) { lines.push(`  ${c.dim('No combat data.')}`); return lines.join('\n'); }

    let points = 0;
    lines.push(`  ${c.dim('First kill of each enemy = 2 completion points')}`);
    lines.push('');
    lines.push(`  ${pr(c.b(c.forest('Enemy')), 36)} ${pr(c.b(c.forest('Kills')), 10)} ${c.b(c.forest('Points'))}`);
    lines.push(`  ${thinRule()}`);
    for (const a of combatSkill.actions) {
      const k     = kills[a.name] ?? 0;
      const pts   = Math.min(k, 1) * 2;
      points += pts;
      const col   = k > 0 ? c.white : c.dim;
      const icon  = k > 0 ? c.gold('✓') : c.dim('○');
      lines.push(
        `  ${icon}  ` +
        pr(col(a.label), 34) +
        pr(k > 0 ? c.moss(k.toLocaleString()) : c.dim('0'), 10) +
        (k > 0 ? c.moss(String(pts)) : c.dim('0'))
      );
    }
    lines.push('');
    lines.push(`  ${c.b(c.white('Total points:'))} ${c.moss(points + '/26')}`);
    return lines.join('\n');
  }

  if (view === 'milestones') {
    // ── World Milestones ──────────────────────────────────────────────────────
    lines.push(headerBar(state, 'COMPLETION — WORLD MILESTONES'));
    lines.push('');
    const achieved = new Set(state.completion.worldMilestones);
    const CATS: Record<string, string> = {
      season:'Seasons', event:'Events', shop:'Shop', legendary:'Legendary Sets', endgame:'Endgame'
    };
    const grouped: Record<string, typeof WORLD_MILESTONES> = {};
    for (const m of WORLD_MILESTONES) {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push(m);
    }
    let totalAchieved = 0;
    for (const [cat, milestones] of Object.entries(grouped)) {
      lines.push(`  ${c.b(c.forest(CATS[cat] ?? cat))}`);
      lines.push(`  ${thinRule()}`);
      for (const m of milestones) {
        const done = achieved.has(m.id);
        if (done) totalAchieved++;
        const icon  = done ? c.gold('✓') : c.dim('○');
        const col   = done ? c.white : c.dim;
        lines.push(`  ${icon}  ${pr(col(m.label), 34)} ${c.dim(m.desc)}`);
      }
      lines.push('');
    }
    lines.push(`  ${c.b(c.white('Total:'))} ${c.moss(totalAchieved + '/' + WORLD_MILESTONES.length)}`);
    return lines.join('\n');
  }

  if (view === 'sets') {
    // ── Legendary Sets Detail ─────────────────────────────────────────────────
    lines.push(headerBar(state, 'COMPLETION — LEGENDARY SETS'));
    lines.push('');
    for (const [, set] of Object.entries(LEGENDARY_SETS)) {
      const isSingleItem = set.pieces.length === 1;
      const qty   = isSingleItem ? Math.min(state.inventory[set.pieces[0]] ?? 0, 5) : 0;
      const total = isSingleItem ? 5 : set.pieces.length;
      const actual = isSingleItem ? qty
        : set.pieces.filter(p => (state.inventory[p] ?? 0) > 0).length;
      const done   = actual >= total;

      lines.push(`  ${done ? c.gold('★') : c.dim('○')} ${c.b(done ? c.gold(set.label) : c.white(set.label))}`);
      lines.push(`  ${thinRule()}`);

      if (isSingleItem) {
        const have = state.inventory[set.pieces[0]] ?? 0;
        lines.push(`  ${c.dim('Piece:')}  ${c.white("Druid's Awakening Piece")}  ${have >= 1 ? c.moss('×' + have + ' collected') : c.dim('not yet found')}`);
        lines.push(`  ${c.dim('Progress:')} ${progressBar(actual / total, 20)}  ${c.dim(actual + '/5')}`);
        lines.push(`  ${c.dim('Source:  Foraging, Herbalism, Cultivation — mythic drop (0.01%)')}`);
      } else {
        for (const piece of set.pieces) {
          const have = (state.inventory[piece] ?? 0) > 0;
          const label = getItemLabel(piece);
          lines.push(`  ${have ? c.gold('✓') : c.dim('○')}  ${pr(have ? c.white(label) : c.dim(label), 34)} ${c.dim(have ? 'collected' : 'missing')}`);
        }
      }
      lines.push('');
      lines.push(`  ${c.dim('Reward:')} ${done ? c.moss(set.reward) : c.dim(set.reward)}`);
      lines.push('');
    }
    return lines.join('\n');
  }

  return lines.join('\n');
}

// ── LOOTBOX REVEAL ─────────────────────────────────────────────────────────
// Returns HTML (not plain text) so CSS animations work.
// The router must inject this via innerHTML, same as all other screens.
export function renderLootReveal(
  state: GameState,
  items: Array<{ item: string; qty: number; tier: string }> | null,
): string {
  if (!items || items.length === 0) {
    return [
      headerBar(state, 'LOOTBOX'),
      '',
      `  ${c.dim('The box was empty. The forest giveth and taketh away.')}`,
      '',
      `  ${c.dim('back  — return to shop')}`,
    ].join('\n');
  }

  // Determine best tier for screen flash
  const TIER_RANK: Record<string, number> = {
    uncommon:1, rare:2, very_rare:3, legendary:4, mythic:5,
  };
  const bestRank = items.reduce((best, d) => Math.max(best, TIER_RANK[d.tier] ?? 0), 0);
  const screenClass = bestRank >= 5 ? 'mythic-screen-flash'
                    : bestRank >= 4 ? 'legendary-screen-flash'
                    : bestRank >= 2 ? 'rare-screen-flash'
                    : '';

  // Build lines array — but we'll wrap item lines in <span> with animation classes
  // The header is plain text, items are HTML spans
  const lines: string[] = [];

  // Header + intro
  lines.push(headerBar(state, 'LOOTBOX OPENED'));
  lines.push('');
  lines.push(`  ${c.dim('━'.repeat(W))}`);
  lines.push('');

  // Item lines with staggered animation spans
  const TIER_GLYPH: Record<string, string> = {
    uncommon:'◆', rare:'◈', very_rare:'◉', legendary:'★', mythic:'✦',
  };
  const TIER_COL: Record<string, (t:string)=>string> = {
    uncommon:  c.moss,
    rare:      c.rare,
    very_rare: c.veryrare,
    legendary: c.legendary,
    mythic:    c.mythic,
  };
  const TIER_NAME: Record<string, string> = {
    uncommon:'uncommon', rare:'RARE', very_rare:'VERY RARE',
    legendary:'LEGENDARY', mythic:'✦ MYTHIC ✦',
  };

  for (let i = 0; i < items.length; i++) {
    const drop      = items[i];
    const tierCol   = TIER_COL[drop.tier] ?? c.dim;
    const glyph     = TIER_GLYPH[drop.tier] ?? '·';
    const tierName  = TIER_NAME[drop.tier] ?? drop.tier;
    const itemLabel = getItemLabel(drop.item);
    const sellVal   = getSellPrice(drop.item);
    const delayClass = `loot-d${Math.min(i, 7)}`;
    const extraClass = drop.tier === 'mythic' ? 'loot-mythic'
                     : drop.tier === 'legendary' ? 'loot-legendary'
                     : 'loot-reveal-item';

    // Build the visible content of this reveal line
    const leftPart  = `  ${tierCol(glyph + ' ' + tierName.padEnd(14))} ${c.white(itemLabel)} ×${drop.qty}`;
    const rightPart = c.dim(`  ${sellVal}g ea`);
    const lineHtml  = `<span class="${extraClass} ${delayClass}">${leftPart}${rightPart}</span>`;
    lines.push(lineHtml);
  }

  // Total sell value
  const totalVal = items.reduce((s, d) => s + getSellPrice(d.item) * d.qty, 0);
  lines.push('');
  lines.push(`  ${c.dim('─'.repeat(W))}`);
  lines.push(`  ${c.dim('Total sell value:')} ${c.gold(totalVal.toLocaleString() + 'g')}`);
  lines.push('');
  lines.push(`  ${c.dim('back  — return to shop  ·  inv rare  — view rare items')}`);

  // Emit a sentinel span so main.ts can read the desired flash class
  const flashSentinel = screenClass
    ? `<span id="loot-flash-signal" data-flash="${screenClass}" style="display:none"></span>`
    : '';

  return lines.join('\n') + flashSentinel;
}

// ── Router ─────────────────────────────────────────────────────────────────
export function renderScreen(state: GameState, nav: NavState): string {
  switch (nav.current) {
    case 'home':          return renderHome(state);
    case 'skills':        return renderSkills(state);
    case 'skill_detail':  return renderSkillDetail(state, nav.skillDetail ?? '');
    case 'inventory':     return renderInventory(state, nav.invFilter ?? null);
    case 'shop':          return renderShop(state);
    case 'log':           return renderLog(state, nav.logFilter ?? undefined, nav.logN ?? 30);
    case 'season':        return renderSeason(state);
    case 'stats':         return renderStats(state);
    case 'help':          return renderHelp(state, nav.helpTopic);
    case 'action_detail': return renderActionDetail(state, nav.actionDetail?.skill ?? '', nav.actionDetail?.action ?? '');
    case 'inspect_item':  return renderInspectItem(state, nav.invFilter ?? '');
    case 'loot_reveal':   return renderLootReveal(state, nav.lootReveal ?? null);
    case 'completion':    return renderCompletion(state, nav.helpTopic);
    default:              return renderPlaceholder(state, nav.current);
  }
}
