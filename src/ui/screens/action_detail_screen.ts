import type { GameState } from "../../data/types";
import { COLORS, headerBar, paddingRight, thinRule } from "../render";
import { getSkillLevel, SKILL_LABELS } from "../../game/state";
import { SKILLS } from "../../data/skills";
import { SKILL_DROPS, TIER_LABELS } from "../../data/drops";
import { getItemLabel, getSellPrice } from "../../data/items";

// ── ACTION DETAIL ──────────────────────────────────────────────────────────
export function renderActionDetail(state: GameState, skillName: string, actionName: string): string {
  const lines: string[] = [];
  const skillDef = SKILLS[skillName];
  const action   = skillDef?.actions.find(a => a.name === actionName);

  if (!skillDef || !action) {
    lines.push(headerBar(state, 'ACTION DETAIL'));
    lines.push('');
    lines.push(`  ${COLORS.red(`Unknown action '${actionName}' in skill '${skillName}'.`)}`);
    return lines.join('\n');
  }

  const unlocked = action.requires.every(r => getSkillLevel(state, r.skill)[0] >= r.level);
  lines.push(headerBar(state, `${skillDef.label.toUpperCase()} — ${action.label.toUpperCase()}`));
  lines.push('');

  // Status + duration
  const statusCol = unlocked ? COLORS.moss : COLORS.red;
  const statusStr = unlocked ? '✓ Unlocked' : '✗ Locked';
  lines.push(`  ${statusCol(statusStr)}    ${COLORS.dim('Duration:')} ${COLORS.white(action.duration + 's')}    ${COLORS.dim('XP per action:')} ${COLORS.moss(String(action.xp))}`);
  if (action.season) lines.push(`  ${COLORS.dim('Season restriction:')} ${COLORS.gold(action.season.charAt(0).toUpperCase() + action.season.slice(1) + ' only')}`);
  lines.push('');

  // Requirements
  lines.push(`  ${COLORS.b(COLORS.forest('Requirements'))}`);
  lines.push(`  ${thinRule()}`);
  if (action.requires.length === 0) {
    lines.push(`  ${COLORS.dim('None — available from the start')}`);
  } else {
    for (const req of action.requires) {
      const have = getSkillLevel(state, req.skill)[0];
      const met  = have >= req.level;
      const col  = met ? COLORS.moss : COLORS.red;
      lines.push(`  ${col(met ? '✓' : '✗')} ${paddingRight(COLORS.white(SKILL_LABELS[req.skill] ?? req.skill), 18)} ${col(`Level ${req.level}`)}  ${COLORS.dim(`(you have ${have})`)}`);
    }
  }

  // Output
  lines.push('');
  lines.push(`  ${COLORS.b(COLORS.forest('Guaranteed Output'))}`);
  lines.push(`  ${thinRule()}`);
  if (action.output.length === 0) {
    lines.push(`  ${COLORS.dim('No item output — XP only')}`);
  } else {
    for (const o of action.output) {
      const label = getItemLabel(o.item);
      const price = getSellPrice(o.item);
      const qty   = o.qtyMin === o.qtyMax ? `×${o.qtyMin}` : `×${o.qtyMin}–${o.qtyMax}`;
      lines.push(`  ${paddingRight(COLORS.white(label), 28)} ${paddingRight(COLORS.gold(qty), 8)} ${COLORS.dim(price + 'g ea')}`);
    }
  }

  // Bonus drops
  const drops = SKILL_DROPS[skillName] ?? [];
  if (drops.length > 0) {
    lines.push('');
    lines.push(`  ${COLORS.b(COLORS.forest('Possible Bonus Drops'))}  ${COLORS.dim('(chance per action completion)')}`);
    lines.push(`  ${thinRule()}`);
    const hasJournal = (state.ownedUtilities ?? []).includes('field_journal');
    for (const drop of drops) {
      const label = getItemLabel(drop.item);
      const tierCol = drop.tier === 'mythic' ? COLORS.mythic : drop.tier === 'legendary' ? COLORS.legendary :
                      drop.tier === 'very_rare' ? COLORS.veryrare : drop.tier === 'rare' ? COLORS.rare : COLORS.moss;
      const pctStr = hasJournal
        ? (drop.chance >= 0.01 ? (drop.chance*100).toFixed(1)+'%' : (drop.chance*100).toFixed(3)+'%')
        : '???';
      lines.push(`  ${paddingRight(tierCol(TIER_LABELS[drop.tier]), 16)} ${paddingRight(COLORS.white(label), 28)} ${COLORS.dim(pctStr)}`);
    }
    if (!hasJournal) {
      lines.push('');
      lines.push(`  ${COLORS.dim('Buy the Field Journal from the shop to reveal exact drop chances.')}`);
    }
  }

  lines.push('');
  lines.push(`  ${COLORS.dim(`do ${skillName} ${action.name} [qty]  ·  back`)}`);
  return lines.join('\n');
}