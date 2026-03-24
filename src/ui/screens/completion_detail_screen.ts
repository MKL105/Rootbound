import type { GameState } from "../../data/types";
import { COLORS, headerBar, paddingRight, progressBar, thinRule } from "../render";
import {
    completionTitle,
    getCompletionBreakdown,
    getCompletionPct,
    LEGENDARY_SETS,
    SKILL_LABELS,
    SKILL_NAMES,
    TRACKABLE_DROP_LIST,
    WORLD_MILESTONES
} from "../../game/state";
import { SKILLS } from "../../data/skills";
import { getItemLabel } from "../../data/items";

// ── COMPLETION DETAIL SCREEN ────────────────────────────────────────────────
export function renderCompletion(state: GameState, sub: string | null): string {
    const lines: string[] = [];

    // Sub-views: null=overview, 'actions', 'drops', 'combat', 'milestones', 'sets'
    const SUBS = ['actions', 'drops', 'combat', 'milestones', 'sets'];
    const view = sub && SUBS.includes(sub) ? sub : null;

    if (!view) {
        // ── Overview ──────────────────────────────────────────────────────────────
        lines.push(headerBar(state, 'COMPLETION'));
        lines.push('');

        const pct = getCompletionPct(state);
        const ctitle = completionTitle(pct);
        const fill = Math.round(pct / 100 * 40);
        const bar = `[${COLORS.moss('█'.repeat(fill))}${COLORS.dim('░'.repeat(40 - fill))}]`;
        lines.push(`  ${bar}  ${COLORS.b(COLORS.moss(pct.toFixed(1) + '%'))}  ${COLORS.gold(ctitle)}`);
        lines.push('');

        const BD: Record<string, string> = {
            skillLevels: 'Skill Levels', actionMastery: 'Action Mastery',
            itemCollection: 'Item Collection', rareDrops: 'Rare Drops',
            combat: 'Combat', worldMilestones: 'World Milestones',
        };
        const BW: Record<string, string> = {
            skillLevels: '40%', actionMastery: '20%', itemCollection: '15%',
            rareDrops: '10%', combat: '10%', worldMilestones: ' 5%',
        };
        const HINT: Record<string, string> = {
            skillLevels: 'level any skill to progress',
            actionMastery: 'completion actions — see details',
            itemCollection: 'discover new items via drops or crafting',
            rareDrops: 'completion drops — see details',
            combat: 'completion combat — see details',
            worldMilestones: 'completion milestones — see details',
        };

        const breakdown = getCompletionBreakdown(state);
        lines.push(`  ${COLORS.b(COLORS.forest('Category Breakdown'))}`);
        lines.push(`  ${thinRule()}`);
        for (const [cat, [cur, tot]] of Object.entries(breakdown)) {
            const cpct = tot > 0 ? cur / tot : 0;
            const bar2 = progressBar(cpct, 20);
            const pctStr = (cpct * 100).toFixed(1) + '%';
            lines.push(
                paddingRight(`  ${COLORS.white(BD[cat])}`, 20) +
                `${bar2}  ` +
                paddingRight(COLORS.dim(`${cur}/${tot}`), 12) +
                paddingRight(COLORS.moss(pctStr), 8) +
                COLORS.dim(BW[cat] + ' · ' + HINT[cat])
            );
        }

        lines.push('');
        lines.push(`  ${COLORS.b(COLORS.forest('Legendary Sets'))}`);
        lines.push(`  ${thinRule()}`);
        for (const [, set] of Object.entries(LEGENDARY_SETS)) {
            const have = set.pieces.reduce((n, p) => n + Math.min(state.inventory[p] ?? 0, 1), 0);
            // Special case: druids_awakening uses qty 5 of one item
            const total = set.pieces.length === 1 ? 5 : set.pieces.length;
            const actual = set.pieces.length === 1 ? Math.min(state.inventory[set.pieces[0]] ?? 0, 5) : have;
            const done = actual >= total;
            const bar3 = progressBar(actual / total, 10);
            const col = done ? COLORS.gold : COLORS.white;
            lines.push(`  ${done ? COLORS.gold('★') : COLORS.dim('○')} ${paddingRight(col(set.label), 28)} ${bar3}  ${COLORS.dim(`${actual}/${total} pieces`)}`);
            if (done) lines.push(`    ${COLORS.moss('Reward:')} ${COLORS.dim(set.reward)}`);
        }

        lines.push('');
        lines.push(`  ${COLORS.dim('completion actions  ·  drops  ·  combat  ·  milestones  ·  sets')}`);
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
            const all = skillDef.actions.length;
            totalDone += done; totalAll += all;
            const allDone = done === all;
            const bar2 = progressBar(done / all, 12);
            const col = allDone ? COLORS.gold : done > 0 ? COLORS.moss : COLORS.dim;
            lines.push(
                paddingRight(`  ${allDone ? COLORS.gold('★') : COLORS.dim('○')} ${col(skillDef.label)}`, 22) +
                `${bar2}  ` +
                paddingRight(COLORS.dim(`${done}/${all}`), 8)
            );
            // Show unmastered actions if partially done
            if (done > 0 && done < all) {
                const unmastered = skillDef.actions.filter(a => !mastered.has(`${skillName}.${a.name}`));
                for (const a of unmastered.slice(0, 3)) {
                    lines.push(`    ${COLORS.dim('○')} ${COLORS.dim(a.label)}`);
                }
                if (unmastered.length > 3) lines.push(`    ${COLORS.dim(`  … and ${unmastered.length - 3} more`)}`);
            } else if (done === 0) {
                lines.push(`    ${COLORS.dim('Not started')}`);
            }
        }
        lines.push('');
        const totalPct = totalAll > 0 ? (totalDone / totalAll * 100).toFixed(1) : '0.0';
        lines.push(`  ${COLORS.b(COLORS.white('Total:'))} ${COLORS.moss(totalDone + '/' + totalAll)} ${COLORS.dim('(' + totalPct + '%)')}`);
        return lines.join('\n');
    }

    if (view === 'drops') {
        // ── Rare Drops ────────────────────────────────────────────────────────────
        lines.push(headerBar(state, 'COMPLETION — RARE DROPS'));
        lines.push('');
        const found = new Set(state.completion.rareDrops);
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
            lines.push(`  ${COLORS.b(COLORS.forest(SKILL_LABELS[skillName]))}  ${COLORS.dim(doneDrops.length + '/' + drops.length)}`);
            for (const d of drops) {
                const got = found.has(d.id);
                const TIER_COLS: Record<string, (t: string) => string> = {
                    rare: COLORS.rare, very_rare: COLORS.veryrare, legendary: COLORS.legendary, mythic: COLORS.mythic
                };
                const tierCol = TIER_COLS[d.tier] ?? COLORS.moss;
                const icon = got ? COLORS.gold('✓') : COLORS.dim('○');
                const nameCol = got ? COLORS.white : COLORS.dim;
                lines.push(`  ${icon}  ${paddingRight(nameCol(d.label), 32)} ${tierCol(d.tier.replace('_', ' '))}`);
            }
            lines.push('');
        }
        lines.push(`  ${COLORS.b(COLORS.white('Total:'))} ${COLORS.moss(totalFound + '/' + TRACKABLE_DROP_LIST.length)}`);
        return lines.join('\n');
    }

    if (view === 'combat') {
        // ── Combat ────────────────────────────────────────────────────────────────
        lines.push(headerBar(state, 'COMPLETION — COMBAT'));
        lines.push('');
        const kills = state.completion.combatKills ?? {};
        const combatSkill = SKILLS['combat'];
        if (!combatSkill) { lines.push(`  ${COLORS.dim('No combat data.')}`); return lines.join('\n'); }

        let points = 0;
        lines.push(`  ${COLORS.dim('First kill of each enemy = 2 completion points')}`);
        lines.push('');
        lines.push(`  ${paddingRight(COLORS.b(COLORS.forest('Enemy')), 36)} ${paddingRight(COLORS.b(COLORS.forest('Kills')), 10)} ${COLORS.b(COLORS.forest('Points'))}`);
        lines.push(`  ${thinRule()}`);
        for (const a of combatSkill.actions) {
            const k = kills[a.name] ?? 0;
            const pts = Math.min(k, 1) * 2;
            points += pts;
            const col = k > 0 ? COLORS.white : COLORS.dim;
            const icon = k > 0 ? COLORS.gold('✓') : COLORS.dim('○');
            lines.push(
                `  ${icon}  ` +
                paddingRight(col(a.label), 34) +
                paddingRight(k > 0 ? COLORS.moss(k.toLocaleString()) : COLORS.dim('0'), 10) +
                (k > 0 ? COLORS.moss(String(pts)) : COLORS.dim('0'))
            );
        }
        lines.push('');
        lines.push(`  ${COLORS.b(COLORS.white('Total points:'))} ${COLORS.moss(points + '/26')}`);
        return lines.join('\n');
    }

    if (view === 'milestones') {
        // ── World Milestones ──────────────────────────────────────────────────────
        lines.push(headerBar(state, 'COMPLETION — WORLD MILESTONES'));
        lines.push('');
        const achieved = new Set(state.completion.worldMilestones);
        const CATS: Record<string, string> = {
            season: 'Seasons', event: 'Events', shop: 'Shop', legendary: 'Legendary Sets', endgame: 'Endgame'
        };
        const grouped: Record<string, typeof WORLD_MILESTONES> = {};
        for (const m of WORLD_MILESTONES) {
            if (!grouped[m.category]) grouped[m.category] = [];
            grouped[m.category].push(m);
        }
        let totalAchieved = 0;
        for (const [cat, milestones] of Object.entries(grouped)) {
            lines.push(`  ${COLORS.b(COLORS.forest(CATS[cat] ?? cat))}`);
            lines.push(`  ${thinRule()}`);
            for (const m of milestones) {
                const done = achieved.has(m.id);
                if (done) totalAchieved++;
                const icon = done ? COLORS.gold('✓') : COLORS.dim('○');
                const col = done ? COLORS.white : COLORS.dim;
                lines.push(`  ${icon}  ${paddingRight(col(m.label), 34)} ${COLORS.dim(m.desc)}`);
            }
            lines.push('');
        }
        lines.push(`  ${COLORS.b(COLORS.white('Total:'))} ${COLORS.moss(totalAchieved + '/' + WORLD_MILESTONES.length)}`);
        return lines.join('\n');
    }

    if (view === 'sets') {
        // ── Legendary Sets Detail ─────────────────────────────────────────────────
        lines.push(headerBar(state, 'COMPLETION — LEGENDARY SETS'));
        lines.push('');
        for (const [, set] of Object.entries(LEGENDARY_SETS)) {
            const isSingleItem = set.pieces.length === 1;
            const qty = isSingleItem ? Math.min(state.inventory[set.pieces[0]] ?? 0, 5) : 0;
            const total = isSingleItem ? 5 : set.pieces.length;
            const actual = isSingleItem ? qty
                : set.pieces.filter(p => (state.inventory[p] ?? 0) > 0).length;
            const done = actual >= total;

            lines.push(`  ${done ? COLORS.gold('★') : COLORS.dim('○')} ${COLORS.b(done ? COLORS.gold(set.label) : COLORS.white(set.label))}`);
            lines.push(`  ${thinRule()}`);

            if (isSingleItem) {
                const have = state.inventory[set.pieces[0]] ?? 0;
                lines.push(`  ${COLORS.dim('Piece:')}  ${COLORS.white("Druid's Awakening Piece")}  ${have >= 1 ? COLORS.moss('×' + have + ' collected') : COLORS.dim('not yet found')}`);
                lines.push(`  ${COLORS.dim('Progress:')} ${progressBar(actual / total, 20)}  ${COLORS.dim(actual + '/5')}`);
                lines.push(`  ${COLORS.dim('Source:  Foraging, Herbalism, Cultivation — mythic drop (0.01%)')}`);
            } else {
                for (const piece of set.pieces) {
                    const have = (state.inventory[piece] ?? 0) > 0;
                    const label = getItemLabel(piece);
                    lines.push(`  ${have ? COLORS.gold('✓') : COLORS.dim('○')}  ${paddingRight(have ? COLORS.white(label) : COLORS.dim(label), 34)} ${COLORS.dim(have ? 'collected' : 'missing')}`);
                }
            }
            lines.push('');
            lines.push(`  ${COLORS.dim('Reward:')} ${done ? COLORS.moss(set.reward) : COLORS.dim(set.reward)}`);
            lines.push('');
        }
        return lines.join('\n');
    }

    return lines.join('\n');
}