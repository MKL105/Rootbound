// src/main.ts

import './style.css';
import type { NavState } from './types';
import { loadGame, saveGame, defaultState, addLog } from './game/state';
import { tick } from './game/engine';
import { renderScreen } from './ui/render';
import { handleCommand } from './ui/commands';

// ── State ──────────────────────────────────────────────────────────────────
const state = loadGame();
const nav: NavState = { current:'home', history:[], skillDetail:null, helpTopic:null, invFilter:null, actionDetail:null, lootReveal:null, logFilter:null, logN:30 };

let lastMessage    = '';
let lastMessageOk  = true;
let sessionStart   = Date.now() / 1000;
let lastSave       = Date.now() / 1000;
let cmdHistory: string[] = [];
let cmdHistoryIdx  = -1;

// ── DOM ────────────────────────────────────────────────────────────────────
const appEl = document.getElementById('app')!;
appEl.innerHTML = `
  <div class="terminal">
    <div class="terminal-screen" id="screen"></div>
    <div class="message-bar empty" id="msgbar"></div>
    <div class="terminal-input-row">
      <span class="prompt">❯&nbsp;</span>
      <input
        id="cmd-input"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="type a command…"
      />
    </div>
  </div>
`;

const screenEl = document.getElementById('screen')!;
const msgbarEl = document.getElementById('msgbar')!;
const inputEl  = document.getElementById('cmd-input') as HTMLInputElement;

// Auto-focus input on click anywhere in the terminal
document.querySelector('.terminal')!.addEventListener('click', () => inputEl.focus());
inputEl.focus();

// ── Rendering ──────────────────────────────────────────────────────────────
function redraw() {
  screenEl.innerHTML = renderScreen(state, nav);

  // Handle lootbox screen flash signal
  const signal = document.getElementById('loot-flash-signal') as HTMLElement | null;
  if (signal) {
    const flashClass = signal.dataset.flash ?? '';
    if (flashClass) {
      const FLASH_CLASSES = ['rare-screen-flash','legendary-screen-flash','mythic-screen-flash'];
      screenEl.classList.remove(...FLASH_CLASSES);
      void screenEl.offsetWidth; // force reflow so animation restarts
      screenEl.classList.add(flashClass);
    }
  }
}

function showMessage(msg: string, isOk: boolean) {
  msgbarEl.textContent = msg;
  msgbarEl.className   = `message-bar ${msg ? (isOk ? 'ok' : 'err') : 'empty'}`;
}

// Level-up flash effect on the terminal
function flashLevelUp() {
  screenEl.classList.remove('level-up-flash');
  // Force reflow
  void screenEl.offsetWidth;
  screenEl.classList.add('level-up-flash');
}

// ── Command input ──────────────────────────────────────────────────────────
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const raw = inputEl.value;
    inputEl.value = '';
    cmdHistoryIdx = -1;

    if (!raw.trim()) { redraw(); return; }

    // Save to history
    if (cmdHistory[0] !== raw) cmdHistory.unshift(raw);
    if (cmdHistory.length > 50) cmdHistory.pop();

    const result = handleCommand(raw, state, nav);
    lastMessage   = result.message;
    lastMessageOk = result.ok;

    showMessage(lastMessage, lastMessageOk);
    redraw();
    return;
  }

  // Command history navigation
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    cmdHistoryIdx = Math.min(cmdHistoryIdx + 1, cmdHistory.length - 1);
    inputEl.value = cmdHistory[cmdHistoryIdx] ?? '';
    inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    cmdHistoryIdx = Math.max(cmdHistoryIdx - 1, -1);
    inputEl.value = cmdHistoryIdx >= 0 ? (cmdHistory[cmdHistoryIdx] ?? '') : '';
    inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
    return;
  }
});

// ── Game loop ──────────────────────────────────────────────────────────────
let prevLogLength = state.log.length;

function gameLoop() {
  const now = Date.now() / 1000;

  // Track playtime
  state.playedSeconds += now - sessionStart;
  sessionStart = now;

  // Run game tick
  tick(state);

  // Check for new log entries (for level-up flash)
  const levelUps = state.log.slice(0, state.log.length - prevLogLength)
    .filter(e => e.category === 'level_up');
  if (levelUps.length > 0) flashLevelUp();
  prevLogLength = state.log.length;

  // Auto-save
  if (now - lastSave > 30) {
    saveGame(state);
    lastSave = now;
  }

  // Re-render every tick
  redraw();
}

// ── Boot ───────────────────────────────────────────────────────────────────
function boot() {
  addLog(state, 'Welcome back, druid. The forest stirs.', 'general');
  redraw();
  // Tick every 250ms — fast enough for smooth progress bars
  setInterval(gameLoop, 250);
}

boot();
