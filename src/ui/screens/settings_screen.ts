import type { GameState } from "../../data/types";
import { COLORS, headerBar } from "../render";

// ── SETTINGS ───────────────────────────────────────────────────────────────
export function renderSettings(state: GameState): string {
  const lines: string[] = [];
  lines.push(headerBar(state, "SETTINGS"));
  lines.push('');
  lines.push(`  ${COLORS.moss(`Settings`)}`);
  lines.push('');
  lines.push(`  ${COLORS.dim(`Use 'set reset' to reset all progress.`)}`);
  lines.push('');
  lines.push(`  ${COLORS.dim(`Use 'set export' to export the game data to a file.`)}`);
  lines.push('');
  lines.push(`  ${COLORS.dim(`Use 'set import' to choose an import file.`)}`);
  lines.push('');
  return lines.join('\n');
}