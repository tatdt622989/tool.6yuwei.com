// Keyboard tester: ANSI layout model + key-state tracking. DOM-free.

/** Layout grid unit: positions and sizes are in quarter key widths ("q"). */
export const Q = 4;

export interface KeyDef {
  /** KeyboardEvent.code */
  code: string;
  label: string;
  /** Secondary legend shown above the main label (e.g. "!" on the 1 key). */
  top?: string;
  /** Label used on macOS keyboards when different. */
  macLabel?: string;
  /** Column start in quarter units (0-based). */
  x: number;
  /** Row index (0 = function row; 1 is the spacer row; 2..6 main rows). */
  y: number;
  /** Width in quarter units. */
  w: number;
  /** Height in rows. */
  h: number;
  block: 'main' | 'nav' | 'numpad';
}

/** [code, label, widthInKeys?, top?, macLabel?] or a number = gap in keys. */
type Spec = [string, string, number?, string?, string?] | number;

function buildRow(items: Spec[], startKeys: number, y: number, block: KeyDef['block']): KeyDef[] {
  const keys: KeyDef[] = [];
  let x = Math.round(startKeys * Q);
  for (const item of items) {
    if (typeof item === 'number') {
      x += Math.round(item * Q);
      continue;
    }
    const [code, label, width = 1, top, macLabel] = item;
    const w = Math.round(width * Q);
    keys.push({ code, label, top, macLabel, x, y, w, h: 1, block });
    x += w;
  }
  return keys;
}

const letters = (s: string): Spec[] => [...s].map((c) => [`Key${c}`, c] as Spec);

const MAIN: Spec[][] = [
  [['Escape', 'Esc'], 1, ...Array.from({ length: 4 }, (_, i) => [`F${i + 1}`, `F${i + 1}`] as Spec), 0.5,
    ...Array.from({ length: 4 }, (_, i) => [`F${i + 5}`, `F${i + 5}`] as Spec), 0.5,
    ...Array.from({ length: 4 }, (_, i) => [`F${i + 9}`, `F${i + 9}`] as Spec)],
  [
    ['Backquote', '`', 1, '~'],
    ...'1234567890'.split('').map((d, i) => [`Digit${d}`, d, 1, '!@#$%^&*()'[i]] as Spec),
    ['Minus', '-', 1, '_'],
    ['Equal', '=', 1, '+'],
    ['Backspace', 'Backspace', 2, undefined, 'Delete'],
  ],
  [['Tab', 'Tab', 1.5], ...letters('QWERTYUIOP'), ['BracketLeft', '[', 1, '{'], ['BracketRight', ']', 1, '}'], ['Backslash', '\\', 1.5, '|']],
  [['CapsLock', 'Caps Lock', 1.75], ...letters('ASDFGHJKL'), ['Semicolon', ';', 1, ':'], ['Quote', "'", 1, '"'], ['Enter', 'Enter', 2.25, undefined, 'Return']],
  [['ShiftLeft', 'Shift', 2.25], ...letters('ZXCVBNM'), ['Comma', ',', 1, '<'], ['Period', '.', 1, '>'], ['Slash', '/', 1, '?'], ['ShiftRight', 'Shift', 2.75]],
  [
    ['ControlLeft', 'Ctrl', 1.25, undefined, 'Control'],
    ['MetaLeft', 'Win', 1.25, undefined, '⌘ Cmd'],
    ['AltLeft', 'Alt', 1.25, undefined, '⌥ Option'],
    ['Space', 'Space', 6.25],
    ['AltRight', 'Alt', 1.25, undefined, '⌥ Option'],
    ['MetaRight', 'Win', 1.25, undefined, '⌘ Cmd'],
    ['ContextMenu', 'Menu', 1.25],
    ['ControlRight', 'Ctrl', 1.25, undefined, 'Control'],
  ],
];

const NAV: (Spec[] | null)[] = [
  [['PrintScreen', 'PrtSc'], ['ScrollLock', 'ScrLk'], ['Pause', 'Pause']],
  [['Insert', 'Ins'], ['Home', 'Home'], ['PageUp', 'PgUp']],
  [['Delete', 'Del'], ['End', 'End'], ['PageDown', 'PgDn']],
  null,
  [1, ['ArrowUp', '↑']],
  [['ArrowLeft', '←'], ['ArrowDown', '↓'], ['ArrowRight', '→']],
];

const MAIN_WIDTH = 15;
const BLOCK_GAP = 0.5;
const NAV_X = MAIN_WIDTH + BLOCK_GAP;
const NUMPAD_X = NAV_X + 3 + BLOCK_GAP;

/** Row index for logical row r (0 = F-row, 1..5 = main rows); row 1 in the grid is a spacer. */
const gridRow = (r: number) => (r === 0 ? 0 : r + 1);

function buildNumpad(): KeyDef[] {
  const x = NUMPAD_X;
  const keys: KeyDef[] = [
    ...buildRow([['NumLock', 'Num'], ['NumpadDivide', '/'], ['NumpadMultiply', '*'], ['NumpadSubtract', '-']], x, gridRow(1), 'numpad'),
    ...buildRow([['Numpad7', '7'], ['Numpad8', '8'], ['Numpad9', '9']], x, gridRow(2), 'numpad'),
    ...buildRow([['Numpad4', '4'], ['Numpad5', '5'], ['Numpad6', '6']], x, gridRow(3), 'numpad'),
    ...buildRow([['Numpad1', '1'], ['Numpad2', '2'], ['Numpad3', '3']], x, gridRow(4), 'numpad'),
    ...buildRow([['Numpad0', '0', 2], ['NumpadDecimal', '.']], x, gridRow(5), 'numpad'),
  ];
  const tall = (code: string, label: string, r: number): KeyDef => ({
    code, label, x: Math.round((x + 3) * Q), y: gridRow(r), w: Q, h: 2, block: 'numpad',
  });
  keys.push(tall('NumpadAdd', '+', 2), tall('NumpadEnter', 'Enter', 4));
  return keys;
}

export interface Layout {
  keys: KeyDef[];
  /** Total width in quarter units. */
  columns: number;
  /** Number of grid rows (including the spacer row). */
  rows: number;
}

export function buildLayout(numpad: boolean): Layout {
  const keys: KeyDef[] = [];
  MAIN.forEach((row, r) => keys.push(...buildRow(row, 0, gridRow(r), 'main')));
  NAV.forEach((row, r) => {
    if (row) keys.push(...buildRow(row, NAV_X, gridRow(r), 'nav'));
  });
  if (numpad) keys.push(...buildNumpad());
  const columns = Math.round((numpad ? NUMPAD_X + 4 : NAV_X + 3) * Q);
  return { keys, columns, rows: gridRow(5) + 1 };
}

export function keyLabel(key: KeyDef, mac: boolean): string {
  return mac && key.macLabel ? key.macLabel : key.label;
}

/** Browsers report '' (some virtual keyboards) or 'Unidentified'; fall back to the key value. */
export function normalizeCode(code: string, key: string): string {
  if (code && code !== 'Unidentified') return code;
  return key ? `Key(${key})` : 'Unidentified';
}

const MODIFIER_CODES = new Set(['ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight']);

/**
 * Whether the tester should swallow the browser's default action while the
 * test area is focused. Ctrl/Cmd shortcuts (e.g. Cmd+W, Ctrl+Tab) are left alone
 * so users can still leave the page; the modifier key itself is still captured.
 */
export function shouldPreventDefault(code: string, ctrlKey: boolean, metaKey: boolean): boolean {
  if (MODIFIER_CODES.has(code)) return true;
  return !(ctrlKey || metaKey);
}

export const LOCATION_LABEL = ['標準', '左側', '右側', '數字鍵盤'] as const;

export function locationLabel(location: number): string {
  return LOCATION_LABEL[location] ?? String(location);
}

/** Human-readable event.key. */
export function displayKey(key: string): string {
  if (key === ' ') return 'Space（空白）';
  if (key === '') return '（空）';
  return key;
}

/** Tracks which keys are held, which have been tested, and peak simultaneous presses. */
export class KeyTracker {
  readonly down = new Set<string>();
  readonly tested = new Set<string>();
  maxSimultaneous = 0;
  presses = 0;

  /** Returns false for auto-repeat (key already held). */
  press(code: string): boolean {
    if (this.down.has(code)) return false;
    this.down.add(code);
    this.tested.add(code);
    this.presses += 1;
    this.maxSimultaneous = Math.max(this.maxSimultaneous, this.down.size);
    return true;
  }

  /**
   * On macOS, keys released while Command is held never fire keyup, so when
   * Meta goes up we release everything to avoid "stuck" keys.
   */
  release(code: string, releaseAllOnMeta = false): void {
    if (releaseAllOnMeta && (code === 'MetaLeft' || code === 'MetaRight')) {
      this.down.clear();
      return;
    }
    this.down.delete(code);
  }

  /** Window blur / focus loss: keyup events will never arrive. */
  releaseAll(): void {
    this.down.clear();
  }

  reset(): void {
    this.down.clear();
    this.tested.clear();
    this.maxSimultaneous = 0;
    this.presses = 0;
  }

  /** Count of layout keys that have been tested. */
  testedIn(codes: Iterable<string>): number {
    let n = 0;
    for (const c of codes) if (this.tested.has(c)) n += 1;
    return n;
  }
}

/** Short explanation of the measured rollover. */
export function rolloverHint(max: number): string {
  if (max < 2) return '同時按住多個鍵（例如 A、S、D、F 加 J、K、L），即可測出鍵盤最多能同時辨識幾個按鍵。';
  if (max <= 3)
    return `目前最多同時偵測到 ${max} 個鍵。若你實際按下更多鍵卻沒有全部亮起，表示這組按鍵有衝突（鬼鍵限制），常見於文書鍵盤與筆電鍵盤。`;
  if (max <= 6)
    return `目前最多同時偵測到 ${max} 個鍵。一般 USB 鍵盤至少支援 6 鍵無衝突（6KRO），多數遊戲情境已足夠。`;
  return `目前最多同時偵測到 ${max} 個鍵，超過 6 鍵，代表這把鍵盤支援 N 鍵無衝突（NKRO，全鍵無衝）。`;
}
