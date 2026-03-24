import type { GameState } from "../../data/types";
import { COLORS, headerBar, paddingRight, thinRule } from "../render";

// ── HELP ───────────────────────────────────────────────────────────────────
const ALL_COMMANDS = [
    ['go <dest>', 'Navigate to a screen (help go for full list)'],
    ['back', 'Return to previous screen'],
    ['home', 'Jump to main HUD from anywhere'],
    ['do <skill> <action> [qty]', 'Start action immediately (--keep to preserve queue)'],
    ['queue <skill> <action> [qty]', 'Add to queue. Starts immediately if idle'],
    ['stop [--all]', 'Stop current action (--all also clears queue)'],
    ['clear [--all]', 'Clear queue (--all also stops current)'],
    ['q [remove <n>|move <a> <b>]', 'View / manage the queue'],
    ['inv [skill|rare]', 'Inventory, optionally filtered'],
    ['inspect <item>', 'Detailed item info'],
    ['shop [boosts|lootboxes|utility]', 'Open The Verdant Exchange'],
    ['buy <item> [qty]', 'Purchase from shop'],
    ['sell <item> [qty|--all]', 'Sell items for gold (no confirmation)'],
    ['skills', 'All 15 skills with level overview'],
    ['skill <name>', 'Full detail: sub-actions, requirements, XP'],
    ['stats', 'Character overview, completion tracker, buffs'],
    ['log [filter]', 'Event log (drops | rare | level | combat)'],
    ['season', 'Current season, bonuses, exclusive content'],
    ['completion [view]', 'Detailed tracker: actions, drops, combat, milestones, sets'],
    ['debug <sub>', 'Dev tools: season, addxp, addgold, additem'],
    ['help [command]', 'This screen, or help for a specific command'],
];

interface HelpPage {
    usage: string;
    desc: string;
    args: Array<[string, string]>;
    examples: string[];
}

const HELP_PAGES: Record<string, HelpPage> = {
    go: {
        usage: 'go <screen>',
        desc: 'Navigate to a different screen.',
        args: [['screen', 'home · skills · inventory · shop · log · season · stats']],
        examples: ['go home', 'go shop', 'go skills'],
    },
    do: {
        usage: 'do <skill> <action> [qty] [--keep]',
        desc: 'Start an action immediately. Clears the queue unless --keep is used.',
        args: [
            ['skill', 'skill name e.g. foraging, brewing, combat'],
            ['action', 'sub-action name e.g. gather_wildberries, brew_chamomile_tea'],
            ['qty', 'repetitions. Default: 1'],
            ['--keep', 'preserve the existing queue when starting'],
        ],
        examples: ['do foraging gather_wildberries', 'do foraging gather_wildberries 20', 'do brewing brew_chamomile_tea 10', 'do foraging gather_moonbloom --keep'],
    },
    queue: {
        usage: 'queue <skill> <action> [qty]',
        desc: 'Add an action to the end of the queue. Starts immediately if the queue is empty.',
        args: [
            ['skill', 'skill name'],
            ['action', 'sub-action name'],
            ['qty', 'repetitions. Default: 1'],
        ],
        examples: ['queue brewing brew_chamomile_tea 5', 'queue woodcutting chop_birch 10'],
    },
    stop: {
        usage: 'stop [--all]',
        desc: 'Stop the currently running action. Partial progress is lost.',
        args: [['--all', 'also clear the entire queue']],
        examples: ['stop', 'stop --all'],
    },
    clear: {
        usage: 'clear [--all]',
        desc: 'Clear all queued actions without stopping the current one.',
        args: [['--all', 'also stop the currently running action']],
        examples: ['clear', 'clear --all'],
    },
    q: {
        usage: 'q [remove <n> | move <a> <b>]',
        desc: 'View and manage the action queue.',
        args: [
            ['(none)', 'show the queue'],
            ['remove <n>', 'remove the entry at slot n'],
            ['move <a> <b>', 'swap slots a and b'],
        ],
        examples: ['q', 'q remove 3', 'q move 1 4'],
    },
    view: {
        usage: 'view <target> [args]',
        desc: 'Inspect an action, item, or skill in detail.',
        args: [
            ['action <skill> <action>', 'full info on a sub-action: duration, XP, output, requirements'],
            ['item <name>', 'item detail: sell price, rarity, which actions produce it'],
            ['skill <name>', 'shortcut for the skill detail screen'],
        ],
        examples: ['view action foraging gather_moonbloom', 'view action brewing brew_clarity_potion', 'view item moonbloom_petals', 'view skill combat'],
    },
    inv: {
        usage: 'inv [filter] [--sort price|quantity]',
        desc: 'Show your inventory, optionally filtered and sorted.',
        args: [
            ['(none)', 'all items, sorted alphabetically'],
            ['<skill>', 'only items from that skill category'],
            ['rare', 'only uncommon rarity and above'],
            ['--sort price', 'sort by sell value descending'],
            ['--sort quantity', 'sort by quantity descending'],
        ],
        examples: ['inv', 'inv foraging', 'inv rare', 'inv --sort price', 'inv brewing --sort quantity'],
    },
    inspect: {
        usage: 'inspect <item>',
        desc: 'Show full detail on an item: sell price, rarity, which actions produce it.',
        args: [['item', 'item name (spaces or underscores both work)']],
        examples: ['inspect moonbloom_petals', 'inspect ancient bark'],
    },
    sell: {
        usage: 'sell <item> [qty] [--all]',
        desc: 'Sell items from your inventory for gold. No confirmation prompt — sells immediately.',
        args: [
            ['item', 'item name (spaces or underscores both work)'],
            ['qty', 'how many to sell. Default: 1'],
            ['--all', 'sell your entire stack'],
        ],
        examples: ['sell wildberries 50', 'sell moonbloom_petals --all', 'sell birch_logs 200'],
    },
    buy: {
        usage: 'buy <item> [qty]',
        desc: "Purchase from The Verdant Exchange. Type 'shop' to browse.",
        args: [
            ['item', 'shop item name e.g. wanderers_focus, grove_chest, expanded_satchel'],
            ['qty', 'quantity (boosts and lootboxes only, default 1)'],
        ],
        examples: ['buy wanderers_focus', 'buy grove_chest 3', 'buy field_journal'],
    },
    skill: {
        usage: 'skill <name>',
        desc: 'Full detail page for a skill: level, XP progress, all sub-actions with requirements.',
        args: [['name', 'skill name e.g. foraging, combat, ritualism']],
        examples: ['skill foraging', 'skill combat', 'skill brew'],
    },
    log: {
        usage: 'log [filter] [--n <count>]',
        desc: 'Show the event log.',
        args: [
            ['(none)', 'last 30 events'],
            ['drops', 'item drops only'],
            ['rare', 'rare tier drops and above'],
            ['level', 'level-up events only'],
            ['combat', 'combat events only'],
            ['--n <num>', 'show N events (max 200)'],
        ],
        examples: ['log', 'log rare', 'log level', 'log --n 100'],
    },
    season: {
        usage: 'season',
        desc: 'Current season info: time remaining, active bonuses, exclusive content, next season.',
        args: [],
        examples: ['season'],
    },
    completion: {
        usage: 'completion [view]',
        desc: 'Detailed completion tracker. Without a subview shows the overview.',
        args: [
            ['(none)', 'overview with category bars and legendary set progress'],
            ['actions', 'per-skill action mastery — which actions you have and haven\'t done'],
            ['drops', 'all 41 trackable rare drops, grouped by skill'],
            ['combat', 'per-enemy kill counts and completion points'],
            ['milestones', 'all 20 world milestones with ✓/○ status and descriptions'],
            ['sets', 'legendary set piece checklist and rewards'],
        ],
        examples: ['completion', 'completion actions', 'completion drops', 'completion combat', 'completion milestones', 'completion sets'],
    },
    debug: {
        usage: 'debug <subcommand>',
        desc: 'Development tools. Useful for testing seasonal content and late-game areas.',
        args: [
            ['season', 'advance to the next season immediately'],
            ['addxp <skill> <n>', 'add N XP to a skill'],
            ['addgold <n>', 'add N gold'],
            ['additem <item> [n]', 'add N of an item to inventory'],
        ],
        examples: ['debug season', 'debug addxp foraging 5000', 'debug addgold 10000', 'debug additem moonbloom_petals 10'],
    },
    stats: {
        usage: 'stats',
        desc: 'Character overview: completion tracker, active buffs, companions, gold, playtime.',
        args: [],
        examples: ['stats'],
    },
};

export function renderHelp(state: GameState, topic?: string | null): string {
    const lines: string[] = [];

    if (topic && HELP_PAGES[topic]) {
        const page = HELP_PAGES[topic];
        lines.push(headerBar(state, `HELP — ${topic.toUpperCase()}`));
        lines.push('');
        lines.push(`  ${COLORS.b(COLORS.moss(page.usage))}`);
        lines.push('');
        lines.push(`  ${COLORS.white(page.desc)}`);

        if (page.args.length > 0) {
            lines.push('');
            lines.push(`  ${COLORS.b(COLORS.forest('Arguments'))}`);
            lines.push(`  ${thinRule()}`);
            for (const [arg, desc] of page.args) {
                lines.push(`  ${paddingRight(COLORS.gold(arg), 28)}  ${COLORS.dim(desc)}`);
            }
        }

        if (page.examples.length > 0) {
            lines.push('');
            lines.push(`  ${COLORS.b(COLORS.forest('Examples'))}`);
            lines.push(`  ${thinRule()}`);
            for (const ex of page.examples) {
                lines.push(`  ${COLORS.moss('❯')}  ${COLORS.white(ex)}`);
            }
        }

        lines.push('');
        lines.push(`  ${COLORS.dim("back  — return  ·  help  — full command list")}`);
    } else {
        lines.push(headerBar(state, 'HELP'));
        lines.push('');
        if (topic) {
            lines.push(`  ${COLORS.dim(`No help page for '${topic}'.`)}`);
            lines.push('');
        }
        lines.push(`  ${COLORS.b(COLORS.forest('All Commands'))}`);
        lines.push(`  ${thinRule()}`);
        for (const [cmd, desc] of ALL_COMMANDS) {
            const hasPage = !!HELP_PAGES[cmd.split(' ')[0]];
            const indicator = hasPage ? COLORS.dim('?') : ' ';
            lines.push(`  ${indicator} ${paddingRight(COLORS.gold(cmd), 34)}  ${COLORS.dim(desc)}`); //TODO: magical numbers
        }
        lines.push('');
        lines.push(`  ${COLORS.dim('help <command>  — detailed help  ·  ? = has detail page')}`);
    }

    return lines.join('\n');
}