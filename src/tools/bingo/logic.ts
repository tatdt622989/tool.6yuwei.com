// Bingo caller and card generator. Pure functions; randomness is injected for testability.
import { randomIndex, shuffle, type RandomSource } from '../random-picker/logic';

export const MIN_MAX = 9;
export const MAX_MAX = 200;
export const DEFAULT_MAX = 75;
/** Ranges offered as one-tap choices: 5×5 self-filled, 50-ball, the 75-ball standard and the UK 90-ball game. */
export const PRESETS = [25, 50, 75, 90] as const;
export const LETTERS = ['B', 'I', 'N', 'G', 'O'] as const;
/** The 75-ball game is the only one whose columns have letters. */
export const LETTERED_MAX = 75;

/** A whole number of balls within the supported range; anything unreadable falls back to the default. */
export function clampMax(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_MAX;
  return Math.min(MAX_MAX, Math.max(MIN_MAX, n));
}

/** Keeps the valid, distinct numbers of a stored draw history, in the order they were called. */
export function sanitizeDrawn(drawn: unknown, max: number): number[] {
  if (!Array.isArray(drawn)) return [];
  const seen = new Set<number>();
  for (const value of drawn) {
    if (Number.isInteger(value) && value >= 1 && value <= max) seen.add(value);
  }
  return [...seen];
}

export function remainingNumbers(max: number, drawn: readonly number[]): number[] {
  const called = new Set(drawn);
  const left: number[] = [];
  for (let n = 1; n <= max; n++) if (!called.has(n)) left.push(n);
  return left;
}

/** The next ball: every number that has not been called is equally likely. Null once all are out. */
export function drawNext(max: number, drawn: readonly number[], random?: RandomSource): number | null {
  const left = remainingNumbers(max, drawn);
  if (left.length === 0) return null;
  return left[randomIndex(left.length, random)];
}

/** 'B' for 1–15, 'I' for 16–30 and so on in the 75-ball game; empty for every other range. */
export function columnLetter(n: number, max: number): string {
  if (max !== LETTERED_MAX || !Number.isInteger(n) || n < 1 || n > max) return '';
  return LETTERS[Math.floor((n - 1) / 15)];
}

/** "B-12" in the 75-ball game, "12" otherwise. */
export function callLabel(n: number, max: number): string {
  const letter = columnLetter(n, max);
  return letter ? `${letter}-${n}` : String(n);
}

/** Columns of the caller's board: 15 per letter row in the 75-ball game, 10 otherwise. */
export function boardColumns(max: number): number {
  return max === LETTERED_MAX ? 15 : 10;
}

export function formatHistory(drawn: readonly number[], max: number): string {
  return drawn.map((n) => callLabel(n, max)).join(', ');
}

/* ---------- Cards ---------- */

export const CARD_SIZES = [3, 4, 5] as const;
export type CardSize = (typeof CARD_SIZES)[number];
export const MAX_CARDS = 200;
/** 0 marks the free square. */
export const FREE = 0;
export type Card = number[][];

export interface CardOptions {
  max: number;
  size: CardSize;
  /** Only odd grids have a centre square; the flag is ignored for 4×4. */
  freeCenter: boolean;
}

export function hasFreeCenter({ size, freeCenter }: Pick<CardOptions, 'size' | 'freeCenter'>): boolean {
  return freeCenter && size % 2 === 1;
}

/** How many different numbers one card needs. */
export function cardNumbers(options: Pick<CardOptions, 'size' | 'freeCenter'>): number {
  return options.size * options.size - (hasFreeCenter(options) ? 1 : 0);
}

/** A card can only be filled when the range has at least as many numbers as the card has squares. */
export function cardFits(options: CardOptions): boolean {
  return options.max >= cardNumbers(options);
}

/**
 * Whether each column draws from its own band of numbers, as on a 75-ball card (B 1–15, I 16–30…).
 * Needs equal bands at least twice as tall as the column, so that cards still differ from one another.
 */
export function isBanded({ max, size }: Pick<CardOptions, 'max' | 'size'>): boolean {
  return max % size === 0 && max / size >= size * 2;
}

/** One card as rows of numbers. Banded ranges fill column by column; other ranges place any numbers anywhere. */
export function generateCard(options: CardOptions, random?: RandomSource): Card {
  if (!cardFits(options)) throw new RangeError(`A ${options.size}×${options.size} card needs more than ${options.max} numbers`);
  const { max, size } = options;
  const free = hasFreeCenter(options);
  const mid = (size - 1) / 2;
  const card: Card = Array.from({ length: size }, () => new Array<number>(size).fill(FREE));

  if (isBanded(options)) {
    const band = max / size;
    for (let col = 0; col < size; col++) {
      const pool = shuffle(Array.from({ length: band }, (_, i) => col * band + i + 1), random);
      for (let row = 0; row < size; row++) card[row][col] = pool[row];
    }
  } else {
    const pool = shuffle(Array.from({ length: max }, (_, i) => i + 1), random);
    let next = 0;
    for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) card[row][col] = pool[next++];
  }
  if (free) card[mid][mid] = FREE;
  return card;
}

export function cardKey(card: Card): string {
  return card.map((row) => row.join(',')).join('|');
}

/** `count` cards with no two alike. Tiny ranges may not have that many different cards; then fewer come back. */
export function generateCards(count: number, options: CardOptions, random?: RandomSource): Card[] {
  const wanted = Math.max(0, Math.min(MAX_CARDS, Math.floor(count) || 0));
  const cards: Card[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  while (cards.length < wanted && attempts < wanted * 20 + 100) {
    attempts++;
    const card = generateCard(options, random);
    const key = cardKey(card);
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push(card);
  }
  return cards;
}

/** Completed rows, columns and diagonals on a card, given the numbers called so far. */
export function countLines(card: Card, drawn: readonly number[]): number {
  const called = new Set(drawn);
  const size = card.length;
  const hit = (row: number, col: number) => card[row][col] === FREE || called.has(card[row][col]);
  const index = Array.from({ length: size }, (_, i) => i);
  let lines = 0;
  for (const i of index) {
    if (index.every((j) => hit(i, j))) lines++;
    if (index.every((j) => hit(j, i))) lines++;
  }
  if (index.every((i) => hit(i, i))) lines++;
  if (index.every((i) => hit(i, size - 1 - i))) lines++;
  return lines;
}

/** Splits cards into printed pages. */
export function paginate<T>(items: readonly T[], perPage: number): T[][] {
  const size = Math.max(1, Math.floor(perPage));
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}
