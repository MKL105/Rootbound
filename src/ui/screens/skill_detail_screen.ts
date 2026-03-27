import type { GameState } from "../../data/types";
import { COLORS, escHtml, headerBar, paddingRight, progressBar, thinRule } from "../render";
import { getSkillLevel, SKILL_LABELS, SKILL_NAMES } from "../../game/state";
import { SKILLS } from "../../data/skills";
import { SKILL_DROPS, TIER_LABELS } from "../../data/drops";
import { getItemLabel } from "../../data/items";

// ── SKILL DETAIL ───────────────────────────────────────────────────────────
export function renderSkillDetail(state: GameState, skillName: string): string {
    const lines: string[] = [];
    const skillDef = SKILLS[skillName];

    if (!skillDef) {
        lines.push(headerBar(state, 'SKILL'));
        lines.push('');
        lines.push(`  ${COLORS.red(`Unknown skill: '${skillName}'`)}`);
        lines.push(`  ${COLORS.dim('Available: ' + SKILL_NAMES.join(', '))}`);
        return lines.join('\n');
    }

    lines.push(headerBar(state, skillDef.label.toUpperCase()));
    const [level, xpIn, xpNeeded] = getSkillLevel(state, skillName);
    const totalXp = state.skills[skillName] ?? 0;

    lines.push('');
    const lvlCol = level >= 100 ? COLORS.gold : COLORS.moss;
    lines.push(`  ${COLORS.b(lvlCol(`Level ${level}`))}  ${COLORS.dim(`${xpIn.toLocaleString()} / ${xpNeeded.toLocaleString()} XP  (total: ${totalXp.toLocaleString()})`)}`);
    lines.push(`  ${progressBar(xpNeeded > 0 ? xpIn / xpNeeded : 1, 40)}`);
    lines.push('');
    lines.push(`  ${COLORS.dim(skillDef.description)}`);
    lines.push('');

    // Sub-actions table — fixed column widths, all measured on plain text TODO: lots of magic numbers
    const CN = 5;   // marker + number
    const CA = 30;  // action name
    const CR = 28;  // requires
    const CD = 6;   // duration
    const CX = 5;   // xp

    const hdr =
        paddingRight(`  ${COLORS.b(COLORS.forest('#'))}`, CN + 2) +
        paddingRight(COLORS.b(COLORS.forest('Action')), CA) +
        paddingRight(COLORS.b(COLORS.forest('Requires')), CR) +
        paddingRight(COLORS.b(COLORS.forest('Dur')), CD) +
        paddingRight(COLORS.b(COLORS.forest('XP')), CX);
    lines.push(`  ${COLORS.b(COLORS.forest('Sub-Actions'))}`);
    lines.push(hdr);
    lines.push(`  ${thinRule()}`);

    for (let i = 0; i < skillDef.actions.length; i++) {
        const a = skillDef.actions[i];
        const unlocked = a.requires.every(r => getSkillLevel(state, r.skill)[0] >= r.level);
        const marker = unlocked ? COLORS.moss('✓') : COLORS.dim('✗');
        const nameCol = unlocked ? COLORS.white : COLORS.dim;
        const reqStr = a.requires.length === 0 ? '—' :
            a.requires.map(r => `${SKILL_LABELS[r.skill] ?? r.skill} ${r.level}`).join(', ');
        const seasonTag = a.season ? `  ${COLORS.dim('[' + a.season + ']')}` : '';

        lines.push(
            paddingRight(`  ${marker} ${COLORS.dim(String(i + 1))}`, CN + 2) +
            paddingRight(nameCol(a.label), CA) +
            paddingRight(COLORS.dim(reqStr), CR) +
            paddingRight(COLORS.dim(a.duration + 's'), CD) +
            paddingRight(COLORS.moss(String(a.xp)), CX) +
            seasonTag
        );
    }

    // Drop table — only show if player owns Field Journal
    const hasJournal = (state.ownedUtilities ?? []).includes('field_journal');
    const skillDrops = SKILL_DROPS[skillName] ?? [];

    if (hasJournal && skillDrops.length > 0) {
        lines.push('');
        lines.push(`  ${COLORS.b(COLORS.forest('Bonus Drop Table'))}  ${COLORS.dim('(Field Journal)')}`);
        lines.push(`  ${thinRule()}`);
        const DD = 14; //TODO: magic numbers
        const DI = 34;
        lines.push(paddingRight(`  ${COLORS.b(COLORS.forest('Tier'))}`, DD) + paddingRight(COLORS.b(COLORS.forest('Item')), DI) + COLORS.b(COLORS.forest('Chance')));
        for (const drop of skillDrops) {
            const tierLabel = TIER_LABELS[drop.tier];
            const tierCol = drop.tier === 'mythic' ? COLORS.mythic :
                drop.tier === 'legendary' ? COLORS.legendary :
                    drop.tier === 'very_rare' ? COLORS.veryrare :
                        drop.tier === 'rare' ? COLORS.rare : COLORS.moss;
            const itemLabel = getItemLabel(drop.item);
            const pctStr = drop.chance >= 0.01
                ? (drop.chance * 100).toFixed(1) + '%'
                : (drop.chance * 100).toFixed(3) + '%';
            lines.push(paddingRight(tierCol(tierLabel), DD) + paddingRight(COLORS.white(itemLabel), DI) + COLORS.dim(pctStr));
        }
    } else if (!hasJournal && skillDrops.length > 0) {
        lines.push('');
        lines.push(`  ${COLORS.dim(`${skillDrops.length} possible bonus drops — buy Field Journal from shop to reveal chances`)}`);
    }

    lines.push('');
    lines.push(`  ${COLORS.dim(escHtml(`do ${skillName} <action> [qty]`))}`);
    return lines.join('\n');
}