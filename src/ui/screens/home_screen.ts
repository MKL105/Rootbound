import type { GameState } from "../../data/types";
import { COLORS, escHtml, fmtDuration, fmtPlaytime, fmtTime, headerBar, paddingRight, progressBar, thinRule, visibleChars, WIDTH } from "../render";
import { completionTitle, getCompletionPct, SKILL_LABELS } from "../../game/state";
import { actionProgress } from "../../game/engine";

// ── HOME SCREEN ────────────────────────────────────────────────────────────
export function renderHome(state: GameState): string {
    const lines: string[] = [];
    lines.push(headerBar(state, 'HOME'));
    lines.push('');

    // Two columns: active action (left=42) | queue (right)
    const LW = 42; //TODO: magic numbers
    const leftLines: string[] = [];
    const rightLines: string[] = [];

    // Left: active action
    const active = state.active;
    leftLines.push(` ${COLORS.dim('Active Action')}`);
    leftLines.push(` ${COLORS.dim('─'.repeat(38))}`); //TODO: magic numbers
    if (active) {
        const sk = SKILL_LABELS[active.skill] ?? active.skill;
        const ac = active.action.replace(/_/g, ' ').replace(/\b\w/g, x => x.toUpperCase());
        leftLines.push(` ${COLORS.forest(sk)} ${COLORS.dim('›')} ${COLORS.white(ac)}`);
        const pct = actionProgress(state);
        const rem = Math.max(0, active.duration - (Date.now() / 1000 - active.startedAt)); //TODO: magic numbers
        leftLines.push(` ${progressBar(pct, 22)}  ${COLORS.dim(Math.round(pct * 100) + '%')}  ${COLORS.dim(fmtDuration(rem) + ' left')}`); //TODO: magic numbers
        if (active.qtyTotal !== 1) {
            const tot = String(active.qtyTotal);
            leftLines.push(` ${COLORS.dim(`Rep ${active.qtyDone + 1} of ${tot}`)}`);
        }
        leftLines.push(` ${COLORS.dim(`+${active.xpPer} XP per action`)}`);
    } else {
        leftLines.push(` ${COLORS.dim('Idle — no action running')}`);
        leftLines.push(` ${COLORS.dim(escHtml('Use: do <skill> <action> [qty]'))}`);
        leftLines.push('');
        leftLines.push('');
    }

    // Right: queue
    const qlimit = state.queueLimit ?? 10; //TODO: magic numbers
    rightLines.push(` ${COLORS.dim('Queue')}  ${COLORS.dim(`[${state.queue.length}/${qlimit}]`)}`);
    rightLines.push(` ${COLORS.dim('─'.repeat(36))}`); //TODO: magic numbers
    if (state.queue.length > 0) {
        for (let i = 0; i < Math.min(state.queue.length, 6); i++) { //TODO: magic numbers
            const e = state.queue[i];
            const sk = SKILL_LABELS[e.skill] ?? e.skill;
            const ac = e.action.replace(/_/g, ' ').replace(/\b\w/g, x => x.toUpperCase());
            const qty = `×${e.qty}`;
            rightLines.push(` ${COLORS.dim(`${i + 1}.`)} ${COLORS.forest(sk)} ${COLORS.dim('›')} ${COLORS.dim(ac)} ${COLORS.gold(qty)}`);
        }
        if (state.queue.length > 6) rightLines.push(` ${COLORS.dim(`  … and ${state.queue.length - 6} more`)}`); //TODO: magic numbers
    } else {
        rightLines.push(` ${COLORS.dim('Queue is empty')}`);
        rightLines.push(` ${COLORS.dim(escHtml('queue <skill> <action> [qty]'))}`);
    }

    // Merge two columns
    const rows = Math.max(leftLines.length, rightLines.length);
    for (let i = 0; i < rows; i++) {
        const l = leftLines[i] ?? '';
        const r = rightLines[i] ?? '';
        lines.push(paddingRight(l, LW) + r);
    }

    // Buffs
    lines.push('');
    lines.push(` ${COLORS.dim('Buffs Active')}`);
    lines.push(` ${thinRule()}`);
    const activeBufls = state.buffs.filter(b => b.expiresAt > Date.now() / 1000); //TODO: magic numbers
    if (activeBufls.length > 0) {
        for (const b of activeBufls.slice(0, 3)) {
            const rem = b.expiresAt - Date.now() / 1000; //TODO: magic numbers
            lines.push(`  ${COLORS.gold('✦')} ${paddingRight(COLORS.white(b.name), 24)} ${paddingRight(COLORS.moss(b.effect), 20)} ${COLORS.dim(fmtDuration(rem) + ' remaining')}`);
        }
    } else {
        lines.push(`  ${COLORS.dim('No active buffs')}`);
    }

    // Recent events
    lines.push('');
    lines.push(` ${COLORS.dim('Recent Events')}`);
    lines.push(` ${thinRule()}`);
    if (state.log.length > 0) {
        for (const entry of state.log.slice(0, 5)) {
            const t = fmtTime(entry.ts);
            const col = entry.category === 'rare_drop' ? COLORS.rare :
                entry.category === 'level_up' ? COLORS.gold : COLORS.dim;
            lines.push(`  ${COLORS.dim(`[${t}]`)} ${col(entry.text)}`);
        }
    } else {
        lines.push(`  ${COLORS.dim('No events yet — start an action!')}`);
    }

    // Status bar
    const pct = getCompletionPct(state);
    const ctitle = completionTitle(pct);
    const filled = Math.round(pct / 100 * 18); //TODO: magic numbers
    const cbar = `[${COLORS.moss('█'.repeat(filled))}${COLORS.dim('░'.repeat(18 - filled))}]`; //TODO: magic numbers

    lines.push('');
    lines.push(` ${thinRule()}`);
    const lstat = ` ${COLORS.dim('Gold:')} ${COLORS.gold((state.gold ?? 0).toLocaleString() + 'g')}   ${COLORS.dim('Played:')} ${COLORS.dim(fmtPlaytime(state.playedSeconds))}`;
    const rstat = `${COLORS.dim('Completion:')} ${cbar} ${COLORS.moss(pct.toFixed(1) + '%')}  ${COLORS.dim(ctitle)} `;
    const statPad = WIDTH - visibleChars(lstat) - visibleChars(rstat);
    lines.push(lstat + ' '.repeat(Math.max(1, statPad)) + rstat);

    return lines.join('\n');
}