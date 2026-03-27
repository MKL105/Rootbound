import type { GameState } from "../../data/types";
import { COLORS, escHtml, headerBar, paddingRight, thinRule } from "../render";
import { SKILL_NAMES } from "../../game/state";
import { getItemDef, getItemLabel, getSellPrice } from "../../data/items";

// ── INVENTORY ──────────────────────────────────────────────────────────────
export function renderInventory(state: GameState, filter: string | null = null): string {
    const lines: string[] = [];

    // Resolve filter
    let filterLabel = '';
    let sortBy: 'price' | 'quantity' | null = null;
    let skillFilter: string | null = null;
    let rarityFilter = false;

    if (filter?.startsWith('--sort:')) {
        sortBy = filter.replace('--sort:', '') as 'price' | 'quantity';
        filterLabel = `sorted by ${sortBy}`;
    } else if (filter === 'rare') {
        rarityFilter = true;
        filterLabel = 'rare+';
    } else if (filter && SKILL_NAMES.includes(filter as any)) {
        skillFilter = filter;
        filterLabel = filter;
    }

    const title = filterLabel ? `INVENTORY  [${filterLabel}]` : 'INVENTORY';
    lines.push(headerBar(state, title));
    lines.push('');

    const inv = state.inventory;
    let keys = Object.keys(inv).filter(k => inv[k] > 0);

    // Apply filters
    if (skillFilter) {
        keys = keys.filter(k => (getItemDef(k)?.category ?? '') === skillFilter);
    }
    if (rarityFilter) {
        const RARE_SET = new Set(['rare', 'very_rare', 'legendary', 'mythic']);
        keys = keys.filter(k => RARE_SET.has(getItemDef(k)?.rarity ?? ''));
    }

    // Sorting
    if (sortBy === 'price') {
        keys.sort((a, b) => getSellPrice(b) - getSellPrice(a));
    } else if (sortBy === 'quantity') {
        keys.sort((a, b) => inv[b] - inv[a]);
    } else {
        keys.sort();
    }

    if (keys.length === 0) {
        lines.push(`  ${COLORS.dim(filter ? `No items matching filter '${filter}'.` : 'Your inventory is empty.')}`);
        lines.push(`  ${COLORS.dim('Start foraging, woodcutting, or fishing to gather resources.')}`);
    } else {
        const totalValue = keys.reduce((s, k) => s + getSellPrice(k) * inv[k], 0);
        lines.push(`  ${COLORS.dim(`${keys.length} item types  ·  est. sell value:`)} ${COLORS.gold(totalValue.toLocaleString() + 'g')}`);
        lines.push('');
        lines.push(`  ${thinRule()}`);

        const RARITY_ICON: Record<string, string> = {
            common: '', uncommon: '', rare: '🔵', very_rare: '🟣', legendary: '🟠', mythic: '💀'
        };

        const LW = 44; //TODO: magic numbers
        const half = Math.ceil(keys.length / 2);
        const left = keys.slice(0, half);
        const right = keys.slice(half);
        const rows = Math.max(left.length, right.length);

        for (let i = 0; i < rows; i++) {
            const fmtItem = (k: string | undefined) => {
                if (!k) return '';
                const def = getItemDef(k);
                const label = getItemLabel(k);
                const qty = `×${inv[k].toLocaleString()}`;
                const price = getSellPrice(k);
                const icon = RARITY_ICON[def?.rarity ?? ''] ?? '';
                const iconPad = icon ? icon + ' ' : '  ';
                return paddingRight(`  ${iconPad}${paddingRight(COLORS.white(label), 23)}  ${paddingRight(COLORS.gold(qty), 8)}`, LW) + COLORS.dim(price + 'g');//TODO: magic numbers
            };
            lines.push(paddingRight(fmtItem(left[i]), LW + 14) + fmtItem(right[i]));//TODO: magic numbers
        }
    }

    lines.push('');
    lines.push(`  ${thinRule()}`);
    lines.push(`  ${COLORS.dim(escHtml('inv [skill]  ·  inv rare  ·  inv --sort price  ·  sell <item> [qty]'))}`);
    return lines.join('\n');
}