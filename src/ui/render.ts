// ── render.ts ──────────────────────────────────────────────────────────────
// This files is responsible for preparing the rendering for the screens.
// Contains all screens as HTML code and sets them up according to the 
// current state.
// ───────────────────────────────────────────────────────────────────────────

import type { GameState, NavState } from "../data/types";
import {
    getSeason,
    SEASON_EMOJIS,
    SEASON_LABELS,
} from "../game/state";
import { getItemLabel, getSellPrice } from "../data/items";
import { renderHome } from "./screens/home_screen";
import { renderActionDetail } from "./screens/action_detail_screen";
import { renderCompletion } from "./screens/completion_detail_screen";
import { renderHelp } from "./screens/help_screen";
import { renderInspectItem } from "./screens/item_inspect_screen";
import { renderSkills } from "./screens/skills_overview_screen";
import { renderSkillDetail } from "./screens/skill_detail_screen";
import { renderInventory } from "./screens/inventory_screen";
import { renderShop } from "./screens/shop_screen";
import { renderLog } from "./screens/event_log_screen";
import { renderSeason } from "./screens/season_screen";
import { renderStats } from "./screens/stats_screen";
import { renderPlaceholder } from "./screens/placeholder_screen";

// ── Constants ──────────────────────────────────────────────────────────────
export const WIDTH = 126; //TODO: better naming

// ── Colour helpers ─────────────────────────────────────────────────────────
export const COLORS = { //TODO: better naming
    moss: (t: string) => `<span class="c-moss">${t}</span>`,
    forest: (t: string) => `<span class="c-forest">${t}</span>`,
    gold: (t: string) => `<span class="c-gold">${t}</span>`,
    bark: (t: string) => `<span class="c-bark">${t}</span>`,
    dim: (t: string) => `<span class="c-dim">${t}</span>`,
    white: (t: string) => `<span class="c-white">${t}</span>`,
    rare: (t: string) => `<span class="c-rare">${t}</span>`,
    veryrare: (t: string) => `<span class="c-veryrare">${t}</span>`,
    mythic: (t: string) => `<span class="c-mythic">${t}</span>`,
    legendary: (t: string) => `<span class="c-legendary">${t}</span>`,
    red: (t: string) => `<span class="c-red">${t}</span>`,
    bold: (t: string) => `<span class="bold">${t}</span>`,
    b: (t: string) => `<span class="bold">${t}</span>`,
};

// ── Layout helpers ─────────────────────────────────────────────────────────

// Strips HTML tags to get visible character count
export function visibleChars(html: string): number {
    return html.replace(/<[^>]*>/g, '').length;
}

export function paddingRight(html: string, width: number, char = ' '): string {
    const extra = width - visibleChars(html);
    return extra > 0 ? html + char.repeat(extra) : html;
}

export function paddingLeft(html: string, width: number, char = ' '): string {
    const extra = width - visibleChars(html);
    return extra > 0 ? char.repeat(extra) + html : html;
}

export function rule(char = '═'): string {
    return COLORS.forest(char.repeat(WIDTH));
}

export function thinRule(): string {
    return COLORS.dim('─'.repeat(WIDTH));
}

export function progressBar(pct: number, width = 20): string {
    const filled = Math.round(Math.min(pct, 1) * width);
    const col = pct >= 1 ? COLORS.gold : COLORS.moss;
    return `[${col('█'.repeat(filled))}${COLORS.dim('░'.repeat(width - filled))}]`;
}

// ── Formatting ──────────────────────────────────────────────────────────────
export function fmtDuration(s: number): string { //TODO: magic numbers
    s = Math.floor(s);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export function fmtPlaytime(s: number): string { //TODO: magic numbers
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export function fmtTime(ts: number): string { //TODO: magic numbers
    return new Date(ts * 1000).toTimeString().slice(0, 5);
}

// ── Shared header ──────────────────────────────────────────────────────────
export function headerBar(state: GameState, screenName: string): string {
    const season = getSeason(state);
    const emoji = SEASON_EMOJIS[season];
    const sLabel = SEASON_LABELS[season];
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const day = Math.floor((now.getTime() / 1000 - state.createdAt) / 86400) + 1; //TODO: magic numbers

    const left = ` ${COLORS.b(COLORS.moss('ROOTBOUND'))}  ${COLORS.dim('›')}  ${COLORS.white(screenName)}`;
    const right = `${emoji} ${COLORS.moss(sLabel)}  ${COLORS.dim(`Day ${day}  ${time}`)} `;
    const pad = WIDTH - visibleChars(left) - visibleChars(right);

    return [
        rule(),
        left + ' '.repeat(Math.max(1, pad)) + right,
        rule(),
    ].join('\n');
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
      `  ${COLORS.dim('The box was empty. The forest giveth and taketh away.')}`,
      '',
      `  ${COLORS.dim('back  — return to shop')}`,
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
  lines.push(`  ${COLORS.dim('━'.repeat(WIDTH))}`);
  lines.push('');

  // Item lines with staggered animation spans
  const TIER_GLYPH: Record<string, string> = {
    uncommon:'◆', rare:'◈', very_rare:'◉', legendary:'★', mythic:'✦',
  };
  const TIER_COL: Record<string, (t:string)=>string> = {
    uncommon:  COLORS.moss,
    rare:      COLORS.rare,
    very_rare: COLORS.veryrare,
    legendary: COLORS.legendary,
    mythic:    COLORS.mythic,
  };
  const TIER_NAME: Record<string, string> = {
    uncommon:'uncommon', rare:'RARE', very_rare:'VERY RARE',
    legendary:'LEGENDARY', mythic:'✦ MYTHIC ✦',
  };

  for (let i = 0; i < items.length; i++) {
    const drop      = items[i];
    const tierCol   = TIER_COL[drop.tier] ?? COLORS.dim;
    const glyph     = TIER_GLYPH[drop.tier] ?? '·';
    const tierName  = TIER_NAME[drop.tier] ?? drop.tier;
    const itemLabel = getItemLabel(drop.item);
    const sellVal   = getSellPrice(drop.item);
    const delayClass = `loot-d${Math.min(i, 7)}`;
    const extraClass = drop.tier === 'mythic' ? 'loot-mythic'
                     : drop.tier === 'legendary' ? 'loot-legendary'
                     : 'loot-reveal-item';

    // Build the visible content of this reveal line
    const leftPart  = `  ${tierCol(glyph + ' ' + tierName.padEnd(14))} ${COLORS.white(itemLabel)} ×${drop.qty}`;
    const rightPart = COLORS.dim(`  ${sellVal}g ea`);
    const lineHtml  = `<span class="${extraClass} ${delayClass}">${leftPart}${rightPart}</span>`;
    lines.push(lineHtml);
  }

  // Total sell value
  const totalVal = items.reduce((s, d) => s + getSellPrice(d.item) * d.qty, 0);
  lines.push('');
  lines.push(`  ${COLORS.dim('─'.repeat(WIDTH))}`);
  lines.push(`  ${COLORS.dim('Total sell value:')} ${COLORS.gold(totalVal.toLocaleString() + 'g')}`);
  lines.push('');
  lines.push(`  ${COLORS.dim('back  — return to shop  ·  inv rare  — view rare items')}`);

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