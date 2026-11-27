// Random seating for round tables and classroom grids. Pure functions; randomness is injected for testability.
import { shuffle, type RandomSource } from '../random-picker/logic';

export type Layout = 'tables' | 'grid';

/** `back`: seen from the back of the room, front desk at the top. `front`: seen from the front desk, desk at the bottom. */
export type GridView = 'back' | 'front';

export const LIMITS = { tables: 50, seatsPerTable: 20, rows: 12, cols: 12, frontRows: 3 } as const;

export type ArrangeError =
  | { code: 'empty' }
  | { code: 'tooMany'; people: number; seats: number }
  | { code: 'tableFull'; table: number; pinned: number; seats: number }
  | { code: 'frontFull'; needed: number; seats: number };

export type Result<T> = { ok: true; value: T } | { ok: false; error: ArrangeError };

const fail = (error: ArrangeError): { ok: false; error: ArrangeError } => ({ ok: false, error });

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/* ---------- Round tables ---------- */

/** `person` is an index into the name list, `table` is zero-based. */
export interface TablePin {
  person: number;
  table: number;
}

export interface TablesInput {
  people: number;
  tables: number;
  seatsPerTable: number;
  pins?: readonly TablePin[];
}

/** Drops pins that point outside the list or the tables; a person keeps only the first pin. */
export function validTablePins(pins: readonly TablePin[], people: number, tables: number): TablePin[] {
  const seen = new Set<number>();
  return pins.filter(({ person, table }) => {
    if (!Number.isInteger(person) || person < 0 || person >= people) return false;
    if (!Number.isInteger(table) || table < 0 || table >= tables) return false;
    if (seen.has(person)) return false;
    seen.add(person);
    return true;
  });
}

/**
 * Head count per table. Starts from the pinned people, then adds one person at a time to the
 * emptiest table that still has a free seat (the lower table number wins a tie), so sizes
 * differ by at most one unless pins force a bigger table.
 */
export function tableSizes(people: number, tables: number, seatsPerTable: number, pinned: readonly number[] = []): number[] {
  const sizes = Array.from({ length: tables }, (_, i) => Math.min(pinned[i] ?? 0, seatsPerTable));
  let left = people - sizes.reduce((a, b) => a + b, 0);
  while (left > 0) {
    let best = -1;
    for (let i = 0; i < tables; i++) {
      if (sizes[i] < seatsPerTable && (best < 0 || sizes[i] < sizes[best])) best = i;
    }
    if (best < 0) break;
    sizes[best]++;
    left--;
  }
  return sizes;
}

/** Person indexes per table: pinned people first (in pin order), then the shuffled rest. */
export function arrangeTables(input: TablesInput, random?: RandomSource): Result<number[][]> {
  const { people, tables, seatsPerTable } = input;
  const seats = tables * seatsPerTable;
  if (people <= 0) return fail({ code: 'empty' });
  if (people > seats) return fail({ code: 'tooMany', people, seats });

  const pins = validTablePins(input.pins ?? [], people, tables);
  const result: number[][] = Array.from({ length: tables }, () => []);
  for (const pin of pins) result[pin.table].push(pin.person);
  for (let i = 0; i < tables; i++) {
    if (result[i].length > seatsPerTable) {
      return fail({ code: 'tableFull', table: i, pinned: result[i].length, seats: seatsPerTable });
    }
  }

  const pinned = new Set(pins.map((p) => p.person));
  const free: number[] = [];
  for (let i = 0; i < people; i++) if (!pinned.has(i)) free.push(i);
  const pool = shuffle(free, random);
  const sizes = tableSizes(
    people,
    tables,
    seatsPerTable,
    result.map((t) => t.length),
  );
  let next = 0;
  for (let i = 0; i < tables; i++) {
    while (result[i].length < sizes[i]) result[i].push(pool[next++]);
  }
  return { ok: true, value: result };
}

/* ---------- Classroom grid ---------- */

/** Seat number: row × cols + col. Row 0 is the front row; col 0 is on the left when facing the front. */
export function seatIndex(row: number, col: number, cols: number): number {
  return row * cols + col;
}

export function seatPosition(seat: number, cols: number): { row: number; col: number } {
  return { row: Math.floor(seat / cols), col: seat % cols };
}

/** `person` is an index into the name list. */
export interface SeatPin {
  person: number;
  seat: number;
}

export interface GridInput {
  people: number;
  rows: number;
  cols: number;
  /** Seats nobody sits in (aisles, removed desks). */
  blocked?: readonly number[];
  pins?: readonly SeatPin[];
  /** People who must sit within the first `frontRows` rows. */
  front?: readonly number[];
  frontRows?: number;
}

/** Drops pins outside the list or the room, on unused seats, and repeats of a person or a seat. */
export function validSeatPins(
  pins: readonly SeatPin[],
  people: number,
  seatCount: number,
  blocked: readonly number[] = [],
): SeatPin[] {
  const off = new Set(blocked);
  const persons = new Set<number>();
  const seats = new Set<number>();
  return pins.filter(({ person, seat }) => {
    if (!Number.isInteger(person) || person < 0 || person >= people || persons.has(person)) return false;
    if (!Number.isInteger(seat) || seat < 0 || seat >= seatCount || off.has(seat) || seats.has(seat)) return false;
    persons.add(person);
    seats.add(seat);
    return true;
  });
}

/**
 * One entry per seat: a person index, or null for an empty or unused seat.
 * When there are fewer people than seats, the room fills from the front row and the back stays empty.
 */
export function arrangeGrid(input: GridInput, random?: RandomSource): Result<(number | null)[]> {
  const { people, rows, cols } = input;
  const seatCount = rows * cols;
  const off = new Set((input.blocked ?? []).filter((s) => s >= 0 && s < seatCount));
  const usable = seatCount - off.size;
  if (people <= 0) return fail({ code: 'empty' });
  if (people > usable) return fail({ code: 'tooMany', people, seats: usable });

  const pins = validSeatPins(input.pins ?? [], people, seatCount, [...off]);
  const result: (number | null)[] = new Array(seatCount).fill(null);
  const placed = new Set<number>();
  for (const pin of pins) {
    result[pin.seat] = pin.person;
    placed.add(pin.person);
  }

  // The seats that will be taken this round: the frontmost free ones, one per unpinned person.
  const open: number[] = [];
  for (let seat = 0; seat < seatCount && open.length < people - pins.length; seat++) {
    if (!off.has(seat) && result[seat] === null) open.push(seat);
  }

  const frontRows = Math.max(1, Math.floor(input.frontRows ?? 1));
  const front = [...new Set(input.front ?? [])].filter((p) => Number.isInteger(p) && p >= 0 && p < people && !placed.has(p));
  if (front.length > 0) {
    const zone = open.filter((seat) => seat < frontRows * cols);
    if (front.length > zone.length) return fail({ code: 'frontFull', needed: front.length, seats: zone.length });
    const picked = shuffle(zone, random).slice(0, front.length);
    front.forEach((person, i) => {
      result[picked[i]] = person;
      placed.add(person);
    });
  }

  const rest: number[] = [];
  for (let i = 0; i < people; i++) if (!placed.has(i)) rest.push(i);
  const pool = shuffle(rest, random);
  let next = 0;
  for (const seat of open) {
    if (result[seat] === null) result[seat] = pool[next++];
  }
  return { ok: true, value: result };
}

/** Seat numbers in reading order (left to right, top to bottom) for a view. The front-desk view is the room turned 180°. */
export function displaySeats(rows: number, cols: number, view: GridView): number[] {
  const order = Array.from({ length: rows * cols }, (_, i) => i);
  return view === 'front' ? order.reverse() : order;
}

/** Keeps seat numbers pointing at the same row and column after the room is resized; seats that no longer exist are dropped. */
export function remapSeats(seats: readonly number[], oldCols: number, rows: number, cols: number): number[] {
  const out: number[] = [];
  for (const seat of seats) {
    const { row, col } = seatPosition(seat, oldCols);
    if (seat >= 0 && row < rows && col < cols) out.push(seatIndex(row, col, cols));
  }
  return out;
}

export function chunkRows<T>(seats: readonly T[], cols: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < seats.length; i += cols) out.push(seats.slice(i, i + cols));
  return out;
}

/* ---------- Names ---------- */

/**
 * Matches names to positions in the list. Each name takes the first position with that name that is
 * still free, so two people with the same name can both be matched. Unknown names give -1.
 */
export function resolveNames(people: readonly string[], names: readonly string[]): number[] {
  const taken = new Set<number>();
  return names.map((name) => {
    for (let i = 0; i < people.length; i++) {
      if (people[i] === name && !taken.has(i)) {
        taken.add(i);
        return i;
      }
    }
    return -1;
  });
}

/** True when both lists hold the same names the same number of times, in any order. */
export function sameMembers(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const name of a) counts.set(name, (counts.get(name) ?? 0) + 1);
  for (const name of b) {
    const left = counts.get(name) ?? 0;
    if (left === 0) return false;
    counts.set(name, left - 1);
  }
  return true;
}

/* ---------- Printing ---------- */

/** Room left for the seating on a portrait A4 sheet with 10 mm margins, below the title. */
export const SHEET_HEIGHT_MM = 245;

export interface TableSheet {
  /** Cards per row. */
  cols: number;
  /** Name columns inside a card. */
  nameCols: number;
  /** Name font size in mm. */
  fontMm: number;
}

/**
 * Fits the table cards on one portrait sheet: picks the cards per row, then the largest name size
 * (between 2.4 mm and 4.6 mm) that keeps every row of cards within `heightMm`.
 */
export function fitTableSheet(tables: number, maxMembers: number, heightMm = SHEET_HEIGHT_MM): TableSheet {
  const cols = tables <= 4 ? 2 : tables <= 15 ? 3 : tables <= 28 ? 4 : 5;
  const nameCols = cols >= 4 || maxMembers <= 6 ? 1 : 2;
  const cardRows = Math.max(1, Math.ceil(tables / cols));
  // A card is a heading (1.9 lines) plus the name lines, at a 1.5 line height, with 5 mm of padding and a 4 mm gap.
  const lines = 1.9 + Math.max(1, Math.ceil(maxMembers / nameCols));
  const perCard = (heightMm - 4 * (cardRows - 1)) / cardRows - 5;
  const fontMm = Math.max(2.4, Math.min(4.6, perCard / (lines * 1.5)));
  return { cols, nameCols, fontMm: Math.round(fontMm * 100) / 100 };
}

/** Seat height in mm so that `rows` rows, the 3 mm gaps and the front desk (16 mm) fit within `heightMm`; at most 30 mm. */
export function gridRowHeightMm(rows: number, heightMm = SHEET_HEIGHT_MM): number {
  const height = (heightMm - 16 - 3 * (rows - 1)) / Math.max(1, rows);
  return Math.round(Math.min(30, height) * 100) / 100;
}
