import type { GameState } from "../../data/types";
import { COLORS, headerBar } from "../render";

// ── PLACEHOLDER ────────────────────────────────────────────────────────────
export function renderPlaceholder(state: GameState, name: string): string {
  const lines: string[] = [];
  lines.push(headerBar(state, name.toUpperCase()));
  lines.push('');
  lines.push(`  ${COLORS.moss(`[ ${name} ]`)}`);
  lines.push('');
  lines.push(`  ${COLORS.dim('This screen is under construction.')}`);
  lines.push('');
  return lines.join('\n');
}