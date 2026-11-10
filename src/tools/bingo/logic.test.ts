import { describe, expect, it } from 'vitest';
import type { RandomSource } from '../random-picker/logic';
import {
  boardColumns,
  callLabel,
  cardFits,
  cardKey,
  cardNumbers,
  clampMax,
  columnLetter,
  countLines,
  drawNext,
  formatHistory,
  FREE,
  generateCard,
  generateCards,
  hasFreeCenter,
  isBanded,
  MAX_CARDS,
  paginate,
  remainingNumbers,
  sanitizeDrawn,
  type Card,
  type CardSize,
} from './logic';

/** Random source that replays a fixed sequence of 32-bit values. */
function sequence(values: number[]): RandomSource {
  let i = 0;
  return (array) => {
    for (let k = 0; k < array.length; k++) array[k] = values[i++ % values.length];
    return array;
  };
}

/** Small deterministic generator, so tests that need many draws stay reproducible. */
function seeded(seed: number): RandomSource {
  let state = seed >>> 0;
  return (array) => {
    for (let k = 0; k < array.length; k++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      array[k] = state;
    }
    return array;
  };
}

describe('clampMax', () => {
  it('keeps whole numbers inside the supported range', () => {
    expect(clampMax(75)).toBe(75);
    expect(clampMax('90')).toBe(90);
    expect(clampMax(30.9)).toBe(30);
  });
  it('clamps to the limits and falls back to 75 for junk', () => {
    expect(clampMax(1)).toBe(9);
    expect(clampMax(5000)).toBe(200);
    expect(clampMax('abc')).toBe(75);
    expect(clampMax(undefined)).toBe(75);
  });
});

describe('sanitizeDrawn', () => {
  it('drops duplicates, out-of-range values and non-integers, keeping the call order', () => {
    expect(sanitizeDrawn([7, 3, 7, 0, 76, 2.5, '4', 12], 75)).toEqual([7, 3, 12]);
  });
  it('returns an empty history for anything that is not a list', () => {
    expect(sanitizeDrawn(null, 75)).toEqual([]);
    expect(sanitizeDrawn('1,2', 75)).toEqual([]);
  });
});

describe('drawNext', () => {
  it('lists what is left', () => {
    expect(remainingNumbers(9, [1, 5, 9])).toEqual([2, 3, 4, 6, 7, 8]);
  });
  it('picks by position among the numbers that are left', () => {
    // 6 numbers left: 2 3 4 6 7 8. Value 4 → index 4 → 7.
    expect(drawNext(9, [1, 5, 9], sequence([4]))).toBe(7);
  });
  it('calls every number exactly once and then stops', () => {
    const random = seeded(42);
    const drawn: number[] = [];
    for (let i = 0; i < 75; i++) {
      const n = drawNext(75, drawn, random);
      expect(n).not.toBeNull();
      drawn.push(n!);
    }
    expect(new Set(drawn).size).toBe(75);
    expect([...drawn].sort((a, b) => a - b)).toEqual(Array.from({ length: 75 }, (_, i) => i + 1));
    expect(drawNext(75, drawn, random)).toBeNull();
  });
});

describe('labels', () => {
  it('uses B I N G O only in the 75-ball game', () => {
    expect([1, 15, 16, 30, 31, 45, 46, 60, 61, 75].map((n) => columnLetter(n, 75))).toEqual([
      'B', 'B', 'I', 'I', 'N', 'N', 'G', 'G', 'O', 'O',
    ]);
    expect(columnLetter(12, 90)).toBe('');
    expect(columnLetter(0, 75)).toBe('');
    expect(columnLetter(76, 75)).toBe('');
  });
  it('formats a call and a history', () => {
    expect(callLabel(12, 75)).toBe('B-12');
    expect(callLabel(12, 90)).toBe('12');
    expect(formatHistory([12, 31, 75], 75)).toBe('B-12, N-31, O-75');
    expect(formatHistory([12, 31], 50)).toBe('12, 31');
  });
  it('lays the board out in 15 columns for 75 balls and 10 otherwise', () => {
    expect(boardColumns(75)).toBe(15);
    expect(boardColumns(90)).toBe(10);
    expect(boardColumns(25)).toBe(10);
  });
});

describe('card shape', () => {
  it('has a free square only on odd grids', () => {
    expect(hasFreeCenter({ size: 5, freeCenter: true })).toBe(true);
    expect(hasFreeCenter({ size: 3, freeCenter: true })).toBe(true);
    expect(hasFreeCenter({ size: 4, freeCenter: true })).toBe(false);
    expect(hasFreeCenter({ size: 5, freeCenter: false })).toBe(false);
  });
  it('counts the numbers a card needs', () => {
    expect(cardNumbers({ size: 5, freeCenter: true })).toBe(24);
    expect(cardNumbers({ size: 5, freeCenter: false })).toBe(25);
    expect(cardNumbers({ size: 4, freeCenter: true })).toBe(16);
    expect(cardNumbers({ size: 3, freeCenter: true })).toBe(8);
  });
  it('fits only when the range has enough numbers', () => {
    expect(cardFits({ max: 25, size: 5, freeCenter: false })).toBe(true);
    expect(cardFits({ max: 24, size: 5, freeCenter: false })).toBe(false);
    expect(cardFits({ max: 24, size: 5, freeCenter: true })).toBe(true);
    expect(cardFits({ max: 9, size: 4, freeCenter: false })).toBe(false);
  });
  it('bands the columns only when every band is at least twice the column height', () => {
    expect(isBanded({ max: 75, size: 5 })).toBe(true);
    expect(isBanded({ max: 50, size: 5 })).toBe(true);
    expect(isBanded({ max: 90, size: 5 })).toBe(true);
    expect(isBanded({ max: 25, size: 5 })).toBe(false);
    expect(isBanded({ max: 77, size: 5 })).toBe(false);
    expect(isBanded({ max: 32, size: 4 })).toBe(true);
  });
});

function flat(card: Card): number[] {
  return card.flat().filter((n) => n !== FREE);
}

describe('generateCard', () => {
  it('makes a 75-ball card with each column in its own band and a free centre', () => {
    const random = seeded(7);
    for (let i = 0; i < 50; i++) {
      const card = generateCard({ max: 75, size: 5, freeCenter: true }, random);
      expect(card).toHaveLength(5);
      expect(card[2][2]).toBe(FREE);
      const numbers = flat(card);
      expect(numbers).toHaveLength(24);
      expect(new Set(numbers).size).toBe(24);
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const n = card[row][col];
          if (n === FREE) continue;
          expect(n).toBeGreaterThanOrEqual(col * 15 + 1);
          expect(n).toBeLessThanOrEqual(col * 15 + 15);
        }
      }
    }
  });
  it('uses every number once when the range equals the grid (1–25 on 5×5)', () => {
    const card = generateCard({ max: 25, size: 5, freeCenter: false }, seeded(3));
    expect(flat(card).sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });
  it('keeps numbers distinct and in range for every size and range', () => {
    const random = seeded(11);
    for (const size of [3, 4, 5] as CardSize[]) {
      for (const max of [25, 30, 50, 75, 90, 200]) {
        for (const freeCenter of [true, false]) {
          const options = { max, size, freeCenter };
          const numbers = flat(generateCard(options, random));
          expect(numbers).toHaveLength(cardNumbers(options));
          expect(new Set(numbers).size).toBe(numbers.length);
          expect(Math.min(...numbers)).toBeGreaterThanOrEqual(1);
          expect(Math.max(...numbers)).toBeLessThanOrEqual(max);
        }
      }
    }
  });
  it('ignores the free square on a 4×4 card', () => {
    const card = generateCard({ max: 50, size: 4, freeCenter: true }, seeded(5));
    expect(card.flat()).not.toContain(FREE);
  });
  it('refuses a range that cannot fill the card', () => {
    expect(() => generateCard({ max: 20, size: 5, freeCenter: true })).toThrow(RangeError);
  });
});

describe('generateCards', () => {
  it('returns the requested number of cards, all different', () => {
    const cards = generateCards(120, { max: 75, size: 5, freeCenter: true }, seeded(99));
    expect(cards).toHaveLength(120);
    expect(new Set(cards.map(cardKey)).size).toBe(120);
  });
  it('caps the count and treats junk as zero', () => {
    expect(generateCards(5000, { max: 75, size: 5, freeCenter: true }, seeded(1))).toHaveLength(MAX_CARDS);
    expect(generateCards(Number.NaN, { max: 75, size: 5, freeCenter: true })).toEqual([]);
    expect(generateCards(-3, { max: 75, size: 5, freeCenter: true })).toEqual([]);
  });
  it('stops instead of looping when the same card keeps coming up', () => {
    const cards = generateCards(10, { max: 25, size: 5, freeCenter: false }, sequence([0]));
    expect(cards).toHaveLength(1);
  });
});

describe('countLines', () => {
  const card: Card = [
    [1, 16, 31, 46, 61],
    [2, 17, 32, 47, 62],
    [3, 18, FREE, 48, 63],
    [4, 19, 34, 49, 64],
    [5, 20, 35, 50, 65],
  ];
  it('counts nothing before any line is complete', () => {
    expect(countLines(card, [])).toBe(0);
    expect(countLines(card, [1, 16, 31, 46])).toBe(0);
  });
  it('counts rows, columns and diagonals, with the free square already marked', () => {
    expect(countLines(card, [1, 16, 31, 46, 61])).toBe(1);
    expect(countLines(card, [3, 18, 48, 63])).toBe(1);
    expect(countLines(card, [1, 17, 49, 65])).toBe(1);
    expect(countLines(card, [5, 19, 47, 61])).toBe(1);
    expect(countLines(card, [1, 2, 3, 4, 5, 18, 48, 63])).toBe(2);
  });
  it('counts all 12 lines on a full card', () => {
    expect(countLines(card, card.flat())).toBe(12);
  });
});

describe('paginate', () => {
  it('splits into pages of the given size', () => {
    expect(paginate([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(paginate([], 4)).toEqual([]);
    expect(paginate([1, 2], 0)).toEqual([[1], [2]]);
  });
});
