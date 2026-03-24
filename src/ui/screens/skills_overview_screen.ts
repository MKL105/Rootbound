import type { GameState } from "../../data/types";
import { COLORS, headerBar, paddingRight, progressBar, thinRule } from "../render";
import { getSeason, getSkillLevel, SEASON_BONUSES, SKILL_LABELS, SKILL_NAMES } from "../../game/state";
import { getActiveXpBonusSummary } from "../../game/engine";

// ── SKILLS OVERVIEW ────────────────────────────────────────────────────────
export function renderSkills(state: GameState): string {
    const lines: string[] = [];
    lines.push(headerBar(state, 'SKILLS'));
    lines.push('');
    lines.push(`  ${COLORS.dim('15 skills  ·  max level 100  ·  XP = 80 × N × 1.09ᴺ')}`); //TODO: magic numbers
    lines.push('');

    const season = getSeason(state);
    const bonuses = SEASON_BONUSES[season] ?? {};

    // Header row
    const hdr =
        paddingRight(`  ${COLORS.b(COLORS.forest('Skill'))}`, 22) + //TODO: magic numbers
        paddingRight(COLORS.b(COLORS.forest('Lvl')), 6) + //TODO: magic numbers
        paddingRight(COLORS.b(COLORS.forest('Progress')), 28) + //TODO: magic numbers
        paddingRight(COLORS.b(COLORS.forest('XP to next')), 16) + //TODO: magic numbers
        COLORS.b(COLORS.forest('Season'));
    lines.push(hdr);
    lines.push(`  ${thinRule()}`);

    for (const skill of SKILL_NAMES) {
        const [level, xpIn, xpNeeded] = getSkillLevel(state, skill);
        const label = SKILL_LABELS[skill];
        const pct = xpNeeded > 0 ? xpIn / xpNeeded : 1;
        const bar = progressBar(pct, 14); //TODO: magic numbers
        const lvlColor = level >= 100 ? COLORS.gold : level >= 50 ? COLORS.moss : COLORS.white; //TODO: magic numbers
        const xpStr = level < 100 ? `${xpIn.toLocaleString()}/${xpNeeded.toLocaleString()}` : COLORS.gold('MAX'); //TODO: magic numbers
        const mod = bonuses[skill] ?? 0;
        const modStr = mod > 0 ? COLORS.moss(`+${mod}%`) : mod < 0 ? COLORS.red(`${mod}%`) : COLORS.dim(' — ');

        const xpBonus = getActiveXpBonusSummary(state, skill);
        const bonusTag = xpBonus ? `  ${COLORS.gold(xpBonus)}` : '';
        lines.push(
            paddingRight(`  ${COLORS.white(label)}`, 22) + //TODO: magic numbers
            paddingRight(lvlColor(String(level)), 6) + //TODO: magic numbers
            paddingRight(`${bar}  `, 28) + //TODO: magic numbers
            paddingRight(COLORS.dim(xpStr), 16) + //TODO: magic numbers
            paddingRight(modStr, 8) + //TODO: magic numbers
            bonusTag
        );
    }

    lines.push('');
    lines.push(`  ${COLORS.dim("skill <name>  —  view full detail and sub-actions")}`);
    return lines.join('\n');
}