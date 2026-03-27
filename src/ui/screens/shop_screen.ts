import type { GameState } from "../../data/types";
import { COLORS, escHtml, headerBar, paddingRight, thinRule } from "../render";
import { SHOP_ITEMS } from "../../data/items";

// ── SHOP ───────────────────────────────────────────────────────────────────
export function renderShop(state: GameState): string {
    const lines: string[] = [];
    lines.push(headerBar(state, 'THE VERDANT EXCHANGE'));
    lines.push('');
    lines.push(`  ${COLORS.dim('Gold available:')} ${COLORS.gold((state.gold ?? 0).toLocaleString() + 'g')}`);
    lines.push('');

    const owned = state.ownedUtilities ?? [];
    const gold = state.gold ?? 0;

    const categories: Array<{ title: string, desc: string, cat: string }> = [
        { title: '🌀 Boosts', desc: 'Temporary bonuses', cat: 'boost' },
        { title: '📦 Lootboxes', desc: 'Chance at rare items', cat: 'lootbox' },
        { title: '🔧 Utility', desc: 'Permanent upgrades', cat: 'utility' },
    ];

    for (const { title, desc, cat } of categories) {
        const items = SHOP_ITEMS.filter(i => i.category === cat);
        lines.push(`  ${COLORS.b(COLORS.forest(title))}  ${COLORS.dim(desc)}`);
        lines.push(`  ${thinRule()}`);
        for (const item of items) {
            const isOwned = item.oneTime && owned.includes(item.id);
            const canAfford = gold >= item.price;
            const nameCol = isOwned ? COLORS.dim : COLORS.white;
            const costCol = isOwned ? COLORS.dim : canAfford ? COLORS.gold : COLORS.red;
            const ownedTag = isOwned ? `  ${COLORS.dim('[owned]')}` : '';
            const costStr = item.price.toLocaleString() + 'g';
            lines.push(`  ${paddingRight(nameCol(item.label), 28)}  ${paddingRight(costCol(costStr), 10)}  ${COLORS.dim(item.desc)}${ownedTag}`); //TODO: magic numbers
        }
        lines.push('');
    }

    lines.push(`  ${COLORS.dim(escHtml("buy <item>  ·  sell <item> [qty]  ·  sell <item> --all"))}`);
    return lines.join('\n');
}