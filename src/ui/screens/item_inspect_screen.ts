import type { GameState } from "../../data/types";
import { COLORS, headerBar, paddingRight, thinRule } from "../render";
import { SKILL_LABELS } from "../../game/state";
import { getItemDef, getItemLabel, getSellPrice } from "../../data/items";
import { SKILLS } from "../../data/skills";
import { SKILL_DROPS, TIER_LABELS, type DropTier } from "../../data/drops";

// ── ITEM INSPECT ────────────────────────────────────────────────────────────
export function renderInspectItem(state: GameState, itemName: string): string {
  const lines: string[] = [];
  const def = getItemDef(itemName);
  const qty = state.inventory[itemName] ?? 0;
  const label = getItemLabel(itemName);

  lines.push(headerBar(state, `ITEM — ${label.toUpperCase()}`));
  lines.push('');

  if (!def && qty === 0) {
    lines.push(`  ${COLORS.red(`Unknown item '${itemName}'.`)}`);
    return lines.join('\n');
  }

  const RARITY_COL: Record<string, (t:string)=>string> = {
    common: COLORS.dim, uncommon: COLORS.moss, rare: COLORS.rare,
    very_rare: COLORS.veryrare, legendary: COLORS.legendary, mythic: COLORS.mythic,
  };
  const rarity    = def?.rarity ?? 'common';
  const rarityCol = RARITY_COL[rarity] ?? COLORS.dim;
  const price     = getSellPrice(itemName);

  lines.push(`  ${COLORS.b(COLORS.white(label))}`);
  lines.push('');
  lines.push(`  ${COLORS.dim('Rarity:')}    ${rarityCol(rarity.replace('_',' ').replace(/\b\w/g,x=>x.toUpperCase()))}`);
  lines.push(`  ${COLORS.dim('Category:')}  ${COLORS.white(def?.category ?? '—')}`);
  lines.push(`  ${COLORS.dim('Sell price:')}${COLORS.gold(' ' + price.toLocaleString() + 'g each')}`);
  lines.push(`  ${COLORS.dim('In inventory:')}${qty > 0 ? COLORS.white(' ' + qty.toLocaleString()) : COLORS.dim(' 0')}`);
  if (qty > 0) {
    lines.push(`  ${COLORS.dim('Stack value:')} ${COLORS.gold((qty * price).toLocaleString() + 'g')}`);
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
  const dropSources: Array<{ skill: string; tier: DropTier; chance: number }> = [];
  for (const [skillName, drops] of Object.entries(SKILL_DROPS)) {
    for (const d of drops) {
      if (d.item === itemName) dropSources.push({ skill: skillName, tier: d.tier, chance: d.chance });
    }
  }

  if (sources.length > 0) {
    lines.push('');
    lines.push(`  ${COLORS.b(COLORS.forest('Produced by'))}`);
    lines.push(`  ${thinRule()}`);
    for (const s of sources) {
      const sk  = SKILL_LABELS[s.skill] ?? s.skill;
      lines.push(`  ${COLORS.white(s.label)}  ${COLORS.dim('(' + sk + ')')}`);
    }
  }

  if (dropSources.length > 0) {
    const hasJournal = (state.ownedUtilities ?? []).includes('field_journal');
    lines.push('');
    lines.push(`  ${COLORS.b(COLORS.forest('Bonus drop from'))}`);
    lines.push(`  ${thinRule()}`);
    for (const d of dropSources) {
      const sk = SKILL_LABELS[d.skill] ?? d.skill;
      const tierCol = d.tier === 'mythic' ? COLORS.mythic : d.tier === 'legendary' ? COLORS.legendary :
                      d.tier === 'very_rare' ? COLORS.veryrare : d.tier === 'rare' ? COLORS.rare : COLORS.moss;
      const pct = hasJournal
        ? ' (' + (d.chance >= 0.01 ? (d.chance*100).toFixed(1) : (d.chance*100).toFixed(3)) + '%)'
        : '';
      lines.push(`  ${paddingRight(tierCol(TIER_LABELS[d.tier] ?? d.tier), 18)} ${COLORS.white(sk)}${COLORS.dim(pct)}`);
    }
  }

  if (qty > 0) {
    lines.push('');
    lines.push(`  ${COLORS.dim(`sell ${itemName} [qty]  ·  sell ${itemName} --all`)}`);
  }

  return lines.join('\n');
}