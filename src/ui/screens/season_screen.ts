import type { GameState } from "../../data/types";
import { COLORS, fmtDuration, headerBar, paddingRight, progressBar, thinRule } from "../render";
import { getSeason, SEASON_BONUSES, SEASON_EMOJIS, SEASON_EXCLUSIVES, SEASON_LABELS, seasonTimeRemaining, SKILL_LABELS } from "../../game/state";

// ── SEASON ─────────────────────────────────────────────────────────────────
export function renderSeason(state: GameState): string {
    const lines: string[] = [];
    lines.push(headerBar(state, 'SEASON'));
    lines.push('');

    const season = getSeason(state);
    const emoji = SEASON_EMOJIS[season];
    const sLabel = SEASON_LABELS[season];
    const bonuses = SEASON_BONUSES[season] ?? {};
    const remaining = seasonTimeRemaining(state);
    const pct = 1 - remaining / (60 * 60 * 24 * 3); //TODO: magical numbers

    lines.push(`  ${COLORS.b(COLORS.moss(`${emoji}  ${sLabel}`))}`);
    lines.push('');
    lines.push(`  Progress  ${progressBar(pct, 30)}  ${COLORS.dim(fmtDuration(remaining) + ' remaining')}`); //TODO: magical numbers
    lines.push('');

    const seasons = ['spring', 'summer', 'autumn', 'winter'] as const;
    const nextSeason = seasons[(state.seasonIndex + 1) % 4];
    lines.push(`  ${COLORS.dim('Next season:')}  ${SEASON_EMOJIS[nextSeason]} ${COLORS.white(SEASON_LABELS[nextSeason])}`);
    lines.push('');

    lines.push(`  ${COLORS.b(COLORS.forest('Active Effects'))}`);
    lines.push(`  ${thinRule()}`);
    const bonusEntries = Object.entries(bonuses);
    if (bonusEntries.length > 0) {
        for (const [skill, mod] of bonusEntries) {
            const skillLabel = SKILL_LABELS[skill] ?? skill;
            const modCol = mod > 0 ? COLORS.moss : COLORS.red;
            lines.push(`  ${paddingRight(COLORS.white(skillLabel), 22)} ${modCol((mod > 0 ? '+' : '') + mod + '%')}`);
        }
    } else {
        lines.push(`  ${COLORS.dim('No modifiers this season')}`);
    }

    lines.push('');
    lines.push(`  ${COLORS.b(COLORS.forest('Season-Exclusive Content'))}`);
    lines.push(`  ${thinRule()}`);
    for (const item of SEASON_EXCLUSIVES[season] ?? []) {
        lines.push(`  ${COLORS.gold('✦')}  ${COLORS.white(item)}`);
    }

    return lines.join('\n');
}