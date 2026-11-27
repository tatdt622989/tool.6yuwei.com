import { describe, expect, it } from 'vitest';
import type { RandomSource } from '../random-picker/logic';
import {
  arrangeGrid,
  arrangeTables,
  chunkRows,
  clampInt,
  displaySeats,
  fitTableSheet,
  gridRowHeightMm,
  remapSeats,
  resolveNames,
  sameMembers,
  seatIndex,
  seatPosition,
  tableSizes,
  validSeatPins,
  validTablePins,
} from './logic';

/** Deterministic 32-bit generator (mulberry32) so every run of the suite sees the same shuffles. */
function seeded(seed: number): RandomSource {
  let a = seed >>> 0;
  return (array) => {
    for (let k = 0; k < array.length; k++) {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      array[k] = (t ^ (t >>> 14)) >>> 0;
    }
    return array;
  };
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const sorted = (values: readonly number[]) => values.slice().sort((a, b) => a - b);

function value<T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!result.ok) throw new Error(`Expected a seating, got ${JSON.stringify(result.error)}`);
  return result.value;
}

describe('clampInt', () => {
  it('floors, clamps and falls back on junk', () => {
    expect(clampInt('7.9', 1, 12, 6)).toBe(7);
    expect(clampInt('0', 1, 12, 6)).toBe(1);
    expect(clampInt('99', 1, 12, 6)).toBe(12);
    expect(clampInt('abc', 1, 12, 6)).toBe(6);
  });
});

describe('tableSizes', () => {
  it('keeps tables within one person of each other', () => {
    expect(tableSizes(115, 12, 10)).toEqual([10, 10, 10, 10, 10, 10, 10, 9, 9, 9, 9, 9]);
    expect(tableSizes(30, 4, 10)).toEqual([8, 8, 7, 7]);
    expect(tableSizes(120, 12, 10)).toEqual(new Array(12).fill(10));
  });

  it('starts from the pinned head count and never exceeds the seats', () => {
    expect(tableSizes(10, 3, 6, [5, 0, 0])).toEqual([5, 3, 2]);
    expect(tableSizes(12, 2, 6, [6, 0])).toEqual([6, 6]);
    expect(tableSizes(4, 2, 10, [0, 3])).toEqual([1, 3]);
  });
});

describe('arrangeTables', () => {
  it('seats every person exactly once', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const tables = value(arrangeTables({ people: 115, tables: 12, seatsPerTable: 10 }, seeded(seed)));
      expect(tables).toHaveLength(12);
      expect(sorted(tables.flat())).toEqual(range(115));
      for (const table of tables) expect(table.length).toBeLessThanOrEqual(10);
    }
  });

  it('keeps pinned people at their table on every shuffle', () => {
    const pins = [
      { person: 0, table: 0 },
      { person: 1, table: 0 },
      { person: 29, table: 2 },
    ];
    for (let seed = 1; seed <= 40; seed++) {
      const tables = value(arrangeTables({ people: 30, tables: 3, seatsPerTable: 10, pins }, seeded(seed)));
      expect(tables[0].slice(0, 2)).toEqual([0, 1]);
      expect(tables[2][0]).toBe(29);
      expect(sorted(tables.flat())).toEqual(range(30));
      expect(tables.map((t) => t.length)).toEqual([10, 10, 10]);
    }
  });

  it('gives different seatings for different random values', () => {
    const a = value(arrangeTables({ people: 30, tables: 3, seatsPerTable: 10 }, seeded(1)));
    const b = value(arrangeTables({ people: 30, tables: 3, seatsPerTable: 10 }, seeded(2)));
    expect(a).not.toEqual(b);
  });

  it('reports an empty list, too many people and an overfull table', () => {
    expect(arrangeTables({ people: 0, tables: 3, seatsPerTable: 10 })).toEqual({ ok: false, error: { code: 'empty' } });
    expect(arrangeTables({ people: 31, tables: 3, seatsPerTable: 10 })).toEqual({
      ok: false,
      error: { code: 'tooMany', people: 31, seats: 30 },
    });
    const pins = [0, 1, 2].map((person) => ({ person, table: 1 }));
    expect(arrangeTables({ people: 6, tables: 3, seatsPerTable: 2, pins })).toEqual({
      ok: false,
      error: { code: 'tableFull', table: 1, pinned: 3, seats: 2 },
    });
  });

  it('ignores pins that point nowhere', () => {
    const pins = [
      { person: 99, table: 0 },
      { person: 0, table: 7 },
      { person: 1, table: 1 },
      { person: 1, table: 0 },
    ];
    expect(validTablePins(pins, 6, 2)).toEqual([{ person: 1, table: 1 }]);
    const tables = value(arrangeTables({ people: 6, tables: 2, seatsPerTable: 3, pins }, seeded(3)));
    expect(tables[1][0]).toBe(1);
    expect(sorted(tables.flat())).toEqual(range(6));
  });

  it('works with the browser random source', () => {
    const tables = value(arrangeTables({ people: 25, tables: 3, seatsPerTable: 10 }));
    expect(sorted(tables.flat())).toEqual(range(25));
  });
});

describe('arrangeGrid', () => {
  const seatedPeople = (seats: readonly (number | null)[]) => seats.filter((p): p is number => p !== null);

  it('seats every person exactly once in a full 40-seat room', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const seats = value(arrangeGrid({ people: 40, rows: 5, cols: 8 }, seeded(seed)));
      expect(seats).toHaveLength(40);
      expect(sorted(seatedPeople(seats))).toEqual(range(40));
    }
  });

  it('fills from the front and leaves the back empty', () => {
    const seats = value(arrangeGrid({ people: 14, rows: 4, cols: 6 }, seeded(5)));
    expect(seats.slice(0, 14).every((p) => p !== null)).toBe(true);
    expect(seats.slice(14).every((p) => p === null)).toBe(true);
  });

  it('never uses a seat marked as unused', () => {
    const blocked = [2, 3, 8, 9, 35];
    for (let seed = 1; seed <= 20; seed++) {
      const seats = value(arrangeGrid({ people: 31, rows: 6, cols: 6, blocked }, seeded(seed)));
      for (const seat of blocked) expect(seats[seat]).toBeNull();
      expect(sorted(seatedPeople(seats))).toEqual(range(31));
    }
  });

  it('keeps pinned people in their seat on every shuffle', () => {
    const pins = [
      { person: 4, seat: 0 },
      { person: 9, seat: 23 },
    ];
    for (let seed = 1; seed <= 40; seed++) {
      const seats = value(arrangeGrid({ people: 20, rows: 4, cols: 6, pins }, seeded(seed)));
      expect(seats[0]).toBe(4);
      expect(seats[23]).toBe(9);
      expect(sorted(seatedPeople(seats))).toEqual(range(20));
      // 18 unpinned people take the 18 frontmost free seats (1–18); seat 23 is the pinned one.
      expect(seats.slice(19, 23).every((p) => p === null)).toBe(true);
    }
  });

  it('puts the front-row people within the chosen rows', () => {
    const front = [3, 11, 17];
    const seen = new Set<number>();
    for (let seed = 1; seed <= 60; seed++) {
      const seats = value(arrangeGrid({ people: 36, rows: 6, cols: 6, front, frontRows: 1 }, seeded(seed)));
      for (const person of front) {
        const seat = seats.indexOf(person);
        expect(seat).toBeGreaterThanOrEqual(0);
        expect(seat).toBeLessThan(6);
        seen.add(seat);
      }
      expect(sorted(seatedPeople(seats))).toEqual(range(36));
    }
    // Over many shuffles they are not stuck in the same three seats.
    expect(seen.size).toBeGreaterThan(3);
  });

  it('counts two front rows when asked and lets a pin win over the front rule', () => {
    const seats = value(
      arrangeGrid({ people: 12, rows: 3, cols: 4, front: [0, 1, 2, 3, 4, 5], frontRows: 2, pins: [{ person: 0, seat: 11 }] }, seeded(8)),
    );
    expect(seats[11]).toBe(0);
    for (const person of [1, 2, 3, 4, 5]) expect(seats.indexOf(person)).toBeLessThan(8);
  });

  it('reports when the front rows cannot hold everyone who needs them', () => {
    expect(arrangeGrid({ people: 12, rows: 3, cols: 4, front: [0, 1, 2, 3, 4], frontRows: 1 })).toEqual({
      ok: false,
      error: { code: 'frontFull', needed: 5, seats: 4 },
    });
    // A pinned or unused front seat is not available to the front-row people.
    expect(
      arrangeGrid({ people: 10, rows: 3, cols: 4, blocked: [0], pins: [{ person: 9, seat: 1 }], front: [0, 1, 2], frontRows: 1 }),
    ).toEqual({ ok: false, error: { code: 'frontFull', needed: 3, seats: 2 } });
  });

  it('reports an empty list and too many people for the usable seats', () => {
    expect(arrangeGrid({ people: 0, rows: 2, cols: 2 })).toEqual({ ok: false, error: { code: 'empty' } });
    expect(arrangeGrid({ people: 40, rows: 5, cols: 8, blocked: [0, 1] })).toEqual({
      ok: false,
      error: { code: 'tooMany', people: 40, seats: 38 },
    });
  });

  it('ignores pins on unused seats, outside the room, or repeated', () => {
    const pins = [
      { person: 0, seat: 5 },
      { person: 1, seat: 5 },
      { person: 0, seat: 6 },
      { person: 2, seat: 3 },
      { person: 3, seat: 40 },
      { person: 50, seat: 1 },
    ];
    expect(validSeatPins(pins, 10, 12, [3])).toEqual([{ person: 0, seat: 5 }]);
    const seats = value(arrangeGrid({ people: 10, rows: 3, cols: 4, blocked: [3], pins }, seeded(2)));
    expect(seats[5]).toBe(0);
    expect(seats[3]).toBeNull();
    expect(sorted(seatedPeople(seats))).toEqual(range(10));
  });
});

describe('grid helpers', () => {
  it('converts between seat numbers and positions', () => {
    expect(seatIndex(2, 3, 6)).toBe(15);
    expect(seatPosition(15, 6)).toEqual({ row: 2, col: 3 });
  });

  it('turns the room 180° for the front-desk view', () => {
    expect(displaySeats(2, 3, 'back')).toEqual([0, 1, 2, 3, 4, 5]);
    expect(displaySeats(2, 3, 'front')).toEqual([5, 4, 3, 2, 1, 0]);
  });

  it('keeps seats at the same row and column when the room is resized', () => {
    // 3 columns → 4 columns: (0,2) stays (0,2), (1,0) becomes seat 4.
    expect(remapSeats([2, 3], 3, 2, 4)).toEqual([2, 4]);
    // Shrinking drops seats that no longer exist.
    expect(remapSeats([2, 3, 8], 3, 2, 2)).toEqual([2]);
  });

  it('splits seats into rows', () => {
    expect(chunkRows(['a', 'b', 'c', 'd', 'e', 'f'], 3)).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]);
  });
});

describe('names', () => {
  it('matches repeated names to different people and flags unknown ones', () => {
    const people = ['佐藤', '鈴木', '佐藤', '高橋'];
    expect(resolveNames(people, ['佐藤', '高橋', '佐藤', '佐藤', '田中'])).toEqual([0, 3, 2, -1, -1]);
  });

  it('compares lists as multisets', () => {
    expect(sameMembers(['a', 'b', 'a'], ['a', 'a', 'b'])).toBe(true);
    expect(sameMembers(['a', 'b', 'a'], ['a', 'b', 'b'])).toBe(false);
    expect(sameMembers(['a'], ['a', 'a'])).toBe(false);
  });
});

describe('fitTableSheet', () => {
  it('uses bigger text for few tables and stays readable for many', () => {
    expect(fitTableSheet(4, 10)).toEqual({ cols: 2, nameCols: 2, fontMm: 4.6 });
    const twelve = fitTableSheet(12, 10);
    expect(twelve.cols).toBe(3);
    expect(twelve.nameCols).toBe(2);
    expect(twelve.fontMm).toBeGreaterThan(3.5);
    expect(fitTableSheet(50, 20).fontMm).toBe(2.4);
  });

  it('keeps 12 tables of 10 within the sheet height', () => {
    const { cols, nameCols, fontMm } = fitTableSheet(12, 10, 245);
    const rows = Math.ceil(12 / cols);
    const card = (1.9 + Math.ceil(10 / nameCols)) * 1.5 * fontMm + 5;
    expect(rows * card + (rows - 1) * 4).toBeLessThanOrEqual(245.5);
  });

  it('caps classroom seats at 30 mm and shrinks them for deep rooms', () => {
    expect(gridRowHeightMm(5)).toBe(30);
    const twelve = gridRowHeightMm(12);
    expect(twelve * 12 + 3 * 11 + 16).toBeLessThanOrEqual(245.2);
  });
});
