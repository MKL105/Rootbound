import type { GameState } from "../../data/types";
import { COLORS, escHtml, fmtTime, headerBar } from "../render";

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
        lines.push(`  ${COLORS.dim('No events recorded yet.')}`);
    } else {
        const FILTER_LABELS: Record<string, string> = {
            rare_drop: 'rare drops', level_up: 'level ups', combat: 'combat', drops: 'drops', general: 'general',
        };
        const filterLabel = filterCat ? FILTER_LABELS[filterCat] ?? filterCat : '';
        const filterNote = filterLabel ? `  (filter: ${filterLabel})` : '';
        lines.push(`  ${COLORS.dim(`Showing ${logs.length} events${filterNote}`)}`);
        lines.push('');
        for (const e of logs) {
            const t = fmtTime(e.ts);
            const col = e.category === 'rare_drop' ? COLORS.rare :
                e.category === 'level_up' ? COLORS.gold :
                    e.category === 'combat' ? COLORS.red : COLORS.dim;
            lines.push(`  ${COLORS.dim(`[${t}]`)}  ${col(e.text)}`);
        }
    }

    lines.push('');
    lines.push(`  ${COLORS.dim(escHtml('log [drops|rare|level|combat]  ·  log --n <count>'))}`);
    return lines.join('\n');
}