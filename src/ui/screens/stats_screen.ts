import type { GameState } from "../../data/types";
import { COLORS, fmtDuration, fmtPlaytime, headerBar, paddingRight, progressBar, thinRule } from "../render";
import { completionTitle, getSeason, getCompletionBreakdown
    , getCompletionPct, SEASON_EMOJIS, SEASON_LABELS, seasonTimeRemaining } from "../../game/state";

// ── STATS ──────────────────────────────────────────────────────────────────
export function renderStats(state: GameState): string {
    const lines: string[] = [];
    lines.push(headerBar(state, 'STATS'));
    lines.push('');

    const pct = getCompletionPct(state);
    const ctitle = completionTitle(pct);
    const season = getSeason(state);

    lines.push(`  ${COLORS.dim('Title')}     ${COLORS.b(COLORS.moss(ctitle))}`);
    lines.push(`  ${COLORS.dim('Gold')}      ${COLORS.gold((state.gold ?? 0).toLocaleString() + 'g')}`);
    lines.push(`  ${COLORS.dim('Playtime')}  ${COLORS.white(fmtPlaytime(state.playedSeconds))}`);
    lines.push(`  ${COLORS.dim('Season')}    ${SEASON_EMOJIS[season]} ${COLORS.white(SEASON_LABELS[season])}  ${COLORS.dim(fmtDuration(seasonTimeRemaining(state)) + ' remaining')}`);
    lines.push('');

    // Completion breakdown
    lines.push(`  ${COLORS.b(COLORS.forest('Completion Tracker'))}`);
    lines.push(`  ${thinRule()}`);

    const BD: Record<string, string> = {
        skillLevels: 'Skill Levels',
        actionMastery: 'Action Mastery',
        itemCollection: 'Item Collection',
        rareDrops: 'Rare Drops',
        combat: 'Combat',
        worldMilestones: 'World Milestones',
    };
    const BW: Record<string, string> = {
        skillLevels: '40%', actionMastery: '20%', itemCollection: '15%',
        rareDrops: '10%', combat: '10%', worldMilestones: ' 5%',
    };

    const breakdown = getCompletionBreakdown(state); //TODO: tons of magic numbers
    for (const [cat, [cur, tot]] of Object.entries(breakdown)) {
        const cpct = tot > 0 ? cur / tot : 0;
        const bar = progressBar(cpct, 18);
        const pctStr = (cpct * 100).toFixed(1) + '%';
        lines.push(
            paddingRight(`  ${COLORS.white(BD[cat])}`, 22) +
            `${bar}  ` +
            paddingRight(COLORS.dim(`${cur}/${tot}`), 14) +
            paddingRight(COLORS.moss(pctStr), 8) +
            COLORS.dim('wt ' + BW[cat])
        );
    }
    lines.push('');
    const totalFill = Math.round(pct / 100 * 26);
    const totalBar = `[${COLORS.moss('█'.repeat(totalFill))}${COLORS.dim('░'.repeat(26 - totalFill))}]`;
    lines.push(`  ${paddingRight(COLORS.b(COLORS.white('TOTAL')), 22)}${totalBar}  ${COLORS.b(COLORS.moss(pct.toFixed(1) + '%'))}  ${COLORS.gold(ctitle)}`);

    // Buffs
    lines.push('');
    lines.push(`  ${COLORS.b(COLORS.forest('Active Buffs'))}`);
    lines.push(`  ${thinRule()}`);
    const activeBufls = state.buffs.filter(b => b.expiresAt > Date.now() / 1000);
    if (activeBufls.length > 0) {
        for (const b of activeBufls) {
            const rem = b.expiresAt - Date.now() / 1000;
            lines.push(`  ${COLORS.gold('✦')}  ${paddingRight(COLORS.white(b.name), 26)} ${paddingRight(COLORS.moss(b.effect), 22)} ${COLORS.dim(fmtDuration(rem))}`);
        }
    } else {
        lines.push(`  ${COLORS.dim('No active buffs')}`);
    }

    // Companions — derived from inventory (companion items)
    lines.push('');
    lines.push(`  ${COLORS.b(COLORS.forest('Companions'))}`);
    lines.push(`  ${thinRule()}`);

    const COMPANION_INFO: Record<string, { label: string; bonus: string }> = {
        rabbit_companion: { label: 'Rabbit', bonus: 'Passively gathers Wildberries & Herbs' },
        fox_companion: { label: 'Forest Fox', bonus: 'Passively finds Rare Seeds & River Herbs' },
        owl_companion: { label: 'Owl', bonus: 'Passively collects Stardust' },
        boar_companion: { label: 'Wild Boar', bonus: 'Passively drops hides & Charcoal' },
        otter_companion: { label: 'River Otter', bonus: 'Passively catches Fish & River Stones' },
        bear_companion: { label: 'Forest Bear', bonus: 'Passively brings Ironbark Shards' },
        moon_deer_companion: { label: 'Moon Deer', bonus: 'Passively collects Moonbloom & Moon data' },
        storm_eagle_companion: { label: 'Storm Eagle', bonus: 'Passively brings Sky Maps & Aurora Shards' },
        ancient_stag_companion: { label: 'Ancient Stag', bonus: 'Passively finds Spirit Herbs (rare: Heartroot)' },
    };

    const activeCompanions = Object.entries(COMPANION_INFO).filter(([id]) => (state.inventory[id] ?? 0) > 0);
    if (activeCompanions.length > 0) {
        for (const [, info] of activeCompanions) {
            lines.push(`  ${COLORS.moss('🐾')} ${paddingRight(COLORS.white(info.label), 20)} ${COLORS.dim(info.bonus)}`);
        }
    } else {
        lines.push(`  ${COLORS.dim('No companions yet — level Beastmastery to tame animals')}`);
    }

    lines.push('');
    lines.push(`  ${COLORS.dim('completion  ·  completion actions  ·  completion drops  ·  completion milestones')}`);
    return lines.join('\n');
}